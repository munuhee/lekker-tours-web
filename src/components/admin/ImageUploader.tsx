'use client';

import { useState } from 'react';
import Image from 'next/image';
import { adminApi, AdminApiError } from '@/lib/adminApi';

interface ImageValue {
  url: string;
  alt: string;
  caption?: string;
}

/**
 * Accepts either a path already in the repo (/images/…) or a file uploaded to
 * the API's /uploads directory. Alt text is required — it is what screen
 * readers announce and what appears if an image fails to load.
 */
export function ImageUploader({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value?: ImageValue;
  onChange: (next: ImageValue | undefined) => void;
  required?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const { url } = await adminApi.upload(file);
      onChange({ url, alt: value?.alt ?? '', caption: value?.caption });
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <fieldset className="rounded-lg border border-sand-200 p-4">
      <legend className="px-2 text-sm font-medium text-ink">
        {label} {required ? <span className="text-muted">*</span> : null}
      </legend>

      <div className="flex gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-sand-100">
          {value?.url ? (
            <Image src={value.url} alt={value.alt || ''} fill sizes="128px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-muted">
              No image
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={value?.url ?? ''}
            onChange={(e) => onChange({ url: e.target.value, alt: value?.alt ?? '' })}
            placeholder="/images/mara-lions-stalking.jpg"
            className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
          <input
            type="text"
            value={value?.alt ?? ''}
            onChange={(e) => onChange({ url: value?.url ?? '', alt: e.target.value })}
            placeholder="Alt text — describe the image for screen readers"
            className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />

          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-full border border-sand-300 px-3 py-1.5 text-xs transition-colors hover:border-forest-900">
              {uploading ? 'Uploading…' : 'Upload file'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onFile}
                disabled={uploading}
                className="sr-only"
              />
            </label>
            {value?.url ? (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="text-xs text-muted underline hover:text-maroon-600"
              >
                Clear
              </button>
            ) : null}
          </div>

          {error ? <p className="text-xs text-maroon-600">{error}</p> : null}
        </div>
      </div>
    </fieldset>
  );
}
