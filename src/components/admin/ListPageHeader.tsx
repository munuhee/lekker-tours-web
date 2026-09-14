import Link from 'next/link';

export function ListPageHeader({
  title,
  description,
  newHref,
  newLabel,
}: {
  title: string;
  description?: string;
  newHref?: string;
  newLabel?: string;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      </div>
      {newHref ? (
        <Link
          href={newHref}
          className="h-11 rounded-full bg-forest-900 px-6 text-sm leading-[2.75rem] text-sand-50 transition-colors hover:bg-amber-500 hover:text-forest-950"
        >
          {newLabel ?? 'Add new'}
        </Link>
      ) : null}
    </header>
  );
}
