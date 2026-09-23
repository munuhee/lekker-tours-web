import Image from 'next/image';
import Link from 'next/link';
import type { Tour } from '@/types';

/** Short banner with a back link, country chip, title and inline icon metadata. */
export function TourBanner({ tour, country }: { tour: Tour; country?: string | null }) {
  return (
    <section className="relative flex min-h-[52vh] items-end overflow-hidden md:min-h-[58vh]">
      <Image
        src={tour.heroImage.url}
        alt={tour.heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/45 to-forest-950/30" />

      <div className="container-page relative z-10 pb-10 pt-32">
        <Link
          href="/tours"
          className="mb-4 inline-flex items-center gap-2 text-xs text-sand-100/80 transition-colors hover:text-amber-400"
        >
          <span aria-hidden>←</span> All tours
        </Link>

        {country ? (
          <p className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-[0.7rem] text-sand-50 backdrop-blur-sm">
              <PinIcon />
              {country}
            </span>
          </p>
        ) : null}

        <h1 className="max-w-3xl font-display text-3xl leading-tight text-white md:text-[2.7rem]">
          {tour.title}
        </h1>

        <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8rem] text-sand-100/85">
          <li className="inline-flex items-center gap-1.5">
            <ClockIcon />
            {tour.durationDays} Days
          </li>
          <li className="inline-flex items-center gap-1.5">
            <UsersIcon />
            0-{tour.groupSizeMax} guests
          </li>
          {tour.parks?.length ? (
            <li className="inline-flex items-center gap-1.5">
              <TagIcon />
              {tour.parks.slice(0, 3).join(' · ')}
            </li>
          ) : null}
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden className="text-amber-400">
              {'★'.repeat(Math.round(tour.rating))}
            </span>
            <span>
              {tour.rating.toFixed(1)} ({tour.reviewCount})
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0M16 5.5a3.2 3.2 0 0 1 0 5M18 20a5.5 5.5 0 0 0-2-4" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 12V4h8l9 9-8 8-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" />
    </svg>
  );
}
