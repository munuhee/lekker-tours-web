'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusPill } from '@/components/admin/StatusPill';
import { ListPageHeader } from '@/components/admin/ListPageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { formatDate } from '@/lib/format';
import type { BlogPost, PageMeta } from '@/types';

const PER_PAGE = 25;

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items, meta: pageMeta } = await adminApi.list<BlogPost>(
        `/api/admin/blog?limit=${PER_PAGE}&page=${page}`
      );
      setPosts(items);
      setMeta(pageMeta);
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not load posts.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(post: BlogPost) {
    setBusyId(post._id);
    const next = post.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await adminApi.patch<BlogPost>(`/api/admin/blog/${post._id}/status`, {
        status: next,
      });
      setPosts((list) => list.map((p) => (p._id === post._id ? { ...p, ...updated } : p)));
      setError('');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not change status.');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this post permanently?')) return;
    setBusyId(id);
    try {
      await adminApi.remove(`/api/admin/blog/${id}`);
      setError('');
      // Reload so pagination totals stay correct after a removal.
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not delete the post.');
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<BlogPost>[] = [
    {
      key: 'title',
      header: 'Post',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded bg-sand-100">
            {p.coverImage?.url ? (
              <Image src={p.coverImage.url} alt="" fill sizes="64px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <Link href={`/admin/blog/${p._id}`} className="block truncate font-medium hover:underline">
              {p.title}
            </Link>
            <p className="truncate text-xs text-muted">{p.tags?.join(', ')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'published',
      header: 'Published',
      render: (p) => <span className="text-xs text-muted">{formatDate(p.publishedAt)}</span>,
    },
    {
      key: 'reading',
      header: 'Length',
      render: (p) => <span className="text-xs text-muted">{p.readingMinutes} min</span>,
    },
    { key: 'status', header: 'Status', render: (p) => <StatusPill status={p.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={() => toggle(p)}
            disabled={busyId === p._id}
            className="text-forest-700 underline disabled:opacity-50"
          >
            {p.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <Link href={`/admin/blog/${p._id}`} className="text-forest-700 underline">
            Edit
          </Link>
          <button
            type="button"
            onClick={() => remove(p._id)}
            disabled={busyId === p._id}
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
        title="Blog posts"
        description="Field notes and planning guides shown in the Journal."
        newHref="/admin/blog/new"
        newLabel="New post"
      />

      {error ? (
        <p role="alert" className="mb-5 rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {error}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={posts}
        rowKey={(p) => p._id}
        loading={loading}
        emptyTitle="No posts yet"
        emptyMessage="Write your first article and it will appear in the Journal once published."
        emptyAction={
          <Link
            href="/admin/blog/new"
            className="inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm text-forest-950"
          >
            New post
          </Link>
        }
      />

      <Pagination meta={meta} onPageChange={setPage} busy={loading} />
    </div>
  );
}
