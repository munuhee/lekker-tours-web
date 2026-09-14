'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { TourForm } from '@/components/admin/TourForm';
import { StatusPill } from '@/components/admin/StatusPill';
import type { Tour, Destination } from '@/types';

export default function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  // Next 15: params is a Promise; `use` unwraps it in a client component.
  const { id } = use(params);

  const [tour, setTour] = useState<Tour | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.get<Tour>(`/api/admin/tours/${id}`),
      adminApi.list<Destination>('/api/admin/destinations?limit=50').catch(() => ({ items: [] })),
    ])
      .then(([t, d]) => {
        setTour(t);
        setDestinations(d.items);
      })
      .catch((err) =>
        setError(err instanceof AdminApiError ? err.message : 'Could not load this tour.')
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-sand-200" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-card bg-white" />
        ))}
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="max-w-xl rounded-card border border-sand-200 bg-white p-8 text-center">
        <h1 className="mb-3 text-xl">Tour not found</h1>
        <p className="mb-6 text-sm text-muted">{error || 'This tour may have been deleted.'}</p>
        <Link href="/admin/tours" className="text-sm text-forest-700 underline">
          Back to tours
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <nav className="mb-5 text-sm">
        <Link href="/admin/tours" className="text-muted hover:underline">
          ← Back to tours
        </Link>
      </nav>

      <header className="mb-7 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{tour.title}</h1>
        <StatusPill status={tour.status} />
        {tour.status === 'published' ? (
          <Link
            href={`/tours/${tour.slug}`}
            target="_blank"
            className="text-sm text-forest-700 underline"
          >
            View live ↗
          </Link>
        ) : null}
      </header>

      <TourForm tour={tour} destinations={destinations} />
    </div>
  );
}
