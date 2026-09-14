import type { Metadata } from 'next';
import Image from 'next/image';
import { PageBanner } from '@/components/ui/PageBanner';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'The Lekker Spirit',
  description:
    'Based in the heart of Nairobi, Lekker Tours and Travel is your gateway to the raw majesty of East Africa — built on local expertise, round-the-clock support and respect for the land.',
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <PageBanner
        title="The Lekker Spirit"
        subtitle="Where the pulse of the African wilderness meets the precision of Nairobi expertise."
        image={{
          url: '/images/maasai-warriors-landscape.jpg',
          alt: 'Guides walking out across open savanna at golden hour',
        }}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/about', label: 'The Lekker Spirit' },
        ]}
      />

      <section className="bg-sand-50 py-16 md:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-amber-600">Our story</p>
            <h2 className="mb-6 text-3xl leading-tight md:text-4xl">
              A gateway to the raw majesty of East Africa
            </h2>
            <div className="space-y-5 text-base leading-relaxed text-muted">
              <p>
                Witness the Big Five roam across golden plains where the spirit of the savanna comes
                alive. Based in the vibrant heart of Nairobi, Lekker Tours and Travel serves as your
                gateway to the raw majesty of Kenya and the wider region.
              </p>
              <p>
                Every journey is designed to immerse you in the theatre of nature, where the iconic
                landscapes of East Africa tell a story of untamed beauty. We bridge modern comfort
                with untamed adventure — a vehicle that gets you to the sighting, a camp that lets
                you sleep well afterwards, and a guide who knows why both matter.
              </p>
              <p>
                We work from Agip House on Haile Selassie Avenue, and our team is reachable at any
                hour of any day, from your first enquiry to your final sunset.
              </p>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/tours">Explore expeditions</ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Talk to us →
              </ButtonLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-card">
              <Image
                src="/images/maasai-warrior-portrait.jpg"
                alt="Portrait of a guide in traditional dress"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-card">
              <Image
                src="/images/lodge-deck-chairs.jpg"
                alt="Lodge deck looking out over the plains"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {settings.values?.length ? (
        <section className="bg-forest-900 py-16 md:py-24">
          <div className="container-page">
            <SectionHeading
              eyebrow="What we stand for"
              title="How we work"
              tone="light"
              description="Three commitments that shape every itinerary we write."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {settings.values.map((value, i) => (
                <Reveal key={value.title} delay={i * 90}>
                  <article className="h-full rounded-card border border-white/10 bg-forest-800/40 p-7">
                    <span
                      aria-hidden
                      className="mb-4 block font-display text-3xl text-amber-400"
                    >
                      0{i + 1}
                    </span>
                    <h3 className="mb-3 text-lg text-sand-50">{value.title}</h3>
                    <p className="text-sm leading-relaxed text-sand-200/75">{value.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-16 md:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="The Big Five guarantee"
            title="Routes optimised for the icons of the savanna"
            description="Lions, leopards, elephants, rhinos and buffaloes. We plan around where they actually are — and we tell you honestly when a sighting cannot be promised."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: 'Expert local guides',
                body: 'Decades of tracking experience between them, and the judgement to know when to wait and when to move.',
              },
              {
                title: 'Custom 4x4 vehicles',
                body: 'Built for visibility — pop-up roofs, a guaranteed window seat for every guest, and charging on board.',
              },
              {
                title: 'Authentic bush meals',
                body: 'Breakfast at sunrise in the field, lunch under an acacia, dinner beneath more stars than you have seen.',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <article className="h-full rounded-card border border-sand-200 bg-sand-50 p-7">
                  <h3 className="mb-3 text-lg">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-950 py-16 md:py-20">
        <div className="container-page text-center">
          <h2 className="mx-auto max-w-2xl text-3xl text-sand-50">
            Ready when you are
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand-200/75">
            {settings.contact.supportHours} — from the first enquiry to the final sunset of your tour.
          </p>
          <div className="mt-8">
            <ButtonLink href="/contact" size="lg">
              Start your journey
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
