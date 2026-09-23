'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import type { AdminUser } from '@/lib/auth';

/**
 * `needs` is the permission required to see the entry. Entries without one are
 * shown to everyone who can reach the dashboard at all. Hiding a link is a
 * convenience, not the control: every route is enforced by the API.
 */
const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/tours', label: 'Tours', needs: 'tours.view' },
  { href: '/admin/destinations', label: 'Destinations', needs: 'destinations.view' },
  { href: '/admin/blog', label: 'Blog posts', needs: 'blog.view' },
  { href: '/admin/testimonials', label: 'Testimonials', needs: 'testimonials.view' },
  { href: '/admin/faqs', label: 'FAQs', needs: 'faqs.view' },
  { href: '/admin/enquiries', label: 'Enquiries', badge: 'attention', needs: 'enquiries.view' },
  { href: '/admin/settings', label: 'Site settings', needs: 'settings.edit' },
  { href: '/admin/users', label: 'Users', needs: 'users.view' },
  { href: '/admin/roles', label: 'Roles', needs: 'users.view' },
  { href: '/admin/audit', label: 'Audit log', needs: 'audit.view' },
];

export function AdminShell({
  admin,
  attentionCount = 0,
  children,
}: {
  admin: AdminUser | null;
  /** Enquiries unassigned or past their follow-up date, work, not unread mail. */
  attentionCount?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  // The drawer is only a drawer below lg; above it the sidebar is static and
  // must stay reachable, so the inert treatment is scoped to mobile widths.
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // An account predating the roles table reports no permissions at all. Hiding
  // every link would strand it, so an absent list falls back to showing
  // everything and letting the API refuse what it must.
  const permissions = admin?.permissions;
  const visibleNav = permissions
    ? NAV.filter((item) => !item.needs || permissions.includes(item.needs))
    : NAV;

  // The login page renders without the shell chrome.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  /**
   * Only leave once the server has actually cleared the cookie. Pretending to
   * sign out while the session is still live is worse than showing an error,
   * on a shared machine the next person can navigate straight back in.
   */
  async function logout() {
    setSigningOut(true);
    setLogoutError('');
    try {
      await adminApi.post('/api/auth/logout', {});
    } catch {
      setLogoutError('Could not sign out. Check your connection and try again.');
      setSigningOut(false);
      return;
    }
    // Full reload so no client cache outlives the session.
    window.location.assign('/admin/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Off-screen via translate still leaves links focusable, so tabbing used
          to land on invisible nav items. inert removes them from the tab order
          and the accessibility tree while the drawer is closed on mobile. */}
      {/* lg:sticky rather than lg:static: as a plain flex child the sidebar
          scrolled away on long list and form pages. Sticky pins it for the
          full viewport height while leaving it in normal flow, so the main
          column still sits beside it. */}
      <aside
        inert={!open && isMobile ? true : undefined}
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-forest-950 text-sand-100 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-display text-lg text-sand-50">Lekker Admin</span>
        </div>

        {/* Scrolls internally if the nav ever outgrows a short viewport. */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Admin sections">
          {visibleNav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const badge = item.badge === 'attention' && attentionCount > 0 ? attentionCount : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  active ? 'bg-amber-500 text-forest-950' : 'text-sand-200/80 hover:bg-white/10'
                }`}
              >
                {item.label}
                {badge > 0 ? (
                  <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs ${
                      active ? 'bg-forest-950 text-amber-400' : 'bg-amber-500 text-forest-950'
                    }`}
                  >
                    {badge > 99 ? '99+' : badge}
                    <span className="sr-only"> needing attention</span>
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Was absolute inset-x-0 bottom-0, which anchored to the aside's own
            box once it stopped being fixed on desktop. As a flex child after a
            flex-1 nav it sits at the bottom in both layouts. */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <Link
            href="/"
            target="_blank"
            className="mb-3 block text-xs text-sand-200/60 transition-colors hover:text-amber-400"
          >
            View public site ↗
          </Link>
          {admin ? (
            <>
              <p className="truncate text-sm text-sand-50">{admin.name}</p>
              <p className="mb-3 truncate text-xs text-sand-200/60">{admin.email}</p>
              <button
                type="button"
                onClick={logout}
                disabled={signingOut}
                className="w-full rounded-lg border border-white/20 py-2 text-xs text-sand-100 transition-colors hover:border-amber-500 hover:text-amber-400 disabled:opacity-60"
              >
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
              {logoutError ? (
                <p role="alert" className="mt-2 text-xs text-amber-400">
                  {logoutError}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </aside>

      {/* A plain div, not a button: a full-viewport focusable element sat in the
          tab order and was announced as a button to screen readers. Escape and
          the in-drawer links already provide keyboard dismissal. */}
      {open ? (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Below lg this bar is the only way to reach the nav, so it stays put
            as the page scrolls. z-20 keeps it under the drawer and overlay. */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-sand-200 bg-white px-5 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-xl text-forest-900 transition-colors hover:bg-sand-100"
          >
            ☰
          </button>
          <span className="font-display text-lg">Lekker Admin</span>
          {attentionCount > 0 ? (
            <Link
              href="/admin/enquiries"
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs text-forest-950"
            >
              {attentionCount > 99 ? '99+' : attentionCount}
              <span>to action</span>
            </Link>
          ) : null}
        </header>

        {/* Centre the content column and cap it: with a 256px sidebar on the
            left, a page left-aligned in a 2560px viewport strands everything
            right of ~1050px as dead space. mx-auto balances the gutters. */}
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
