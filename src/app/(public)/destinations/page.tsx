import type { Metadata } from 'next';
import { PageBanner } from '@/components/ui/PageBanner';
import { DestinationCard } from '@/components/destinations/DestinationCard';
import { DestinationFilters } from '@/components/destinations/DestinationFilters';
import { IconicExperiences } from '@/components/destinations/IconicExperiences';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { apiListSafe } from '@/lib/api';
import { TAGS } from '@/lib/tags';
import type { Destination } from '@/types';

export const metadata: Metadata = {
  title: 'Destinations across East Africa',
  description:
    'Kenya, Tanzania, Uganda, Rwanda and Zanzibar: the parks, reserves and coastlines we travel, and when to visit each.',
};

export default async function DestinationsPage() {
  const { items } = await apiListSafe<Destination>('/api/destinations?limit=20', {
    tags: [TAGS.destinations],
  });

  return (
    <>
      <PageBanner
        title="Five countries, one extraordinary continent"
        subtitle="The wild places, highland forests and ocean shores that shape an East African journey."
        image={{
          url: '/images/ngorongoro-crater-landscape.jpg',
          alt: 'The Ngorongoro Crater floor seen from the rim at dawn',
        }}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/destinations', label: 'Destinations' },
        ]}
      />

      {/* Country feature row: the five countries as large overlaid cards. */}
      <section className="bg-sand-50 py-12 sm:py-16 md:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Where we travel"
            title="Choose your country"
            description="Each destination page lists its parks and reserves, the wildlife you can expect, and the months that suit each best."
          />

          {items.length === 0 ? (
            <EmptyState
              title="Destinations coming soon"
              message="We are preparing our destination guides. In the meantime, our specialists can talk you through any part of East Africa."
              action={<ButtonLink href="/contact">Talk to a specialist</ButtonLink>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.slice(0, 5).map((destination, i) => (
                <Reveal
                  key={destination._id}
                  delay={i * 80}
                  className={i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}
                >
                  <DestinationCard destination={destination} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <IconicExperiences destinations={items} />

      {/* Searchable, filterable grid of everywhere we go. */}
      {items.length > 0 ? (
        <section className="bg-sand-50 py-12 sm:py-16 md:py-24">
          <div className="container-page">
            <SectionHeading
              eyebrow="All destinations"
              title="Everywhere we travel"
              description="Filter by country, or search for a park by name."
              align="left"
            />
            <DestinationFilters destinations={items} />
          </div>
        </section>
      ) : null}

      <section className="bg-forest-950 py-12 sm:py-16 md:py-20">
        <div className="container-page text-center">
          <h2 className="mx-auto max-w-2xl text-3xl text-sand-50">Not sure where to start?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand-200/75">
            Tell us your dates, your budget and what you most want to see. We will tell you honestly
            where and when to go.
          </p>
          <div className="mt-8">
            <ButtonLink href="/contact" size="lg">
              Start your journey
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
