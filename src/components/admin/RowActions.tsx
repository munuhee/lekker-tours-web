'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Row-level actions.
 *
 * These used to be three ~11px underlined links sitting a few pixels apart, one
 * of which changed what was live on the public site and another of which
 * deleted the row. Same-looking targets, well under the 44px touch minimum.
 * Each action is now a bounded control, visually grouped, with the destructive
 * one separated and coloured differently.
 */
export function RowActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-1.5 sm:justify-end">{children}</div>
  );
}

const BASE =
  'inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs transition-colors disabled:opacity-50';

export function RowButton({
  onClick,
  disabled = false,
  destructive = false,
  title,
  icon,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  /** Tooltip; also the accessible name when the label is hidden on mobile. */
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${BASE} ${
        destructive
          ? 'text-maroon-600 hover:bg-maroon-600/10'
          : 'border border-sand-300 text-forest-800 hover:border-forest-900 hover:bg-sand-50'
      }`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </button>
  );
}

export function RowLink({
  href,
  title,
  icon,
  children,
}: {
  href: string;
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      className={`${BASE} border border-sand-300 text-forest-800 hover:border-forest-900 hover:bg-sand-50`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </Link>
  );
}
