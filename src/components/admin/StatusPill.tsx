const STYLES: Record<string, string> = {
  published: 'bg-forest-100 text-forest-700',
  draft: 'bg-sand-200 text-muted',

  // Enquiry pipeline, drawn from the site palette (globals.css) — amber for
  // work waiting on us, deepening green as it advances, sand once it is done.
  // Amber on `new` is the only attention-grabbing tone, which is the point:
  // an unclaimed enquiry is the one state that needs someone to move.
  new: 'bg-amber-100 text-amber-700',
  assigned: 'bg-forest-100 text-forest-600',
  in_progress: 'bg-forest-100 text-forest-700',
  quoted: 'bg-forest-200 text-forest-800',
  won: 'bg-forest-500 text-sand-50',
  lost: 'bg-sand-200 text-muted',
};

/** Underscored enum values are not presentable; `won`/`lost` need real words. */
const LABELS: Record<string, string> = {
  new: 'New',
  assigned: 'Assigned',
  in_progress: 'In progress',
  quoted: 'Quoted',
  won: 'Booked',
  lost: 'Closed',
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${
        LABELS[status] ? '' : 'capitalize'
      } ${STYLES[status] ?? 'bg-sand-200 text-muted'}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
