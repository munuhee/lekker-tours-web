'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[public]', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-32">
      <div className="max-w-md text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-amber-600">Something went wrong</p>
        <h1 className="mb-4 text-3xl">We lost the trail</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          This page could not be loaded. It is usually temporary — please try again, or get in touch
          if it keeps happening.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-full bg-amber-500 px-6 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-sand-300 px-6 text-sm text-forest-900 transition-colors hover:border-forest-900"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
