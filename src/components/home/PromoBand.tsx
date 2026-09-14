import { ButtonLink } from '@/components/ui/Button';
import { ParallaxSection } from '@/components/ui/ParallaxSection';

/**
 * Full-bleed promotional band between the countries grid and traveller
 * stories. Copy is generic on purpose — no dates or prices are asserted that
 * Lekker has not set.
 */
export function PromoBand() {
  return (
    <ParallaxSection
      image={{ url: '/images/balloon-serengeti-dawn.jpg' }}
      overlay="light"
      className="py-14 sm:py-20 md:py-32"
    >
      <div className="container-page">
        <div className="max-w-xl">
          <span className="inline-block rounded-full border border-white/35 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-sand-50">
            Seasonal departures
          </span>

          <h2 className="mt-6 text-3xl leading-[1.15] text-white md:text-[2.6rem]">
            Float above the migration at sunrise.
          </h2>

          <p className="mt-5 text-base leading-relaxed text-sand-100/85">
            Add a balloon flight to any Mara or Serengeti expedition. Lift off before first light,
            drift over the herds, and land to breakfast on the plains.
          </p>

          <div className="mt-8">
            <ButtonLink href="/contact" size="lg">
              Plan my trip
            </ButtonLink>
          </div>
        </div>
      </div>
    </ParallaxSection>
  );
}
