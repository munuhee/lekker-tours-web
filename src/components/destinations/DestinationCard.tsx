import Image from 'next/image';
import Link from 'next/link';
import type { Destination } from '@/types';

export function DestinationCard({
  destination,
  size = 'default',
}: {
  destination: Destination;
  size?: 'default' | 'tall';
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={`group relative block overflow-hidden rounded-card ${
        size === 'tall' ? 'aspect-[3/4]' : 'aspect-[4/3]'
      }`}
    >
      <Image
        src={destination.cardImage.url}
        alt={destination.cardImage.alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-soft group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="mb-1.5 text-[0.65rem] uppercase tracking-[0.22em] text-amber-400">
          {destination.categoryLabel ?? destination.country}
        </p>
        <h3 className="font-display text-2xl text-white">{destination.name}</h3>
        {destination.tagline ? (
          <p className="mt-1.5 line-clamp-2 text-sm text-sand-100/80">{destination.tagline}</p>
        ) : null}

        <p className="mt-4 inline-flex items-center gap-2 text-xs text-sand-100/70 transition-colors group-hover:text-amber-400">
          {destination.parkCount} {destination.parkCount === 1 ? 'park' : 'parks & regions'}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
