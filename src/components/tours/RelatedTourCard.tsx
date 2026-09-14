import Image from 'next/image';
import Link from 'next/link';
import type { Tour } from '@/types';

/** Compact card for the "You might also like" row — lighter than the main TourCard. */
export function RelatedTourCard({ tour }: { tour: Tour }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-sand-200 bg-white transition-all duration-500 ease-soft hover:-translate-y-1 hover:shadow-card">
      <Link href={`/tours/${tour.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={tour.heroImage.url}
          alt={tour.heroImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
        />
        {tour.countries?.length ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-[0.68rem] text-forest-900 backdrop-blur-sm">
            <PinIcon />
            {tour.countries.join(' · ')}
          </span>
        ) : null}
      </Link>

      <div className="p-4">
        <h3 className="mb-1.5 font-display text-[0.95rem] leading-snug">
          <Link href={`/tours/${tour.slug}`} className="transition-colors hover:text-forest-500">
            {tour.title}
          </Link>
        </h3>
        <p className="mb-3 text-xs text-muted">{tour.durationDays} Days</p>
        <Link
          href={`/tours/${tour.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-700 transition-colors hover:text-amber-600"
        >
          View trip
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </article>
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
