'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import type { AdminUser } from '@/lib/auth';

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/tours', label: 'Tours' },
  { href: '/admin/destinations', label: 'Destinations' },
  { href: '/admin/blog', label: 'Blog posts' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/faqs', label: 'FAQs' },
  { href: '/admin/enquiries', label: 'Enquiries' },
  { href: '/admin/settings', label: 'Site settings' },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: AdminUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // The login page renders without the shell chrome.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  async function logout() {
    try {
      await adminApi.post('/api/auth/logout', {});
    } catch {
      // Even if the call fails, send them to the login screen.
    }
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-forest-950 text-sand-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-display text-lg text-sand-50">Lekker Admin</span>
        </div>

        <nav className="flex flex-col gap-0.5 p-3" aria-label="Admin sections">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  active ? 'bg-amber-500 text-forest-950' : 'text-sand-200/80 hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-4">
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
                className="w-full rounded-lg border border-white/20 py-2 text-xs text-sand-100 transition-colors hover:border-amber-500 hover:text-amber-400"
              >
                Sign out
              </button>
            </>
          ) : null}
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-sand-200 bg-white px-5 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="text-forest-900"
          >
            ☰
          </button>
          <span className="font-display text-lg">Lekker Admin</span>
        </header>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
