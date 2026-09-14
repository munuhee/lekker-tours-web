'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Crossfading background slideshow for the hero.
 *
 * The first slide renders with `priority` so it remains the LCP element; the
 * rest load lazily. Rotation stops entirely under prefers-reduced-motion, and
 * pauses while the tab is hidden so it is not animating off-screen.
 *
 * No visible controls — the images are decorative and carry no information the
 * copy does not already state.
 */
export function HeroSlideshow({
  slides,
  intervalMs = 6000,
}: {
  slides: Array<{ url: string; alt: string }>;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      stop();
      timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [slides.length, intervalMs]);

  return (
    <>
      {slides.map((slide, i) => (
        <Image
          key={slide.url}
          src={slide.url}
          alt={i === 0 ? slide.alt : ''}
          aria-hidden={i !== 0}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1600ms] ease-soft motion-reduce:transition-none ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </>
  );
}
