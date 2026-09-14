import Link from 'next/link';

/**
 * Scoped to the (public) group so notFound() resolves inside this route
 * segment and serves a genuine 404 status, rather than falling through to the
 * root boundary.
 */
export default function PublicNotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-sand-50 px-4 py-32 text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.28em] text-amber-600">404</p>
      <h1 className="mb-4 text-3xl md:text-4xl">This track leads nowhere</h1>
      <p className="mb-9 max-w-md text-sm leading-relaxed text-muted">
        The page you are looking for has moved or never existed. Let us get you back to the plains.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full bg-amber-500 px-6 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400"
        >
          Back to home
        </Link>
        <Link
          href="/tours"
          className="inline-flex h-11 items-center justify-center rounded-full border border-sand-300 px-6 text-sm text-forest-900 transition-colors hover:border-forest-900"
        >
          Browse expeditions
        </Link>
      </div>
    </div>
  );
}
