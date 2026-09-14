import type { ReactNode } from 'react';

/**
 * Full-bleed photographic background that stays fixed while content scrolls
 * over it.
 *
 * `bg-fixed` is ignored or janky on iOS Safari and some Android browsers, so
 * the image is also set as a normal cover background — the section still looks
 * right there, it simply scrolls with the page. Under prefers-reduced-motion
 * the fixed attachment is disabled in globals.css.
 *
 * Overlays are gradients rather than flat scrims: heavier at the top where
 * headings sit, lighter through the middle so the photograph stays visible.
 */
export function ParallaxSection({
  image,
  overlay = 'dark',
  className = '',
  children,
}: {
  image: { url: string; alt?: string };
  overlay?: 'light' | 'dark' | 'darker';
  className?: string;
  children: ReactNode;
}) {
  const overlays = {
    light: 'bg-gradient-to-b from-forest-950/45 via-forest-950/20 to-forest-950/40',
    dark: 'bg-gradient-to-b from-forest-950/58 via-forest-950/32 to-forest-950/52',
    darker: 'bg-gradient-to-b from-forest-950/70 via-forest-950/45 to-forest-950/65',
  };

  return (
    <section
      className={`parallax-section relative bg-cover bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: `url(${image.url})` }}
    >
      {/* Decorative: the photograph carries no information the copy does not. */}
      <div aria-hidden className={`absolute inset-0 ${overlays[overlay]}`} />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
