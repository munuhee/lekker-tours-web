'use client';

import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'Create your first item to see it listed here.',
  emptyAction,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-card border border-sand-200 bg-white">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-4 border-b border-sand-100 p-4 last:border-0">
            <div className="h-10 w-10 animate-pulse rounded bg-sand-200" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-1/3 animate-pulse rounded bg-sand-200" />
              <div className="h-3 w-1/5 animate-pulse rounded bg-sand-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-sand-300 bg-white px-6 py-16 text-center">
        <h3 className="mb-2 text-lg">{emptyTitle}</h3>
        <p className="mx-auto max-w-sm text-sm text-muted">{emptyMessage}</p>
        {emptyAction ? <div className="mt-6">{emptyAction}</div> : null}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-sand-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-sand-200 bg-sand-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-xs uppercase tracking-wider text-muted ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="transition-colors hover:bg-sand-50">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
