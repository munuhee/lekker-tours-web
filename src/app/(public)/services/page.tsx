import type { Metadata } from 'next';
import { PageBanner } from '@/components/ui/PageBanner';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'Kenya safaris, holiday packages, custom tours, airport transfers, accommodation booking, group and corporate travel, coordinated through one dependable point of contact.',
};

/**
 * Section 03 of the company profile. Nine services, kept in the profile's own
 * order so the page and the PDF can be read side by side.
 */
const SERVICES = [
  {
    title: 'Kenya Safaris',
    body: "Tailor-made and packaged safari experiences to Kenya's leading wildlife destinations, matched to the traveller's time, interests and budget.",
  },
  {
    title: 'Holiday Packages',
    body: 'Domestic and regional holidays covering safari, beach, city, nature, family and special-occasion travel.',
  },
  {
    title: 'Custom Tours & Excursions',
    body: 'Private day trips, weekend getaways, cultural experiences, nature activities and personalised itineraries.',
  },
  {
    title: 'Airport Transfers',
    body: 'Pre-arranged airport pickup and drop-off coordination for individuals, families, groups and corporate travellers.',
  },
  {
    title: 'Accommodation Booking',
    body: 'Assistance with selecting and arranging hotels, lodges, camps and other suitable accommodation.',
  },
  {
    title: 'Group Travel',
    body: 'Travel planning for schools, churches, families, social groups, clubs, companies and other organised groups.',
  },
  {
    title: 'Corporate & Business Travel',
    body: 'Travel coordination for meetings, retreats, conferences, staff movements and business trips.',
  },
  {
    title: 'Transport & Ground Logistics',
    body: 'Coordination of suitable vehicles, drivers, transfers and ground movement according to itinerary requirements.',
  },
  {
    title: 'International & Regional Travel',
    body: 'Travel planning beyond Kenya through suitable airline, hotel and destination partners, where required.',
  },
];

/** Section 05, who we serve. */
const AUDIENCES = [
  {
    title: 'Individual Travellers',
    body: 'Flexible trips for solo travellers seeking adventure, relaxation, culture or nature.',
  },
  {
    title: 'Couples & Honeymooners',
    body: 'Private and romantic itineraries combining safari, beach and memorable experiences.',
  },
  {
    title: 'Families',
    body: 'Comfortable, practical travel plans with age-appropriate activities and manageable schedules.',
  },
  {
    title: 'Groups',
    body: 'Coordinated travel for churches, schools, clubs, associations, friends and social groups.',
  },
  {
    title: 'Corporate Clients',
    body: 'Business travel, retreats, conferences, staff transport and organised corporate programmes.',
  },
  {
    title: 'International Visitors',
    body: 'Inbound Kenya travel planning, airport transfers, accommodation and safari coordination.',
  },
];

/** Section 07, how we work. */
const PROCESS = [
  {
    title: 'Tell Us Your Plan',
    body: 'Share your destination, preferred dates, number of travellers, interests and approximate budget.',
  },
  {
    title: 'We Build the Options',
    body: 'We recommend a suitable itinerary and travel components based on your priorities.',
  },
  {
    title: 'Review & Refine',
    body: 'We adjust the itinerary, accommodation, transport and activities until the plan fits.',
  },
  {
    title: 'Confirm Your Trip',
    body: 'Once the selected arrangements are confirmed, we provide the agreed booking and payment details.',
  },
  {
    title: 'Travel With Confidence',
    body: 'We coordinate the agreed travel arrangements and remain available for communication and support.',
  },
];

export default async function ServicesPage() {
  const settings = await getSettings();

  return (
    <>
      <PageBanner
        title="Our Services"
        subtitle="Tours, safaris, holidays and travel services: planned and coordinated from Nairobi."
        image={{
          url: '/images/mara-herd-safari.jpg',
          alt: 'A safari vehicle watching a herd on the plains',
        }}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/services', label: 'Our Services' },
        ]}
      />

      <section className="bg-sand-50 py-16 md:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we do"
            title="A broad service portfolio built around leisure, group and business travel"
            description="Whether it is a weekend safari, a family holiday, a group excursion, a beach escape, an airport transfer or a tailor-made itinerary, our goal is to be one dependable point of contact from planning to completion."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={(i % 3) * 90}>
                <article className="h-full rounded-card border border-sand-200 bg-white p-7">
                  <span aria-hidden className="mb-4 block font-display text-2xl text-amber-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mb-3 text-lg">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{service.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="How we work"
            title="A simple process designed to make travel planning easy"
          />

          <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((step, i) => (
              <Reveal key={step.title} delay={i * 80}>
                <li className="h-full rounded-card border border-sand-200 bg-sand-50 p-6">
                  <span
                    aria-hidden
                    className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 font-display text-sm text-forest-950"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mb-2 text-base">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{step.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          <div className="mt-10 rounded-card border border-sand-200 bg-sand-50 p-7">
            <h3 className="mb-3 text-lg">For groups and organisations</h3>
            <p className="max-w-3xl text-sm leading-relaxed text-muted">
              For larger groups, we can work from a written brief covering dates, passenger numbers,
              accommodation standard, transport requirements, activities, meal preferences, budget
              and any special considerations.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-900 py-16 md:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Who we serve"
            title="Travel planned around how you actually travel"
            tone="light"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {AUDIENCES.map((audience, i) => (
              <Reveal key={audience.title} delay={(i % 3) * 90}>
                <article className="h-full rounded-card border border-white/10 bg-forest-800/40 p-7">
                  <h3 className="mb-3 text-lg text-sand-50">{audience.title}</h3>
                  <p className="text-sm leading-relaxed text-sand-200/75">{audience.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 rounded-card border border-white/10 bg-forest-800/40 p-7">
            <h3 className="mb-3 text-lg text-sand-50">Our customer promise</h3>
            <p className="max-w-3xl text-sm leading-relaxed text-sand-200/75">
              From the first enquiry, clients should know what they are booking, what is included,
              what is not included and what the next step is. We aim to respond promptly,
              communicate clearly and coordinate the journey with care.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-950 py-16 md:py-20">
        <div className="container-page text-center">
          <h2 className="mx-auto max-w-2xl text-3xl text-sand-50">Let us plan your next journey</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand-200/75">
            Tell us where you would like to go and how you would like to travel, and we will build
            the options around it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact" size="lg">
              Start your journey
            </ButtonLink>
            <ButtonLink
              href={`tel:${settings.contact.phone.replace(/[^\d+]/g, '')}`}
              variant="outline-light"
              size="lg"
            >
              {settings.contact.phone}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
