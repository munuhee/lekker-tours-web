'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusPill } from '@/components/admin/StatusPill';
import { ListPageHeader } from '@/components/admin/ListPageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { Modal } from '@/components/admin/Modal';
import type { Faq, PageMeta } from '@/types';

const GROUPS = ['general', 'booking', 'travel', 'payment'] as const;

const BLANK = { question: '', answer: '', group: 'general', order: 0, status: 'draft' };

const PER_PAGE = 25;

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Partial<Faq> | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items, meta: pageMeta } = await adminApi.list<Faq>(
        `/api/admin/faqs?limit=${PER_PAGE}&page=${page}`
      );
      setFaqs(items);
      setMeta(pageMeta);
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not load FAQs.');
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
      question: editing.question,
      answer: editing.answer,
      group: editing.group,
      order: Number(editing.order ?? 0),
      status: editing.status,
    };

    try {
      if (editing._id) await adminApi.patch(`/api/admin/faqs/${editing._id}`, body);
      else await adminApi.post('/api/admin/faqs', body);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not save the FAQ.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    setBusyId(id);
    try {
      await adminApi.remove(`/api/admin/faqs/${id}`);
      setError('');
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not delete the FAQ.');
    } finally {
      setBusyId(null);
    }
  }

  async function toggle(faq: Faq) {
    setBusyId(faq._id);
    const next = faq.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await adminApi.patch<Faq>(`/api/admin/faqs/${faq._id}/status`, {
        status: next,
      });
      setFaqs((list) => list.map((f) => (f._id === faq._id ? { ...f, ...updated } : f)));
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not change status.');
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<Faq>[] = [
    {
      key: 'question',
      header: 'Question',
      render: (f) => (
        <button type="button" onClick={() => setEditing(f)} className="text-left font-medium hover:underline">
          {f.question}
        </button>
      ),
    },
    { key: 'group', header: 'Group', render: (f) => <span className="text-xs capitalize text-muted">{f.group}</span> },
    { key: 'order', header: 'Order', render: (f) => <span className="text-xs text-muted">{f.order}</span> },
    { key: 'status', header: 'Status', render: (f) => <StatusPill status={f.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (f) => (
        <div className="flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={() => toggle(f)}
            disabled={busyId === f._id}
            className="text-forest-700 underline disabled:opacity-50"
          >
            {f.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button type="button" onClick={() => setEditing(f)} className="text-forest-700 underline">
            Edit
          </button>
          <button
            type="button"
            onClick={() => remove(f._id)}
            disabled={busyId === f._id}
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
      <ListPageHeader title="FAQs" description="Shown in the accordion on the homepage." />

      <div className="mb-5">
        <button
          type="button"
          onClick={() => setEditing({ ...BLANK } as Partial<Faq>)}
          className="h-11 rounded-full bg-forest-900 px-6 text-sm text-sand-50 transition-colors hover:bg-amber-500 hover:text-forest-950"
        >
          New FAQ
        </button>
      </div>

      {error ? (
        <p role="alert" className="mb-5 rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={faqs}
        rowKey={(f) => f._id}
        loading={loading}
        emptyTitle="No FAQs yet"
        emptyMessage="Add the questions travellers ask most often."
      />

      <Pagination meta={meta} onPageChange={setPage} busy={loading} />

      {editing ? (
        <Modal
          as="form"
          onSubmit={save}
          label={editing._id ? 'Edit FAQ' : 'New FAQ'}
          onClose={() => setEditing(null)}
          className="max-w-lg"
        >
          <>
            <h2 className="mb-5 text-xl">{editing._id ? 'Edit FAQ' : 'New FAQ'}</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="faq-q" className="mb-1.5 block text-sm font-medium">
                  Question *
                </label>
                <input
                  id="faq-q"
                  required
                  value={editing.question ?? ''}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="faq-a" className="mb-1.5 block text-sm font-medium">
                  Answer *
                </label>
                <textarea
                  id="faq-a"
                  required
                  rows={6}
                  value={editing.answer ?? ''}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                  className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="faq-group" className="mb-1.5 block text-sm font-medium">
                    Group
                  </label>
                  <select
                    id="faq-group"
                    value={editing.group ?? 'general'}
                    onChange={(e) => setEditing({ ...editing, group: e.target.value as Faq['group'] })}
                    className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    {GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="faq-order" className="mb-1.5 block text-sm font-medium">
                    Order
                  </label>
                  <input
                    id="faq-order"
                    type="number"
                    value={editing.order ?? 0}
                    onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                    className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="faq-status" className="mb-1.5 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="faq-status"
                    value={editing.status ?? 'draft'}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as Faq['status'] })}
                    className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
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
