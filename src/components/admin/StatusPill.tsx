const STYLES: Record<string, string> = {
  published: 'bg-forest-100 text-forest-700',
  draft: 'bg-sand-200 text-muted',
  new: 'bg-amber-100 text-amber-700',
  read: 'bg-sand-200 text-muted',
  responded: 'bg-forest-100 text-forest-700',
  archived: 'bg-sand-100 text-muted',
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs capitalize ${
        STYLES[status] ?? 'bg-sand-200 text-muted'
      }`}
    >
      {status}
    </span>
  );
}
