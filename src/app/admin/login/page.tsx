'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { adminApi, AdminApiError } from '@/lib/adminApi';

/** Only ever send the user to a path inside this app. */
function safeReturnPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/admin';
  return raw.startsWith('/admin/login') ? '/admin' : raw;
}

/** Turns a failed sign-in into something that names the actual cause. */
function signInMessage(err: unknown): string {
  if (!(err instanceof AdminApiError)) {
    return 'Sign-in failed. Please try again.';
  }
  // 0 is adminApi's marker for "fetch threw", i.e. the API was unreachable.
  if (err.status === 0) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  if (err.status === 429) {
    // The limiter is 10 failed attempts per 15 minutes, and the old redirect
    // hid those failures, so a correct password can land here. Say so plainly,
    // otherwise it reads as "my password stopped working".
    return err.message || 'Too many sign-in attempts. Wait a few minutes, then try again.';
  }
  if (err.status === 401) {
    return 'That email and password do not match an account.';
  }
  // The API validates with 422 and puts the per-field reason in details,
  // which is more specific than its generic "correct the highlighted fields".
  if (err.status === 400 || err.status === 422) {
    const field = err.details && Object.values(err.details)[0];
    return field || err.message || 'Enter a valid email address and password.';
  }
  if (err.status >= 500) {
    return 'The server had a problem signing you in. Please try again shortly.';
  }
  return err.message || 'Sign-in failed. Please try again.';
}

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get('from'));
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    setMessage('');

    const form = new FormData(e.currentTarget);

    try {
      await adminApi.post(
        '/api/auth/login',
        {
          email: String(form.get('email') ?? '').trim(),
          password: String(form.get('password') ?? ''),
        },
        { signingIn: true }
      );
      // A full navigation, not router.push: the session cookie is set on this
      // response, and middleware reads cookies server-side. A client-side push
      // could run the guard before the browser has committed the cookie, which
      // bounced a valid sign-in straight back to this page.
      window.location.assign(returnTo);
    } catch (err) {
      setState('error');
      setMessage(signInMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            aria-label="Lekker Tours and Travel, back to the homepage"
            className="mb-5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Image
              src="/logo.png"
              alt="Lekker Tours and Travel"
              width={72}
              height={72}
              className="h-18 w-18 object-contain transition-opacity hover:opacity-80"
            />
          </Link>
          <h1 className="text-2xl text-sand-50">Administrator sign in</h1>
          <p className="mt-2 text-sm text-sand-200/60">
            Manage tours, destinations and enquiries.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-card border border-white/10 bg-forest-900 p-7"
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-sand-100">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="h-11 w-full rounded-lg border border-white/15 bg-forest-950 px-4 text-sm text-sand-50 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-sand-100">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-11 w-full rounded-lg border border-white/15 bg-forest-950 px-4 text-sm text-sand-50 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {state === 'error' ? (
            <p role="alert" className="rounded-lg bg-maroon-600/20 px-4 py-3 text-sm text-amber-200">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={state === 'sending'}
            className="h-11 w-full rounded-lg bg-amber-500 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
          >
            {state === 'sending' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

/** useSearchParams needs a Suspense boundary during prerender. */
export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
