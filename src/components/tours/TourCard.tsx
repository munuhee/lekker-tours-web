import Image from 'next/image';
import Link from 'next/link';
import type { Tour } from '@/types';
import { formatPrice } from '@/lib/format';

/**
 * Card anatomy follows the reference site's ordering:
 * image with a duration badge top-left, then title, regions, description,
 * "From $X" and a CTA on one baseline row.
 */
export function TourCard({ tour, priority = false }: { tour: Tour; priority?: boolean }) {
  const label = tour.durationLabel || `${tour.durationDays} days`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card transition-all duration-500 ease-soft hover:-translate-y-1.5 hover:shadow-card-hover">
      <Link href={`/tours/${tour.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={tour.heroImage.url}
          alt={tour.heroImage.alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-forest-900/90 px-3 py-1.5 text-xs font-medium text-sand-50 backdrop-blur-sm">
          {label}
        </span>
        {tour.bestSelling ? (
          <span className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-forest-950">
            Best seller
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 text-xl leading-snug">
          <Link href={`/tours/${tour.slug}`} className="transition-colors hover:text-forest-500">
            {tour.title}
          </Link>
        </h3>

        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-amber-600">
          {tour.countries.join(' · ') || 'East Africa'}
        </p>

        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{tour.summary}</p>

        <div className="mb-4 flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1" aria-label={`Rated ${tour.rating} out of 5`}>
            <StarIcon />
            <span className="font-medium text-ink">{tour.rating.toFixed(1)}</span>
            <span>({tour.reviewCount})</span>
          </span>
          <span aria-hidden>·</span>
          <span>Max {tour.groupSizeMax} guests</span>
        </div>

        <div className="flex items-center justify-between border-t border-sand-200 pt-4">
          <p className="text-sm text-muted">
            From{' '}
            <span className="font-display text-xl text-forest-900">
              {formatPrice(tour.priceFrom, tour.currency)}
            </span>
          </p>
          <Link
            href={`/tours/${tour.slug}`}
            className="rounded-full bg-forest-900 px-4 py-2 text-xs font-medium text-sand-50 transition-all duration-300 hover:bg-amber-500 hover:text-forest-950"
          >
            View trip
          </Link>
        </div>
      </div>
    </article>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500" aria-hidden>
      <path d="m12 17.27 5.18 3.13-1.37-5.89 4.56-3.95-6.01-.52L12 4.5 9.64 10.04l-6.01.52 4.56 3.95-1.37 5.89z" />
    </svg>
  );
}
