'use client';

import { API_URL } from './api';

/**
 * Browser-side admin client. Always sends the httpOnly cookie and never
 * caches, so the dashboard reflects the database immediately.
 */
export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: Record<string, string>
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new AdminApiError('Could not reach the API. Is the server running?', 0);
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.success) {
    throw new AdminApiError(
      payload?.error?.message ?? 'Request failed.',
      res.status,
      payload?.error?.details
    );
  }

  return payload.data as T;
}

export const adminApi = {
  get: <T>(path: string) => request<T>(path),

  list: async <T>(path: string) => {
    let res: Response;
    try {
      res = await fetch(`${API_URL}${path}`, { credentials: 'include', cache: 'no-store' });
    } catch {
      throw new AdminApiError('Could not reach the API. Is the server running?', 0);
    }
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new AdminApiError(payload?.error?.message ?? 'Request failed.', res.status);
    }
    return { items: (payload.data ?? []) as T[], meta: payload.meta };
  },

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  remove: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  async upload(file: File): Promise<{ url: string; filename: string }> {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${API_URL}/api/admin/uploads`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new AdminApiError(payload?.error?.message ?? 'Upload failed.', res.status);
    }
    return payload.data;
  },
};
