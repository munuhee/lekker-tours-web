import Image from 'next/image';
import Link from 'next/link';

interface Crumb {
  href: string;
  label: string;
}

interface PageBannerProps {
  title: string;
  subtitle?: string;
  image: { url: string; alt: string };
  crumbs?: Crumb[];
  meta?: React.ReactNode;
  height?: 'short' | 'tall';
}

export function PageBanner({
  title,
  subtitle,
  image,
  crumbs,
  meta,
  height = 'short',
}: PageBannerProps) {
  return (
    <section
      className={`relative flex items-end overflow-hidden ${
        height === 'tall' ? 'min-h-[72vh]' : 'min-h-[56vh]'
      }`}
    >
      <Image src={image.url} alt={image.alt} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/92 via-forest-950/55 to-forest-950/35" />

      <div className="container-page relative z-10 pb-14 pt-32">
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-sand-200/70">
              {crumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {i > 0 ? <span aria-hidden>/</span> : null}
                  <Link href={crumb.href} className="transition-colors hover:text-amber-400">
                    {crumb.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <h1 className="max-w-3xl font-display text-4xl leading-tight text-white md:text-5xl">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-sand-100/85">{subtitle}</p>
        ) : null}

        {meta ? <div className="mt-7">{meta}</div> : null}
      </div>
    </section>
  );
}
