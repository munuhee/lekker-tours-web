'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusPill } from '@/components/admin/StatusPill';
import { ListPageHeader } from '@/components/admin/ListPageHeader';
import { formatPrice } from '@/lib/format';
import type { Tour } from '@/types';

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items } = await adminApi.list<Tour>('/api/admin/tours?limit=100&sort=newest');
      setTours(items);
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not load tours.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleStatus(tour: Tour) {
    setBusyId(tour._id);
    const next = tour.status === 'published' ? 'draft' : 'published';
    try {
      await adminApi.patch(`/api/admin/tours/${tour._id}/status`, { status: next });
      setTours((list) => list.map((t) => (t._id === tour._id ? { ...t, status: next } : t)));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not change status.');
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<Tour>[] = [
    {
      key: 'title',
      header: 'Tour',
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded bg-sand-100">
            {t.heroImage?.url ? (
              <Image src={t.heroImage.url} alt="" fill sizes="64px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <Link href={`/admin/tours/${t._id}`} className="block truncate font-medium hover:underline">
              {t.title}
            </Link>
            <p className="truncate text-xs text-muted">{t.countries?.join(', ')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Type',
      render: (t) => (
        <span className="text-xs text-muted">
          {t.category === 'WeekendEscape' ? 'Weekend Escape' : 'Expedition'}
        </span>
      ),
    },
    { key: 'duration', header: 'Duration', render: (t) => <span className="text-xs">{t.durationDays}d</span> },
    {
      key: 'price',
      header: 'From',
      render: (t) => <span className="text-xs">{formatPrice(t.priceFrom, t.currency)}</span>,
    },
    { key: 'status', header: 'Status', render: (t) => <StatusPill status={t.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={() => toggleStatus(t)}
            disabled={busyId === t._id}
            className="text-forest-700 underline disabled:opacity-50"
          >
            {t.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <Link href={`/admin/tours/${t._id}`} className="text-forest-700 underline">
            Edit
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <ListPageHeader
        title="Tours"
        description="Expeditions and weekend escapes shown on the public site."
        newHref="/admin/tours/new"
        newLabel="New tour"
      />

      {error ? (
        <p role="alert" className="mb-5 rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={tours}
        rowKey={(t) => t._id}
        loading={loading}
        emptyTitle="No tours yet"
        emptyMessage="Create your first expedition and it will appear on the public site once published."
        emptyAction={
          <Link
            href="/admin/tours/new"
            className="inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm text-forest-950"
          >
            New tour
          </Link>
        }
      />
    </div>
  );
}
