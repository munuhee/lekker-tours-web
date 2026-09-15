import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin, adminCookieHeader } from '@/lib/auth';
import { API_URL } from '@/lib/api';

/**
 * `null` means the count could not be loaded — distinct from a real zero. A
 * dead API used to render a confident "0 Tours, 0 Enquiries", which reads as
 * data loss rather than a connection problem.
 */
type Count = number | null;

interface Counts {
  tours: Count;
  drafts: Count;
  destinations: Count;
  blog: Count;
  testimonials: Count;
  faqs: Count;
  enquiries: Count;
  newEnquiries: Count;
  failed: boolean;
}

async function loadCounts(cookie?: string): Promise<Counts> {
  const unknown: Counts = {
    tours: null,
    drafts: null,
    destinations: null,
    blog: null,
    testimonials: null,
    faqs: null,
    enquiries: null,
    newEnquiries: null,
    failed: true,
  };
  if (!cookie) return unknown;

  const get = async (path: string) => {
    try {
      const res = await fetch(`${API_URL}${path}`, { headers: { cookie }, cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const [tours, drafts, destinations, blog, testimonials, faqs, enquiries] = await Promise.all([
    get('/api/admin/tours?limit=1'),
    get('/api/admin/tours?limit=1&status=draft'),
    get('/api/admin/destinations?limit=1'),
    get('/api/admin/blog?limit=1'),
    get('/api/admin/testimonials?limit=1'),
    get('/api/admin/faqs?limit=1'),
    get('/api/admin/enquiries?limit=1'),
  ]);

  const responses = [tours, drafts, destinations, blog, testimonials, faqs, enquiries];
  const total = (res: unknown) =>
    (res as { meta?: { total?: number } } | null)?.meta?.total ?? null;

  return {
    tours: total(tours),
    drafts: total(drafts),
    destinations: total(destinations),
    blog: total(blog),
    testimonials: total(testimonials),
    faqs: total(faqs),
    enquiries: total(enquiries),
    newEnquiries: enquiries?.meta?.unreadCount ?? null,
    failed: responses.some((r) => r === null),
  };
}

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const cookie = await adminCookieHeader();
  const counts = await loadCounts(cookie);

  const unread = counts.newEnquiries;

  const cards = [
    {
      label: 'Tours',
      value: counts.tours,
      hint: counts.drafts === null ? undefined : `${counts.drafts} in draft`,
      href: '/admin/tours',
    },
    { label: 'Destinations', value: counts.destinations, href: '/admin/destinations' },
    { label: 'Blog posts', value: counts.blog, href: '/admin/blog' },
    { label: 'Testimonials', value: counts.testimonials, href: '/admin/testimonials' },
    { label: 'FAQs', value: counts.faqs, href: '/admin/faqs' },
    {
      label: 'Enquiries',
      value: counts.enquiries,
      hint: unread === null ? undefined : unread > 0 ? `${unread} unread` : 'All read',
      href: '/admin/enquiries',
      highlight: unread !== null && unread > 0,
    },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl">Welcome back, {admin.name.split(' ')[0]}</h1>
        <p className="mt-2 text-sm text-muted">
          Everything published here appears on the public site within moments.
        </p>
      </header>

      {counts.failed ? (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700"
        >
          Some counts could not be loaded — the API may be unreachable. Figures shown as “—”
          are unknown, not zero.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-card border bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card ${
              card.highlight ? 'border-amber-400' : 'border-sand-200'
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-muted">{card.label}</p>
            <p className="mt-2 font-display text-4xl text-forest-900">
              {card.value === null ? (
                <span className="text-sand-300" title="Could not load">
                  —
                </span>
              ) : (
                card.value
              )}
            </p>
            {card.hint ? (
              <p className={`mt-1 text-xs ${card.highlight ? 'text-amber-600' : 'text-muted'}`}>
                {card.hint}
              </p>
            ) : null}
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-card border border-sand-200 bg-white p-7">
        <h2 className="mb-4 text-xl">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/tours/new', label: 'New tour' },
            { href: '/admin/blog/new', label: 'New blog post' },
            { href: '/admin/destinations/new', label: 'New destination' },
            { href: '/admin/settings', label: 'Edit homepage content' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full bg-forest-900 px-5 py-2.5 text-sm text-sand-50 transition-colors hover:bg-amber-500 hover:text-forest-950"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
