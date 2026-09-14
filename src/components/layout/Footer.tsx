import Image from 'next/image';
import Link from 'next/link';
import type { SiteSettings } from '@/types';
import { telHref, whatsappHref } from '@/lib/format';
import { NewsletterForm } from './NewsletterForm';

const EXPLORE = [
  { href: '/tours', label: 'Our Safaris' },
  { href: '/tours?category=WeekendEscape', label: 'Weekend Escapes' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/blog', label: 'Journal' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
];

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

export function Footer({ settings }: { settings: SiteSettings }) {
  const { contact, socials, newsletter, footerBlurb } = settings;
  const year = new Date().getFullYear();
  const activeSocials = Object.entries(socials ?? {}).filter(([, url]) => Boolean(url));

  return (
    <footer className="bg-forest-950 text-sand-100">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Lekker Tours and Travel"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-xl text-sand-50">Lekker</span>
              <span className="text-[0.6rem] uppercase tracking-[0.28em] text-amber-400">
                Tours &amp; Travels
              </span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-sand-200/70">{footerBlurb}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-amber-400/80">
            Explore · Discover · Experience
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-sm uppercase tracking-[0.2em] text-sand-50">Explore</h3>
          <ul className="space-y-3 text-sm">
            {EXPLORE.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sand-200/70 transition-colors hover:text-amber-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-sm uppercase tracking-[0.2em] text-sand-50">Get in touch</h3>
          <address className="space-y-3 text-sm not-italic text-sand-200/70">
            <p>
              <a href={`tel:${telHref(contact.phone)}`} className="transition-colors hover:text-amber-400">
                {contact.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${contact.email}`} className="transition-colors hover:text-amber-400">
                {contact.email}
              </a>
            </p>
            <p className="leading-relaxed">
              {contact.addressLine}
              {contact.poBox ? <><br />{contact.poBox}</> : null}
              <br />
              {contact.city}
            </p>
            <p className="inline-flex items-center gap-2 rounded-full bg-forest-800/60 px-3 py-1 text-xs text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              {contact.supportHours}
            </p>
          </address>

          {contact.whatsapp ? (
            <a
              href={whatsappHref(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-sand-200/70 transition-colors hover:text-amber-400"
            >
              Message us on WhatsApp
            </a>
          ) : null}
        </div>

        <div>
          <h3 className="mb-5 text-sm uppercase tracking-[0.2em] text-sand-50">
            {newsletter.heading}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-sand-200/70">{newsletter.blurb}</p>
          <NewsletterForm />

          {activeSocials.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {activeSocials.map(([key, url]) => (
                <a
                  key={key}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-sand-100/20 px-3 py-1.5 text-xs text-sand-200/70 transition-colors hover:border-amber-500 hover:text-amber-400"
                >
                  {SOCIAL_LABELS[key] ?? key}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-sand-200/50 sm:flex-row">
          <p>© {year} Lekker Tours and Travel. All rights reserved.</p>
          <p>Based in Nairobi, serving East Africa.</p>
        </div>
      </div>
    </footer>
  );
}
