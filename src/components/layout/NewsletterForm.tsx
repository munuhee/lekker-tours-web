'use client';

import { useState } from 'react';

/**
 * Newsletter signups are stored as contact enquiries so they land in the same
 * admin inbox rather than needing a separate mailing-list integration.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          name: 'Newsletter subscriber',
          email,
          message: 'Requested the newsletter from the website footer.',
        }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? 'Something went wrong.');
      }

      setState('done');
      setMessage('Thank you — we will be in touch.');
      setEmail('');
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (state === 'done') {
    return (
      <p role="status" className="rounded-full bg-forest-800/60 px-4 py-3 text-sm text-amber-400">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border border-sand-100/20 bg-forest-900/60 px-4 py-2.5 text-sm text-sand-50 placeholder:text-sand-200/40 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="shrink-0 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
        >
          {state === 'sending' ? '…' : 'Join'}
        </button>
      </div>
      {state === 'error' ? (
        <p role="alert" className="text-xs text-amber-300">
          {message}
        </p>
      ) : null}
    </form>
  );
}
