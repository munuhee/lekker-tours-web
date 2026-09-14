'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { adminApi, AdminApiError } from '@/lib/adminApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    setMessage('');

    const form = new FormData(e.currentTarget);

    try {
      await adminApi.post('/api/auth/login', {
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      });
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setState('error');
      setMessage(
        err instanceof AdminApiError ? err.message : 'Sign-in failed. Please try again.'
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="Lekker Tours and Travel"
            width={72}
            height={72}
            className="mb-5 h-18 w-18 object-contain"
          />
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
