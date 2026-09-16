import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { ToastProvider } from '@/components/admin/Toasts';
import { getCurrentAdmin, adminCookieHeader } from '@/lib/auth';
import { API_URL } from '@/lib/api';

/**
 * The admin area is deliberately unlinked from the public site. It is reachable
 * only by typing the URL, and search engines are told to ignore it here and in
 * robots.ts.
 */
export const metadata: Metadata = {
  title: 'Admin — Lekker Tours',
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Drives the nav badge. The dashboard card already highlighted unread
 * enquiries, but from any other page there was no sign new ones had arrived.
 * A failure returns 0 rather than throwing — a missing badge is a smaller
 * problem than an admin area that will not render.
 */
async function loadUnreadCount(cookie?: string): Promise<number> {
  if (!cookie) return 0;
  try {
    const res = await fetch(`${API_URL}/api/admin/enquiries?limit=1&status=new`, {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) return 0;
    const payload = await res.json();
    return payload?.meta?.unreadCount ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Null on the login page too; AdminShell renders a bare frame in that case.
  const admin = await getCurrentAdmin();
  const unreadCount = admin ? await loadUnreadCount(await adminCookieHeader()) : 0;

  return (
    <div className="min-h-screen bg-sand-100">
      <ToastProvider>
        <AdminShell admin={admin} unreadCount={unreadCount}>
          {children}
        </AdminShell>
      </ToastProvider>
    </div>
  );
}
