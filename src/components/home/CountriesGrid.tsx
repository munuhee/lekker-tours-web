import { DestinationCard } from '@/components/destinations/DestinationCard';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import type { Destination } from '@/types';

/** Evenly sized cards in a compact row. */
export function CountriesGrid({ destinations }: { destinations: Destination[] }) {
  if (!destinations.length) return null;

  return (
    <section className="bg-white py-12 sm:py-16 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Where we go"
          title="Five countries. One continent of wonder."
          action={
            <ButtonLink href="/destinations" variant="ghost">
              All destinations →
            </ButtonLink>
          }
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {destinations.slice(0, 5).map((destination, i) => (
            <Reveal key={destination._id} delay={i * 70}>
              <DestinationCard destination={destination} size="tall" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
