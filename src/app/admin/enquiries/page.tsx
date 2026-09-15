'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusPill } from '@/components/admin/StatusPill';
import { ListPageHeader } from '@/components/admin/ListPageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { Modal } from '@/components/admin/Modal';
import { formatDate, formatPrice } from '@/lib/format';
import type { Enquiry, PageMeta } from '@/types';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'responded', label: 'Responded' },
  { value: 'archived', label: 'Archived' },
];

const PER_PAGE = 25;

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PER_PAGE), page: String(page) });
      if (filter) params.set('status', filter);
      const { items, meta: pageMeta } = await adminApi.list<Enquiry>(
        `/api/admin/enquiries?${params}`
      );
      setEnquiries(items);
      setMeta(pageMeta);
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  // A filter change restarts paging; staying on page 4 of the old filter would
  // usually land on an empty result.
  function changeFilter(next: string) {
    setFilter(next);
    setPage(1);
  }

  async function open(enquiry: Enquiry) {
    try {
      // GET marks a new enquiry as read server-side.
      const full = await adminApi.get<Enquiry>(`/api/admin/enquiries/${enquiry._id}`);
      setSelected(full);
      setEnquiries((list) =>
        list.map((e) => (e._id === full._id ? { ...e, status: full.status } : e))
      );
    } catch {
      setSelected(enquiry);
    }
  }

  async function setStatus(id: string, status: Enquiry['status']) {
    try {
      const updated = await adminApi.patch<Enquiry>(`/api/admin/enquiries/${id}`, { status });
      setEnquiries((list) => list.map((e) => (e._id === id ? { ...e, ...updated } : e)));
      setSelected((s) => (s && s._id === id ? { ...s, ...updated } : s));
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not update the enquiry.');
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this enquiry permanently?')) return;
    try {
      await adminApi.remove(`/api/admin/enquiries/${id}`);
      setSelected(null);
      setError('');
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not delete the enquiry.');
    }
  }

  const columns: Column<Enquiry>[] = [
    {
      key: 'name',
      header: 'From',
      render: (e) => (
        <button type="button" onClick={() => open(e)} className="text-left">
          <span className="block font-medium hover:underline">{e.name}</span>
          <span className="block text-xs text-muted">{e.email}</span>
        </button>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (e) => (
        <span className="text-xs capitalize text-muted">
          {e.type === 'booking' ? `Booking · ${e.tourTitle ?? '—'}` : 'Contact'}
        </span>
      ),
    },
    {
      key: 'received',
      header: 'Received',
      render: (e) => <span className="text-xs text-muted">{formatDate(e.createdAt)}</span>,
    },
    { key: 'status', header: 'Status', render: (e) => <StatusPill status={e.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (e) => (
        <button type="button" onClick={() => open(e)} className="text-xs text-forest-700 underline">
          Open
        </button>
      ),
    },
  ];

  return (
    <div>
      <ListPageHeader
        title="Enquiries"
        description="Contact form submissions and booking requests from the public site."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => changeFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-full px-4 py-2 text-xs transition-colors ${
              filter === f.value
                ? 'bg-forest-900 text-sand-50'
                : 'border border-sand-300 text-muted hover:border-forest-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mb-5 rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={enquiries}
        rowKey={(e) => e._id}
        loading={loading}
        emptyTitle="No enquiries"
        emptyMessage="Submissions from the contact and booking forms will appear here."
      />

      <Pagination meta={meta} onPageChange={setPage} busy={loading} />

      {selected ? (
        <Modal
          label={`Enquiry from ${selected.name}`}
          onClose={() => setSelected(null)}
          className="max-w-lg"
        >
          <>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl">{selected.name}</h2>
                <a href={`mailto:${selected.email}`} className="text-sm text-forest-700 underline">
                  {selected.email}
                </a>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="text-2xl leading-none text-muted hover:text-ink"
              >
                ×
              </button>
            </div>

            <dl className="mb-5 space-y-3 text-sm">
              {selected.phone ? <Row label="Phone" value={selected.phone} /> : null}
              {selected.type === 'booking' ? (
                <>
                  <Row label="Tour" value={selected.tourTitle ?? '—'} />
                  {selected.travelDate ? (
                    <Row label="Travel date" value={formatDate(selected.travelDate)} />
                  ) : null}
                  <Row
                    label="Guests"
                    value={`${selected.guests?.adults ?? 0} adults, ${
                      selected.guests?.children ?? 0
                    } children, ${selected.guests?.infants ?? 0} infants`}
                  />
                </>
              ) : (
                <>
                  {selected.expeditionInterest ? (
                    <Row label="Interest" value={selected.expeditionInterest} />
                  ) : null}
                  {selected.budgetUSD ? (
                    <Row label="Budget" value={formatPrice(selected.budgetUSD)} />
                  ) : null}
                </>
              )}
              <Row label="Received" value={formatDate(selected.createdAt)} />
            </dl>

            {selected.message ? (
              <div className="mb-6 rounded-lg bg-sand-50 p-4">
                <p className="mb-1 text-xs uppercase tracking-wider text-muted">Message</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.message}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 border-t border-sand-200 pt-5">
              {(['new', 'read', 'responded', 'archived'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(selected._id, s)}
                  aria-pressed={selected.status === s}
                  className={`rounded-full px-3 py-1.5 text-xs capitalize transition-colors ${
                    selected.status === s
                      ? 'bg-forest-900 text-sand-50'
                      : 'border border-sand-300 text-muted hover:border-forest-900'
                  }`}
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                onClick={() => remove(selected._id)}
                className="ml-auto text-xs text-maroon-600 underline"
              >
                Delete
              </button>
            </div>
          </>
        </Modal>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
