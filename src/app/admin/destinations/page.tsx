'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusPill } from '@/components/admin/StatusPill';
import { ListPageHeader } from '@/components/admin/ListPageHeader';
import { Pagination } from '@/components/admin/Pagination';
import type { Destination, PageMeta } from '@/types';

const PER_PAGE = 25;

export default function AdminDestinationsPage() {
  const [items, setItems] = useState<Destination[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items: rows, meta: pageMeta } = await adminApi.list<Destination>(
        `/api/admin/destinations?limit=${PER_PAGE}&page=${page}`
      );
      setItems(rows);
      setMeta(pageMeta);
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not load destinations.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(d: Destination) {
    setBusyId(d._id);
    const next = d.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await adminApi.patch<Destination>(
        `/api/admin/destinations/${d._id}/status`,
        { status: next }
      );
      setItems((list) => list.map((x) => (x._id === d._id ? { ...x, ...updated } : x)));
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not change status.');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this destination? Tours linked to it will keep working.')) return;
    setBusyId(id);
    try {
      await adminApi.remove(`/api/admin/destinations/${id}`);
      setError('');
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not delete.');
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<Destination>[] = [
    {
      key: 'name',
      header: 'Destination',
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded bg-sand-100">
            {d.cardImage?.url ? (
              <Image src={d.cardImage.url} alt="" fill sizes="64px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/destinations/${d._id}`}
              className="block truncate font-medium hover:underline"
            >
              {d.name}
            </Link>
            <p className="truncate text-xs text-muted">{d.tagline}</p>
          </div>
        </div>
      ),
    },
    { key: 'country', header: 'Country', render: (d) => <span className="text-xs">{d.country}</span> },
    {
      key: 'parks',
      header: 'Parks',
      render: (d) => <span className="text-xs text-muted">{d.parks?.length ?? 0}</span>,
    },
    { key: 'status', header: 'Status', render: (d) => <StatusPill status={d.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={() => toggle(d)}
            disabled={busyId === d._id}
            className="text-forest-700 underline disabled:opacity-50"
          >
            {d.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <Link href={`/admin/destinations/${d._id}`} className="text-forest-700 underline">
            Edit
          </Link>
          <button
            type="button"
            onClick={() => remove(d._id)}
            disabled={busyId === d._id}
            className="text-maroon-600 underline disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <ListPageHeader
        title="Destinations"
        description="Countries and the parks within them, shown on the destinations pages."
        newHref="/admin/destinations/new"
        newLabel="New destination"
      />

      {error ? (
        <p role="alert" className="mb-5 rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(d) => d._id}
        loading={loading}
        emptyTitle="No destinations yet"
        emptyMessage="Add the countries you operate in, each with its parks and best-time guidance."
        emptyAction={
          <Link
            href="/admin/destinations/new"
            className="inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm text-forest-950"
          >
            New destination
          </Link>
        }
      />

      <Pagination meta={meta} onPageChange={setPage} busy={loading} />
    </div>
  );
}
