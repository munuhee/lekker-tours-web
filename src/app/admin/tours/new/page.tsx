'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import { TourForm } from '@/components/admin/TourForm';
import type { Destination } from '@/types';

export default function NewTourPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    adminApi
      .list<Destination>('/api/admin/destinations?limit=50')
      .then(({ items }) => setDestinations(items))
      .catch(() => setDestinations([]));
  }, []);

  return (
    <div className="max-w-3xl">
      <nav className="mb-5 text-sm">
        <Link href="/admin/tours" className="text-muted hover:underline">
          ← Back to tours
        </Link>
      </nav>
      <h1 className="mb-7 text-3xl">New tour</h1>
      <TourForm destinations={destinations} />
    </div>
  );
}
