'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusPill } from '@/components/admin/StatusPill';
import { ListPageHeader } from '@/components/admin/ListPageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { Modal } from '@/components/admin/Modal';
import type { Testimonial, PageMeta } from '@/types';

const BLANK = {
  authorName: '',
  authorLocation: '',
  quote: '',
  rating: 5,
  tourName: '',
  featured: false,
  order: 0,
  status: 'draft',
};

const PER_PAGE = 25;

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items: rows, meta: pageMeta } = await adminApi.list<Testimonial>(
        `/api/admin/testimonials?limit=${PER_PAGE}&page=${page}`
      );
      setItems(rows);
      setMeta(pageMeta);
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not load testimonials.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    setSaving(true);
    setError('');
    const body = {
      authorName: editing.authorName,
      authorLocation: editing.authorLocation || undefined,
      quote: editing.quote,
      rating: Number(editing.rating ?? 5),
      tourName: editing.tourName || undefined,
      featured: Boolean(editing.featured),
      order: Number(editing.order ?? 0),
      status: editing.status,
    };

    try {
      if (editing._id) await adminApi.patch(`/api/admin/testimonials/${editing._id}`, body);
      else await adminApi.post('/api/admin/testimonials', body);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not save the testimonial.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    setBusyId(id);
    try {
      await adminApi.remove(`/api/admin/testimonials/${id}`);
      setError('');
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not delete.');
    } finally {
      setBusyId(null);
    }
  }

  async function toggle(t: Testimonial) {
    setBusyId(t._id);
    const next = t.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await adminApi.patch<Testimonial>(
        `/api/admin/testimonials/${t._id}/status`,
        { status: next }
      );
      setItems((list) => list.map((x) => (x._id === t._id ? { ...x, ...updated } : x)));
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not change status.');
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<Testimonial>[] = [
    {
      key: 'author',
      header: 'Reviewer',
      render: (t) => (
        <button type="button" onClick={() => setEditing(t)} className="text-left">
          <span className="block font-medium hover:underline">{t.authorName}</span>
          <span className="block text-xs text-muted">{t.authorLocation}</span>
        </button>
      ),
    },
    {
      key: 'quote',
      header: 'Quote',
      render: (t) => <span className="line-clamp-2 block max-w-md text-xs text-muted">{t.quote}</span>,
    },
    { key: 'rating', header: 'Rating', render: (t) => <span className="text-xs">{t.rating} ★</span> },
    { key: 'status', header: 'Status', render: (t) => <StatusPill status={t.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={() => toggle(t)}
            disabled={busyId === t._id}
            className="text-forest-700 underline disabled:opacity-50"
          >
            {t.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button type="button" onClick={() => setEditing(t)} className="text-forest-700 underline">
            Edit
          </button>
          <button
            type="button"
            onClick={() => remove(t._id)}
            disabled={busyId === t._id}
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
        title="Testimonials"
        description="Shown in the carousel on the homepage. Publish only genuine, attributable reviews."
      />

      <div className="mb-5">
        <button
          type="button"
          onClick={() => setEditing({ ...BLANK } as Partial<Testimonial>)}
          className="h-11 rounded-full bg-forest-900 px-6 text-sm text-sand-50 transition-colors hover:bg-amber-500 hover:text-forest-950"
        >
          New testimonial
        </button>
      </div>

      {error ? (
        <p role="alert" className="mb-5 rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(t) => t._id}
        loading={loading}
        emptyTitle="No testimonials yet"
        emptyMessage="Add reviews from travellers who have been on your trips."
      />

      <Pagination meta={meta} onPageChange={setPage} busy={loading} />

      {editing ? (
        <Modal
          as="form"
          onSubmit={save}
          label={editing._id ? 'Edit testimonial' : 'New testimonial'}
          onClose={() => setEditing(null)}
          className="max-w-lg"
        >
          <>
            <h2 className="mb-5 text-xl">{editing._id ? 'Edit testimonial' : 'New testimonial'}</h2>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="t-name" className="mb-1.5 block text-sm font-medium">
                    Reviewer name *
                  </label>
                  <input
                    id="t-name"
                    required
                    value={editing.authorName ?? ''}
                    onChange={(e) => setEditing({ ...editing, authorName: e.target.value })}
                    className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="t-loc" className="mb-1.5 block text-sm font-medium">
                    Location
                  </label>
                  <input
                    id="t-loc"
                    value={editing.authorLocation ?? ''}
                    onChange={(e) => setEditing({ ...editing, authorLocation: e.target.value })}
                    className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="t-quote" className="mb-1.5 block text-sm font-medium">
                  Quote * <span className="text-xs text-muted">(max 600 characters)</span>
                </label>
                <textarea
                  id="t-quote"
                  required
                  rows={5}
                  maxLength={600}
                  value={editing.quote ?? ''}
                  onChange={(e) => setEditing({ ...editing, quote: e.target.value })}
                  className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="t-rating" className="mb-1.5 block text-sm font-medium">
                    Rating
                  </label>
                  <select
                    id="t-rating"
                    value={editing.rating ?? 5}
                    onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                    className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} ★
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="t-order" className="mb-1.5 block text-sm font-medium">
                    Order
                  </label>
                  <input
                    id="t-order"
                    type="number"
                    value={editing.order ?? 0}
                    onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                    className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="t-status" className="mb-1.5 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="t-status"
                    value={editing.status ?? 'draft'}
                    onChange={(e) =>
                      setEditing({ ...editing, status: e.target.value as Testimonial['status'] })
                    }
                    className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="t-tour" className="mb-1.5 block text-sm font-medium">
                  Tour name
                </label>
                <input
                  id="t-tour"
                  value={editing.tourName ?? ''}
                  onChange={(e) => setEditing({ ...editing, tourName: e.target.value })}
                  className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(editing.featured)}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  className="h-4 w-4 accent-amber-500"
                />
                Featured
              </label>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="h-11 rounded-full bg-amber-500 px-8 text-sm font-medium text-forest-950 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-11 rounded-full border border-sand-300 px-6 text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        </Modal>
      ) : null}
    </div>
  );
}
