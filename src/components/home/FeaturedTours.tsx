import { TourCard } from '@/components/tours/TourCard';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Tour } from '@/types';

export function FeaturedTours({ tours }: { tours: Tour[] }) {
  return (
    <section className="bg-sand-50 py-12 sm:py-16 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Hand-picked"
          title="Our best-selling tours"
          action={
            <ButtonLink href="/tours" variant="ghost">
              View all trips →
            </ButtonLink>
          }
        />

        {tours.length === 0 ? (
          <EmptyState
            title="No expeditions published yet"
            message="Our specialists are preparing the next set of journeys. Please check back shortly, or get in touch and we will plan something bespoke."
            action={<ButtonLink href="/contact">Talk to a specialist</ButtonLink>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour, i) => (
              <Reveal key={tour._id} delay={i * 80}>
                <TourCard tour={tour} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
