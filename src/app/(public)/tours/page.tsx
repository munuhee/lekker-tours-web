import type { Metadata } from 'next';
import Link from 'next/link';
import { PageBanner } from '@/components/ui/PageBanner';
import { TourCard } from '@/components/tours/TourCard';
import { TourFilters } from '@/components/tours/TourFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import { apiListSafe } from '@/lib/api';
import { TAGS } from '@/lib/tags';
import type { Tour } from '@/types';

export const metadata: Metadata = {
  title: 'Safari Expeditions & Weekend Escapes',
  description:
    'Browse every Lekker Tours expedition across Kenya, Tanzania, Uganda, Rwanda and Zanzibar — from 48-hour escapes to ten-day journeys.',
};

// Next 15: searchParams is a Promise and must be awaited.
export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (key: string) => (Array.isArray(sp[key]) ? sp[key][0] : sp[key]) as string | undefined;

  const page = Number(one('page') ?? 1);
  const query = new URLSearchParams({ page: String(page), limit: '12' });
  for (const key of ['category', 'country', 'sort', 'q'] as const) {
    const value = one(key);
    if (value) query.set(key, value);
  }

  const { items, meta } = await apiListSafe<Tour>(`/api/tours?${query.toString()}`, {
    tags: [TAGS.tours],
  });

  return (
    <>
      <PageBanner
        title="Witness the Theater of Nature"
        subtitle="Every journey is designed to immerse you in the landscapes where the Big Five roam and every sunrise tells a new story of the wild."
        image={{
          url: '/images/serengeti-wildebeest-grazing.jpg',
          alt: 'Herds grazing across open savanna at first light',
        }}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/tours', label: 'Expeditions' },
        ]}
      />

      <section className="bg-sand-50 py-16 md:py-20">
        <div className="container-page">
          <TourFilters total={meta?.total ?? items.length} />

          {items.length === 0 ? (
            <EmptyState
              title="No expeditions match those filters"
              message="Try widening your search, or let our specialists build something around your dates and budget instead."
              action={<ButtonLink href="/contact">Plan a custom trip</ButtonLink>}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((tour, i) => (
                  <TourCard key={tour._id} tour={tour} priority={i < 3} />
                ))}
              </div>

              {meta && meta.totalPages > 1 ? (
                <nav
                  aria-label="Pagination"
                  className="mt-12 flex items-center justify-center gap-2"
                >
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => {
                    const next = new URLSearchParams(query);
                    next.set('page', String(n));
                    return (
                      <Link
                        key={n}
                        href={`/tours?${next.toString()}`}
                        aria-current={n === meta.page ? 'page' : undefined}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
                          n === meta.page
                            ? 'bg-forest-900 text-sand-50'
                            : 'border border-sand-300 text-forest-900 hover:border-forest-900'
                        }`}
                      >
                        {n}
                      </Link>
                    );
                  })}
                </nav>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  );
}
