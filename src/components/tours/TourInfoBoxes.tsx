import type { Tour } from '@/types';

/** Four small info boxes below the overview heading. */
export function TourInfoBoxes({ tour }: { tour: Tour }) {
  const boxes = [
    { icon: <ClockIcon />, label: 'Duration', value: `${tour.durationDays} Days` },
    { icon: <UsersIcon />, label: 'Travellers', value: `0-${tour.groupSizeMax} guests` },
    {
      icon: <TagIcon />,
      label: 'Tour type',
      value: tour.category === 'WeekendEscape' ? 'Weekend escape' : 'Group tour',
    },
    { icon: <GlobeIcon />, label: 'Language', value: 'English' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {boxes.map((box) => (
        <div
          key={box.label}
          className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3"
        >
          <span aria-hidden className="text-amber-600">
            {box.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-[0.68rem] uppercase tracking-wider text-muted">
              {box.label}
            </span>
            <span className="block truncate text-sm text-ink">{box.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0M16 5.5a3.2 3.2 0 0 1 0 5M18 20a5.5 5.5 0 0 0-2-4" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 12V4h8l9 9-8 8-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
    </svg>
  );
}
