import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin, adminCookieHeader } from '@/lib/auth';
import { API_URL } from '@/lib/api';

interface Counts {
  tours: number;
  drafts: number;
  destinations: number;
  blog: number;
  testimonials: number;
  faqs: number;
  enquiries: number;
  newEnquiries: number;
}

async function loadCounts(cookie?: string): Promise<Counts> {
  const zero: Counts = {
    tours: 0,
    drafts: 0,
    destinations: 0,
    blog: 0,
    testimonials: 0,
    faqs: 0,
    enquiries: 0,
    newEnquiries: 0,
  };
  if (!cookie) return zero;

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

  return {
    tours: tours?.meta?.total ?? 0,
    drafts: drafts?.meta?.total ?? 0,
    destinations: destinations?.meta?.total ?? 0,
    blog: blog?.meta?.total ?? 0,
    testimonials: testimonials?.meta?.total ?? 0,
    faqs: faqs?.meta?.total ?? 0,
    enquiries: enquiries?.meta?.total ?? 0,
    newEnquiries: enquiries?.meta?.unreadCount ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const cookie = await adminCookieHeader();
  const counts = await loadCounts(cookie);

  const cards = [
    { label: 'Tours', value: counts.tours, hint: `${counts.drafts} in draft`, href: '/admin/tours' },
    { label: 'Destinations', value: counts.destinations, href: '/admin/destinations' },
    { label: 'Blog posts', value: counts.blog, href: '/admin/blog' },
    { label: 'Testimonials', value: counts.testimonials, href: '/admin/testimonials' },
    { label: 'FAQs', value: counts.faqs, href: '/admin/faqs' },
    {
      label: 'Enquiries',
      value: counts.enquiries,
      hint: counts.newEnquiries > 0 ? `${counts.newEnquiries} unread` : 'All read',
      href: '/admin/enquiries',
      highlight: counts.newEnquiries > 0,
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
            <p className="mt-2 font-display text-4xl text-forest-900">{card.value}</p>
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
