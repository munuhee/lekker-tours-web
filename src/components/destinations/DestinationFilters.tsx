'use client';

import { useState, useMemo } from 'react';
import { DestinationCard } from './DestinationCard';
import { Reveal } from '@/components/ui/Reveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import type { Destination } from '@/types';

const COUNTRIES = ['All', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Zanzibar'] as const;

/**
 * Search box plus pill filter tabs over the destination grid. Filtering is
 * client-side because the full set is small and already loaded.
 */
export function DestinationFilters({ destinations }: { destinations: Destination[] }) {
  const [country, setCountry] = useState<string>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter((d) => {
      if (country !== 'All' && d.country !== country) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.tagline?.toLowerCase().includes(q) ||
        d.overview.toLowerCase().includes(q) ||
        d.parks?.some((p) => p.name.toLowerCase().includes(q))
      );
    });
  }, [destinations, country, query]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3" role="group" aria-label="Filter by country">
        {COUNTRIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCountry(c)}
            aria-pressed={country === c}
            className={`rounded-full px-5 py-2.5 text-sm transition-all duration-300 ${
              country === c
                ? 'bg-forest-900 text-sand-50'
                : 'border border-sand-300 text-forest-900 hover:border-forest-900'
            }`}
          >
            {c}
          </button>
        ))}

        <label className="ml-auto flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-sand-300 bg-white px-4 py-2.5 sm:flex-none">
          <span className="sr-only">Search destinations</span>
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a park or country"
            className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
          />
        </label>
      </div>

      <p className="mb-6 text-sm text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'destination' : 'destinations'}
        {country !== 'All' ? ` in ${country}` : ''}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing matches that search"
          message="Try a different country or clear the search. Our specialists can also plan around anywhere in East Africa."
          action={<ButtonLink href="/contact">Talk to a specialist</ButtonLink>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((destination, i) => (
            <Reveal key={destination._id} delay={i * 70}>
              <DestinationCard destination={destination} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0 text-muted"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
