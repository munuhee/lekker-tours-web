'use client';

import { useState } from 'react';

/** Mirrors the field set published on lekkertours.com/contact. */
const INTERESTS = ['Big Five Safaris', 'Weekend Escape', 'East Africa Tours'] as const;

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    setErrors({});

    const form = new FormData(e.currentTarget);
    const budget = String(form.get('budgetUSD') ?? '').trim();

    const payload = {
      type: 'contact' as const,
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? '') || undefined,
      expeditionInterest: String(form.get('expeditionInterest') ?? '') || undefined,
      budgetUSD: budget ? Number(budget) : undefined,
      message: String(form.get('message') ?? ''),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.success) {
        if (body?.error?.details) setErrors(body.error.details);
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
      <div
        role="status"
        className="rounded-card border border-forest-200 bg-forest-50 p-10 text-center"
      >
        <span aria-hidden className="mb-4 block text-4xl">
          🌍
        </span>
        <h3 className="mb-3 text-2xl">Your enquiry is on its way</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
          Our specialists will respond within 24 hours to begin your custom itinerary. If it is
          urgent, call us — we answer at any hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-card border border-sand-200 bg-white p-7 shadow-card md:p-9">
      <h2 className="mb-2 text-2xl">Tell us where the wild calls you</h2>
      <p className="mb-7 text-sm leading-relaxed text-muted">
        The more you tell us, the more precisely we can shape the trip.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" required error={errors.name} />
        <Field label="Email address" name="email" type="email" required error={errors.email} />
        <Field label="Phone / WhatsApp" name="phone" type="tel" error={errors.phone} />

        <div>
          <label htmlFor="expeditionInterest" className="mb-1.5 block text-sm font-medium text-ink">
            Expedition interest
          </label>
          <select
            id="expeditionInterest"
            name="expeditionInterest"
            defaultValue=""
            className="h-11 w-full rounded-full border border-sand-300 bg-white px-4 text-sm focus:border-amber-500 focus:outline-none"
          >
            <option value="">Not sure yet</option>
            {INTERESTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="Estimated budget (KES, per person)"
            name="budgetUSD"
            type="number"
            error={errors.budgetUSD}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
            Expedition details <span className="text-muted">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            placeholder="Your dates, how many travelling, what you most want to see, and anything else that matters."
            aria-invalid={errors.message ? true : undefined}
            className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none ${
              errors.message ? 'border-maroon-600' : 'border-sand-300 focus:border-amber-500'
            }`}
          />
          {errors.message ? (
            <p className="mt-1 text-xs text-maroon-600">{errors.message}</p>
          ) : null}
        </div>
      </div>

      {state === 'error' ? (
        <p role="alert" className="mt-5 rounded-2xl bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-7 h-12 w-full rounded-full bg-amber-500 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400 disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {state === 'sending' ? 'Sending…' : 'Send enquiry'}
      </button>

      <p className="mt-4 text-xs text-muted">
        Our specialists will respond within 24 hours to begin your custom itinerary.
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
      <label htmlFor={`contact-${name}`} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-muted">*</span> : null}
      </label>
      <input
        id={`contact-${name}`}
        name={name}
        type={type}
        required={required}
        min={type === 'number' ? 0 : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `contact-${name}-error` : undefined}
        className={`h-11 w-full rounded-full border px-4 text-sm focus:outline-none ${
          error ? 'border-maroon-600' : 'border-sand-300 focus:border-amber-500'
        }`}
      />
      {error ? (
        <p id={`contact-${name}-error`} className="mt-1 text-xs text-maroon-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
