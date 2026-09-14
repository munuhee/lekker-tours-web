import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCurrentAdmin } from '@/lib/auth';

/**
 * The admin area is deliberately unlinked from the public site. It is reachable
 * only by typing the URL, and search engines are told to ignore it here and in
 * robots.ts.
 */
export const metadata: Metadata = {
  title: 'Admin — Lekker Tours',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Null on the login page too; AdminShell renders a bare frame in that case.
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-sand-100">
      <AdminShell admin={admin}>{children}</AdminShell>
    </div>
  );
}
