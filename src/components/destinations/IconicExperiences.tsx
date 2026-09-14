import Image from 'next/image';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import type { Destination } from '@/types';

/**
 * A four-card row of standout parks pulled from across the destinations,
 * sitting between the country feature block and the filtered grid.
 */
export function IconicExperiences({ destinations }: { destinations: Destination[] }) {
  // Take the first park from each of the first four destinations.
  const picks = destinations
    .map((destination) => {
      const park = destination.parks?.[0];
      return park ? { destination, park } : null;
    })
    .filter((x): x is { destination: Destination; park: NonNullable<Destination['parks'][number]> } =>
      Boolean(x)
    )
    .slice(0, 4);

  if (picks.length === 0) return null;

  return (
    <section className="bg-white py-12 sm:py-16 md:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Iconic experiences"
          title="The places people travel a long way to see"
          description="A starting point if you are not sure which country suits you."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map(({ destination, park }, i) => (
            <Reveal key={`${destination.slug}-${park.name}`} delay={i * 80}>
              <Link
                href={`/destinations/${destination.slug}`}
                className="group block h-full overflow-hidden rounded-card border border-sand-200 bg-white transition-all duration-500 ease-soft hover:-translate-y-1 hover:shadow-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={park.image?.url ?? destination.cardImage.url}
                    alt={park.image?.alt ?? destination.cardImage.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="mb-1.5 text-[0.65rem] uppercase tracking-[0.2em] text-amber-600">
                    {destination.country}
                  </p>
                  <h3 className="mb-2 text-base leading-snug">{park.name}</h3>
                  {park.blurb ? (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted">{park.blurb}</p>
                  ) : null}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
