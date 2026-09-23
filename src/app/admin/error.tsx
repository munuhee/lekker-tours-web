'use client';

import { useEffect, useState } from 'react';

/**
 * Error boundary for the whole admin area. Without one, a client-side
 * exception here fell through to Next's own bare "Application error" screen on
 * a white page, with no way out but editing the URL.
 *
 * The common cause is a stale tab: every deploy rebuilds with new
 * content-hashed chunk filenames and replaces .next, so a tab opened before a
 * deploy asks for chunks that no longer exist and throws while navigating. A
 * plain reset() cannot fix that, because the failing chunk is already missing
 * from the page's module graph; only a fresh document load can. So detect that
 * shape of error and reload instead.
 */
function isStaleBuildError(error: Error): boolean {
  const text = `${error.name} ${error.message}`;
  return (
    /ChunkLoadError|Loading chunk|Loading CSS chunk|error loading dynamically imported module|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      text
    )
  );
}

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const stale = isStaleBuildError(error);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    console.error('[admin]', error);
  }, [error]);

  // A stale chunk cannot be recovered in place, so reload once, automatically.
  // sessionStorage guards against a reload loop if the rebuilt page still
  // throws for some other reason.
  useEffect(() => {
    if (!stale) return;
    let alreadyTried = false;
    try {
      alreadyTried = sessionStorage.getItem('admin-stale-reload') === '1';
      sessionStorage.setItem('admin-stale-reload', '1');
    } catch {
      // Private mode or blocked storage: fall back to the manual button below.
      return;
    }
    if (!alreadyTried) {
      setReloading(true);
      window.location.reload();
    }
  }, [stale]);

  // Clear the guard once the admin area renders normally again.
  useEffect(() => {
    if (stale) return;
    try {
      sessionStorage.removeItem('admin-stale-reload');
    } catch {
      // Nothing to clear if storage is unavailable.
    }
  }, [stale]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-card border border-white/10 bg-forest-900 p-7 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-amber-500">
          {stale ? 'New version available' : 'Something went wrong'}
        </p>
        <h1 className="mb-3 text-2xl text-sand-50">
          {stale ? 'This tab is out of date' : 'This screen could not load'}
        </h1>
        <p className="mb-7 text-sm leading-relaxed text-sand-200/70">
          {stale
            ? 'The dashboard was updated while this tab was open, so part of it could not be fetched. Reloading picks up the new version.'
            : 'Something failed while rendering this screen. Trying again usually clears it. Your data has not been changed.'}
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setReloading(true);
              window.location.reload();
            }}
            disabled={reloading}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-amber-500 px-6 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
          >
            {reloading ? 'Reloading…' : 'Reload the page'}
          </button>
          {!stale ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/15 px-6 text-sm text-sand-100 transition-colors hover:border-white/40"
            >
              Try again
            </button>
          ) : null}
        </div>

        {error.digest ? (
          <p className="mt-6 text-xs text-sand-200/40">Reference: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
