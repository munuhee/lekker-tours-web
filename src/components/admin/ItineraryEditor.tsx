'use client';

import type { ItineraryDay } from '@/types';

const MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const;

export function ItineraryEditor({
  days,
  onChange,
}: {
  days: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
}) {
  function update(index: number, patch: Partial<ItineraryDay>) {
    onChange(days.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function addDay() {
    onChange([
      ...days,
      {
        day: days.length + 1,
        title: '',
        description: '',
        activities: [],
        meals: [],
        accommodation: '',
      },
    ]);
  }

  function removeDay(index: number) {
    // Renumber so day numbers stay contiguous after a removal.
    onChange(days.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= days.length) return;
    const next = [...days];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((d, i) => ({ ...d, day: i + 1 })));
  }

  return (
    <div className="space-y-4">
      {days.length === 0 ? (
        <p className="rounded-lg border border-dashed border-sand-300 px-4 py-8 text-center text-sm text-muted">
          No itinerary days yet. Add the first day below.
        </p>
      ) : null}

      {days.map((day, i) => (
        <div key={i} className="rounded-lg border border-sand-200 bg-sand-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-900 text-sm text-amber-400">
              {day.day}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move day ${day.day} earlier`}
                className="rounded border border-sand-300 px-2 py-1 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === days.length - 1}
                aria-label={`Move day ${day.day} later`}
                className="rounded border border-sand-300 px-2 py-1 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeDay(i)}
                className="text-maroon-600 underline"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={day.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Day title, e.g. Nairobi to the Maasai Mara"
              className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />

            <textarea
              rows={2}
              value={day.description ?? ''}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="What happens on this day"
              className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />

            <textarea
              rows={3}
              value={(day.activities ?? []).join('\n')}
              onChange={(e) =>
                update(i, {
                  activities: e.target.value
                    .split('\n')
                    .map((l) => l.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Activities, one per line"
              className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />

            <div className="flex flex-wrap items-center gap-4">
              <fieldset className="flex items-center gap-3">
                <legend className="sr-only">Meals on day {day.day}</legend>
                {MEALS.map((meal) => (
                  <label key={meal} className="flex cursor-pointer items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={(day.meals ?? []).includes(meal)}
                      onChange={(e) =>
                        update(i, {
                          meals: e.target.checked
                            ? [...(day.meals ?? []), meal]
                            : (day.meals ?? []).filter((m) => m !== meal),
                        })
                      }
                      className="h-3.5 w-3.5 accent-amber-500"
                    />
                    {meal}
                  </label>
                ))}
              </fieldset>

              <input
                type="text"
                value={day.accommodation ?? ''}
                onChange={(e) => update(i, { accommodation: e.target.value })}
                placeholder="Accommodation"
                className="min-w-0 flex-1 rounded-lg border border-sand-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDay}
        className="w-full rounded-lg border border-dashed border-sand-300 py-3 text-sm text-forest-700 transition-colors hover:border-amber-500 hover:text-amber-600"
      >
        + Add day {days.length + 1}
      </button>
    </div>
  );
}
