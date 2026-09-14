'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/format';

interface BookingFormProps {
  tourId: string;
  tourTitle: string;
  priceFrom: number;
  currency: string;
}

type Guests = { adults: number; children: number; infants: number };

export function BookingForm({ tourId, tourTitle, priceFrom, currency }: BookingFormProps) {
  const [guests, setGuests] = useState<Guests>({ adults: 2, children: 0, infants: 0 });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function adjust(key: keyof Guests, delta: number) {
    setGuests((g) => {
      const min = key === 'adults' ? 1 : 0;
      return { ...g, [key]: Math.max(min, Math.min(20, g[key] + delta)) };
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const payload = {
      type: 'booking' as const,
      tour: tourId,
      tourTitle,
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? '') || undefined,
      travelDate: String(form.get('travelDate') ?? '') || undefined,
      message: String(form.get('message') ?? '') || undefined,
      guests,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.success) {
        if (body?.error?.details) setFieldErrors(body.error.details);
        throw new Error(body?.error?.message ?? 'We could not send your enquiry.');
      }

      setState('done');
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (state === 'done') {
    return (
      <div role="status" className="rounded-card border border-forest-200 bg-forest-50 p-8 text-center">
        <span aria-hidden className="mb-4 block text-4xl">🌿</span>
        <h3 className="mb-3 text-xl">Enquiry received</h3>
        <p className="text-sm leading-relaxed text-muted">
          Thank you. Our Nairobi specialists will respond within 24 hours to begin shaping your
          itinerary for <strong className="text-ink">{tourTitle}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-card border border-sand-200 bg-white p-6 shadow-card">
      <div className="mb-6 border-b border-sand-200 pb-5">
        <p className="text-sm text-muted">From</p>
        <p className="font-display text-3xl text-forest-900">
          {formatPrice(priceFrom, currency)}
          <span className="ml-1 text-sm font-normal text-muted">per person</span>
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Your name" name="name" required error={fieldErrors.name} />
        <Field label="Email address" name="email" type="email" required error={fieldErrors.email} />
        <Field label="Phone (optional)" name="phone" type="tel" error={fieldErrors.phone} />
        <Field label="Preferred travel date" name="travelDate" type="date" error={fieldErrors.travelDate} />

        <fieldset>
          <legend className="mb-2.5 block text-sm font-medium text-ink">Guests</legend>
          <div className="space-y-2.5">
            {(
              [
                ['adults', 'Adults', '12+'],
                ['children', 'Children', '2–11'],
                ['infants', 'Infants', 'Under 2'],
              ] as const
            ).map(([key, label, hint]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-full border border-sand-200 px-4 py-2"
              >
                <span className="text-sm">
                  {label} <span className="text-xs text-muted">{hint}</span>
                </span>
                <span className="flex items-center gap-3">
                  <Stepper label={`Remove one ${label}`} onClick={() => adjust(key, -1)}>
                    −
                  </Stepper>
                  <span aria-live="polite" className="w-5 text-center text-sm font-medium">
                    {guests[key]}
                  </span>
                  <Stepper label={`Add one ${label}`} onClick={() => adjust(key, 1)}>
                    +
                  </Stepper>
                </span>
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="booking-message" className="mb-1.5 block text-sm font-medium text-ink">
            Anything we should know? (optional)
          </label>
          <textarea
            id="booking-message"
            name="message"
            rows={3}
            placeholder="Dietary needs, celebrations, mobility, photography interests…"
            className="w-full rounded-2xl border border-sand-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {state === 'error' ? (
        <p role="alert" className="mt-4 rounded-2xl bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-6 h-12 w-full rounded-full bg-amber-500 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
      >
        {state === 'sending' ? 'Sending…' : 'Request this expedition'}
      </button>

      <p className="mt-3 text-center text-xs text-muted">
        No payment now. We reply within 24 hours.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={`booking-${name}`} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={`booking-${name}`}
        name={name}
        type={type}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `booking-${name}-error` : undefined}
        className={`w-full rounded-full border px-4 py-2.5 text-sm focus:outline-none ${
          error ? 'border-maroon-600' : 'border-sand-300 focus:border-amber-500'
        }`}
      />
      {error ? (
        <p id={`booking-${name}-error`} className="mt-1 text-xs text-maroon-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Stepper({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-sand-300 text-forest-900 transition-colors hover:border-amber-500 hover:text-amber-600"
    >
      {children}
    </button>
  );
}
