import { cookies } from 'next/headers';
import { API_URL } from './api';

export const AUTH_COOKIE = 'lekker_admin_token';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  lastLoginAt?: string;
}

/**
 * Server-side session check. Forwards the httpOnly cookie to Express, which is
 * the only place the JWT is verified — the web app never decodes it itself.
 *
 * Next 15: cookies() is async.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { cookie: `${AUTH_COOKIE}=${token}` },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.success ? (payload.data as AdminUser) : null;
  } catch {
    return null;
  }
}

/** Builds the cookie header for server-side admin API calls. */
export async function adminCookieHeader(): Promise<string | undefined> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  return token ? `${AUTH_COOKIE}=${token}` : undefined;
}
