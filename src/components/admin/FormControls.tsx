'use client';

import type { ReactNode } from 'react';

const inputBase =
  'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none disabled:bg-sand-50';

export function TextField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  error,
  hint,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-muted">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`${inputBase} ${error ? 'border-maroon-600' : 'border-sand-300 focus:border-amber-500'}`}
      />
      {hint && !error ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-maroon-600">{error}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  name,
  value,
  onChange,
  rows = 4,
  required = false,
  placeholder,
  error,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-muted">*</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`${inputBase} ${error ? 'border-maroon-600' : 'border-sand-300 focus:border-amber-500'}`}
      />
      {hint && !error ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-maroon-600">{error}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-muted">*</span> : null}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} border-sand-300 bg-white focus:border-amber-500`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-amber-500"
      />
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Edits a string[] as one item per line — simpler than a repeater for short lists. */
export function ListField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 5,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <textarea
        rows={rows}
        value={value.join('\n')}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
          )
        }
        className={`${inputBase} border-sand-300 focus:border-amber-500`}
      />
      <p className="mt-1 text-xs text-muted">{hint ?? 'One per line.'}</p>
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-sand-200 bg-white p-6">
      <h2 className="text-lg">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function FormActions({
  saving,
  onDelete,
  deleting,
  submitLabel = 'Save',
}: {
  saving: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-sand-200 bg-sand-100/95 py-4 backdrop-blur">
      <button
        type="submit"
        disabled={saving}
        className="h-11 rounded-full bg-amber-500 px-8 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
      >
        {saving ? 'Saving…' : submitLabel}
      </button>

      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="text-sm text-maroon-600 underline transition-colors hover:text-maroon-700 disabled:opacity-60"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      ) : null}
    </div>
  );
}
