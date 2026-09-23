'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { whatsappHref } from '@/lib/format';

interface TawkApi {
  maximize?: () => void;
  hideWidget?: () => void;
  onLoad?: () => void;
  onChatMinimized?: () => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

const TAWK_SRC = 'https://embed.tawk.to/6ab3ef09dce7f834416691c8/1k37drfkc';

/**
 * Floating contact launcher, fixed bottom-right on every public page.
 * Replaces the old WhatsApp-only button: tapping the bubble opens the live
 * assistant, and the expanded stack offers WhatsApp as the second channel.
 *
 * Tawk's embed is ~200KB of third-party JS that also sets its own cookies, so
 * it is injected on the first assistant click rather than on page load. Nobody
 * who never opens a chat pays for it. Its own launcher is suppressed (see
 * hideWidget below) because this component is the launcher.
 */
export function ContactLauncher({ phone }: { phone: string }) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const loadState = useRef<'idle' | 'loading' | 'ready'>('idle');

  // Appears after a short scroll so it does not sit over the hero CTAs.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Collapse on outside click and on Escape, like any other popover.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openAssistant = useCallback(() => {
    setOpen(false);

    if (loadState.current === 'ready') {
      window.Tawk_API?.maximize?.();
      return;
    }
    if (loadState.current === 'loading') return;

    loadState.current = 'loading';
    setLoading(true);

    // Tawk reads these off window before the embed evaluates, so the hooks
    // have to be registered up front rather than after the script loads.
    const api: TawkApi = window.Tawk_API ?? {};
    api.onLoad = () => {
      loadState.current = 'ready';
      setLoading(false);
      // Suppress Tawk's own bubble; this component is the only launcher.
      window.Tawk_API?.hideWidget?.();
      window.Tawk_API?.maximize?.();
    };
    window.Tawk_API = api;
    window.Tawk_LoadStart = new Date();

    const s = document.createElement('script');
    s.async = true;
    s.src = TAWK_SRC;
    s.charset = 'UTF-8';
    // Verbatim from Tawk's published snippet. "*" is not one of the two valid
    // values for the attribute, so browsers fall back to "anonymous", which is
    // the mode the CDN's Access-Control-Allow-Origin: * satisfies anyway.
    s.setAttribute('crossorigin', '*');
    s.onerror = () => {
      // Blocked by an extension, a privacy blocker or a dead connection. Reset
      // so a later click retries, and fall back to WhatsApp rather than
      // leaving a dead button.
      loadState.current = 'idle';
      setLoading(false);
      window.open(whatsappHref(phone), '_blank', 'noopener,noreferrer');
    };

    // Inserted before the first <script> exactly as Tawk's snippet does, rather
    // than appended to <body>.
    const insert = () => {
      const s0 = document.getElementsByTagName('script')[0];
      if (s0?.parentNode) {
        s0.parentNode.insertBefore(s, s0);
      } else {
        document.body.appendChild(s);
      }
    };

    // Tawk's bootstrap only inserts its second-stage bundle when the document
    // is already complete or once `load` fires. A click almost always happens
    // after that, but a click during loading would otherwise leave the embed
    // inert, so wait for `load` in that case instead of injecting into a
    // document that will never re-fire it.
    if (document.readyState === 'complete') {
      insert();
    } else {
      window.addEventListener('load', insert, { once: true });
    }
  }, [phone]);

  const shellTransition = visible
    ? 'translate-y-0 opacity-100'
    : 'pointer-events-none translate-y-4 opacity-0';

  return (
    <div
      ref={rootRef}
      className={`fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 transition-all duration-500 md:bottom-6 md:right-6 ${shellTransition}`}
      style={{ transitionTimingFunction: 'var(--ease-soft)' }}
    >
      {/* Options fan upward from the bubble, WhatsApp furthest out. */}
      <a
        href={whatsappHref(phone)}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-2.5 rounded-full bg-[#25D366] py-2.5 pl-3 pr-4 text-sm font-medium text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] transition-all duration-300 hover:bg-[#1ebe5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-3 scale-95 opacity-0'
        }`}
        style={{ transitionDelay: open ? '40ms' : '0ms' }}
      >
        <WhatsAppIcon />
        WhatsApp
      </a>

      <button
        type="button"
        onClick={openAssistant}
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        className={`flex items-center gap-2.5 rounded-full bg-amber-500 py-2.5 pl-3 pr-4 text-sm font-medium text-forest-950 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] transition-all duration-300 hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-2 scale-95 opacity-0'
        }`}
      >
        <SparkIcon />
        Chat with us
        <span className="rounded-full bg-forest-950/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
          Live
        </span>
      </button>

      {/*
        The bubble itself opens the assistant, so the default channel stays one
        tap. The caret expands the stack, which is why it is a separate control
        rather than the whole bubble toggling.
      */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Hide contact options' : 'Show contact options'}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-forest-900/90 text-sand-100 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.5)] backdrop-blur transition-colors hover:bg-forest-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={openAssistant}
          disabled={loading}
          aria-label="Chat with us"
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-forest-950 shadow-[0_0_0_8px_rgba(245,158,11,0.14),0_0_22px_5px_rgba(245,158,11,0.35),0_8px_24px_-6px_rgba(0,0,0,0.4)] transition-all duration-500 hover:scale-105 hover:bg-amber-400 hover:shadow-[0_0_0_14px_rgba(245,158,11,0.22),0_0_40px_10px_rgba(245,158,11,0.5),0_10px_28px_-6px_rgba(0,0,0,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-80 md:h-14 md:w-14"
          style={{ transitionTimingFunction: 'var(--ease-soft)' }}
        >
          {loading ? (
            <svg
              className="h-5 w-5 animate-spin md:h-6 md:w-6"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <ChatIcon />
          )}
          {/* Quiet pulse so the default channel reads as live, not decorative. */}
          <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-amber-500 bg-[#25D366]">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-75" />
          </span>
        </button>
      </div>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="md:h-6 md:w-6"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" />
      <path d="M18.5 14l.9 2.6L22 17.5l-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" opacity="0.7" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23a8.18 8.18 0 0 1 5.82 2.42 8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.22-8.24 8.22z" />
    </svg>
  );
}
