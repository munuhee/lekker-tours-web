'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { useListParams } from '@/lib/useListParams';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusPill } from '@/components/admin/StatusPill';
import { ListPageHeader } from '@/components/admin/ListPageHeader';
import { ListToolbar } from '@/components/admin/ListToolbar';
import { Pagination } from '@/components/admin/Pagination';
import { BulkBar, BulkButton } from '@/components/admin/BulkBar';
import { RowActions, RowButton } from '@/components/admin/RowActions';
import { Modal } from '@/components/admin/Modal';
import { useConfirm } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toasts';
import { formatDate, formatPrice } from '@/lib/format';
import type { Enquiry, PageMeta } from '@/types';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'responded', label: 'Responded' },
  { value: 'archived', label: 'Archived' },
];

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name, A–Z' },
];

const PER_PAGE = 25;

function AdminEnquiriesView() {
  const { params, setParams } = useListParams({ page: '1', q: '', sort: 'newest', status: '' });
  const page = Number(params.page) || 1;

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [confirm, confirmDialog] = useConfirm();
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        limit: String(PER_PAGE),
        page: String(page),
        sort: params.sort,
      });
      if (params.status) query.set('status', params.status);
      if (params.q) query.set('q', params.q);

      const { items, meta: pageMeta } = await adminApi.list<Enquiry>(
        `/api/admin/enquiries?${query}`
      );
      setEnquiries(items);
      setMeta(pageMeta);
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [page, params.q, params.sort, params.status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setChecked((current) => {
      if (current.size === 0) return current;
      const visible = new Set(enquiries.map((e) => e._id));
      const next = new Set([...current].filter((id) => visible.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [enquiries]);

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

  async function setStatus(id: string, status: Enquiry['status'], { silent = false } = {}) {
    const previous = enquiries.find((e) => e._id === id)?.status;
    try {
      const updated = await adminApi.patch<Enquiry>(`/api/admin/enquiries/${id}`, { status });
      setEnquiries((list) => list.map((e) => (e._id === id ? { ...e, ...updated } : e)));
      setSelected((s) => (s && s._id === id ? { ...s, ...updated } : s));
      setError('');

      if (!silent && previous && previous !== status) {
        toast({
          message: `Marked as ${status}.`,
          action: {
            label: 'Undo',
            onAct: () => setStatus(id, previous, { silent: true }),
          },
        });
      }
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Could not update the enquiry.';
      setError(message);
      toast({ tone: 'error', message });
    }
  }

  async function remove(enquiry: Enquiry) {
    const ok = await confirm({
      title: 'Delete this enquiry?',
      body: (
        <>
          The enquiry from <strong className="text-ink">{enquiry.name}</strong> ({enquiry.email})
          will be permanently removed. This cannot be undone.
        </>
      ),
      confirmLabel: 'Delete enquiry',
    });
    if (!ok) return;

    try {
      await adminApi.remove(`/api/admin/enquiries/${enquiry._id}`);
      setSelected(null);
      setError('');
      toast({ message: `Enquiry from ${enquiry.name} was deleted.` });
      await load();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Could not delete the enquiry.';
      setError(message);
      toast({ tone: 'error', message });
    }
  }

  async function bulkStatus(status: Enquiry['status']) {
    const ids = [...checked];
    const previous = new Map(enquiries.map((e) => [e._id, e.status]));
    setBulkBusy(true);
    try {
      await adminApi.bulkStatus('enquiries', ids, status);
      toast({
        message: `${ids.length} ${ids.length === 1 ? 'enquiry' : 'enquiries'} marked as ${status}.`,
        action: {
          label: 'Undo',
          onAct: async () => {
            // Restore each row to whatever it was, not one blanket status.
            const groups = new Map<string, string[]>();
            for (const id of ids) {
              const was = previous.get(id);
              if (!was) continue;
              groups.set(was, [...(groups.get(was) ?? []), id]);
            }
            try {
              for (const [was, group] of groups) {
                await adminApi.bulkStatus('enquiries', group, was);
              }
              await load();
            } catch {
              toast({ tone: 'error', message: 'Could not undo that change.' });
            }
          },
        },
      });
      setChecked(new Set());
      await load();
    } catch (err) {
      const message =
        err instanceof AdminApiError ? err.message : 'Could not update those enquiries.';
      setError(message);
      toast({ tone: 'error', message });
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete() {
    const ids = [...checked];
    const ok = await confirm({
      title: `Delete ${ids.length} ${ids.length === 1 ? 'enquiry' : 'enquiries'}?`,
      body: 'They will be permanently removed. This cannot be undone.',
      confirmLabel: `Delete ${ids.length}`,
    });
    if (!ok) return;

    setBulkBusy(true);
    try {
      await adminApi.bulkRemove('enquiries', ids);
      toast({ message: `${ids.length} ${ids.length === 1 ? 'enquiry' : 'enquiries'} deleted.` });
      setChecked(new Set());
      await load();
    } catch (err) {
      const message =
        err instanceof AdminApiError ? err.message : 'Could not delete those enquiries.';
      setError(message);
      toast({ tone: 'error', message });
    } finally {
      setBulkBusy(false);
    }
  }

  const columns: Column<Enquiry>[] = [
    {
      key: 'name',
      header: 'From',
      primary: true,
      sort: { asc: 'name-asc', desc: 'name-asc' },
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
      sort: { asc: 'oldest', desc: 'newest' },
      render: (e) => <span className="text-xs text-muted">{formatDate(e.createdAt)}</span>,
    },
    { key: 'status', header: 'Status', render: (e) => <StatusPill status={e.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (e) => (
        <RowActions>
          <RowButton onClick={() => open(e)} title="Open this enquiry">
            Open
          </RowButton>
          <RowButton onClick={() => remove(e)} destructive title="Delete this enquiry" icon="🗑">
            <span className="sr-only">Delete</span>
          </RowButton>
        </RowActions>
      ),
    },
  ];

  const resultLabel = meta
    ? params.q
      ? `${meta.total} ${meta.total === 1 ? 'result' : 'results'} for “${params.q}”`
      : `${meta.total} ${meta.total === 1 ? 'enquiry' : 'enquiries'}`
    : undefined;

  return (
    <div>
      <ListPageHeader
        title="Enquiries"
        description="Contact form submissions and booking requests from the public site."
      />

      <ListToolbar
        search={params.q}
        onSearchChange={(q) => setParams({ q }, { replace: true })}
        searchPlaceholder="Search by name, email or message"
        sort={params.sort}
        sorts={SORTS}
        onSortChange={(sort) => setParams({ sort })}
        busy={loading}
        resultLabel={resultLabel}
        filters={FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setParams({ status: f.value })}
            aria-pressed={params.status === f.value}
            className={`h-9 rounded-full px-4 text-xs transition-colors ${
              params.status === f.value
                ? 'bg-forest-900 text-sand-50'
                : 'border border-sand-300 text-muted hover:border-forest-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      />

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
        sort={params.sort}
        onSortChange={(sort) => setParams({ sort })}
        selected={checked}
        onSelectedChange={setChecked}
        bulkBar={
          <BulkBar count={checked.size} onClear={() => setChecked(new Set())} busy={bulkBusy}>
            <BulkButton onClick={() => bulkStatus('read')} disabled={bulkBusy}>
              Mark read
            </BulkButton>
            <BulkButton onClick={() => bulkStatus('responded')} disabled={bulkBusy}>
              Mark responded
            </BulkButton>
            <BulkButton onClick={() => bulkStatus('archived')} disabled={bulkBusy}>
              Archive
            </BulkButton>
            <BulkButton onClick={bulkDelete} disabled={bulkBusy} destructive>
              Delete
            </BulkButton>
          </BulkBar>
        }
        emptyTitle={params.q ? 'No matching enquiries' : 'No enquiries'}
        emptyMessage={
          params.q
            ? `Nothing matched “${params.q}”. Try a shorter search, or clear it to see them all.`
            : 'Submissions from the contact and booking forms will appear here.'
        }
        emptyAction={
          params.q ? (
            <button
              type="button"
              onClick={() => setParams({ q: '' })}
              className="inline-block rounded-full border border-sand-300 px-6 py-2.5 text-sm transition-colors hover:border-forest-900"
            >
              Clear search
            </button>
          ) : null
        }
      />

      <Pagination
        meta={meta}
        onPageChange={(next) => setParams({ page: String(next) })}
        busy={loading}
      />

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
                onClick={() => remove(selected)}
                className="ml-auto text-xs text-maroon-600 underline"
              >
                Delete
              </button>
            </div>
          </>
        </Modal>
      ) : null}

      {confirmDialog}
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

/** useSearchParams needs a Suspense boundary during prerender. */
export default function AdminEnquiriesPage() {
  return (
    <Suspense>
      <AdminEnquiriesView />
    </Suspense>
  );
}
