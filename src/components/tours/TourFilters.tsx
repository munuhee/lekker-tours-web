'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const COUNTRIES = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Zanzibar'] as const;

const CATEGORIES = [
  { value: '', label: 'All trips' },
  { value: 'SafariExpedition', label: 'Safari Expeditions' },
  { value: 'WeekendEscape', label: 'Weekend Escapes' },
] as const;

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'duration-asc', label: 'Shortest first' },
  { value: 'newest', label: 'Newest' },
] as const;

export function TourFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page'); // any filter change returns to the first page
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const category = params.get('category') ?? '';
  const country = params.get('country') ?? '';
  const sort = params.get('sort') ?? 'recommended';
  const hasFilters = Boolean(category || country || params.get('q'));

  return (
    <div className="mb-10 space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by trip type">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setParam('category', c.value)}
            aria-pressed={category === c.value}
            className={`rounded-full px-5 py-2.5 text-sm transition-all duration-300 ${
              category === c.value
                ? 'bg-forest-900 text-sand-50'
                : 'border border-sand-300 text-forest-900 hover:border-forest-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by country">
        <button
          type="button"
          onClick={() => setParam('country', '')}
          aria-pressed={country === ''}
          className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-all duration-300 ${
            country === '' ? 'bg-amber-500 text-forest-950' : 'bg-sand-100 text-muted hover:bg-sand-200'
          }`}
        >
          All countries
        </button>
        {COUNTRIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setParam('country', c)}
            aria-pressed={country === c}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-all duration-300 ${
              country === c ? 'bg-amber-500 text-forest-950' : 'bg-sand-100 text-muted hover:bg-sand-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sand-200 pt-5">
        <p className="text-sm text-muted" aria-live="polite">
          {total} {total === 1 ? 'expedition' : 'expeditions'}
          {hasFilters ? ' matching your filters' : ' available'}
        </p>

        <div className="flex items-center gap-3">
          {hasFilters ? (
            <button
              type="button"
              onClick={() => router.push(pathname, { scroll: false })}
              className="text-sm text-muted underline transition-colors hover:text-forest-900"
            >
              Clear filters
            </button>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="sr-only sm:not-sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-forest-900 focus:border-amber-500 focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
