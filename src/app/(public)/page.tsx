import { Hero } from '@/components/home/Hero';
import { CredentialsStrip } from '@/components/home/CredentialsStrip';
import { WhyUs } from '@/components/home/WhyUs';
import { VideoSection } from '@/components/home/VideoSection';
import { FeaturedTours } from '@/components/home/FeaturedTours';
import { CountriesGrid } from '@/components/home/CountriesGrid';
import { PromoBand } from '@/components/home/PromoBand';
import { TestimonialCarousel } from '@/components/home/TestimonialCarousel';
import { FaqBlock } from '@/components/home/FaqBlock';
import { BlogCard } from '@/components/blog/BlogCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { ParallaxSection } from '@/components/ui/ParallaxSection';

import { apiListSafe } from '@/lib/api';
import { getSettings } from '@/lib/settings';
import { TAGS } from '@/lib/tags';
import type { Tour, Destination, Testimonial, Faq, BlogPost } from '@/types';

export default async function HomePage() {
  const [settings, tours, destinations, testimonials, faqs, posts] = await Promise.all([
    getSettings(),
    apiListSafe<Tour>('/api/tours?bestSelling=true&limit=6', { tags: [TAGS.tours, TAGS.home] }),
    apiListSafe<Destination>('/api/destinations?limit=5', { tags: [TAGS.destinations, TAGS.home] }),
    apiListSafe<Testimonial>('/api/testimonials?limit=8', { tags: [TAGS.testimonials, TAGS.home] }),
    apiListSafe<Faq>('/api/faqs?limit=6', { tags: [TAGS.faqs, TAGS.home] }),
    apiListSafe<BlogPost>('/api/blog?limit=3', { tags: [TAGS.blog, TAGS.home] }),
  ]);

  return (
    <>
      <Hero hero={settings.hero} socials={settings.socials} />
      <CredentialsStrip />
      <WhyUs values={settings.values} phone={settings.contact.phone} />
      <VideoSection youtubeId={settings.video?.youtubeId} />
      <FeaturedTours tours={tours.items} />
      <CountriesGrid destinations={destinations.items} />
      <PromoBand />

      {testimonials.items.length > 0 ? (
        <ParallaxSection
          image={{ url: '/images/mara-lioness-cubs.jpg' }}
          overlay="light"
          className="py-12 sm:py-16 md:py-28"
        >
          <div className="container-page">
            <SectionHeading
              eyebrow="Traveller stories"
              title="Our happy travellers"
              tone="light"
              action={
                <ButtonLink href="/contact" variant="outline-light">
                  Read all reviews →
                </ButtonLink>
              }
            />
            <TestimonialCarousel testimonials={testimonials.items} />
          </div>
        </ParallaxSection>
      ) : null}

      <FaqBlock faqs={faqs.items} />

      {posts.items.length > 0 ? (
        <section className="bg-white py-12 sm:py-16 md:py-28">
          <div className="container-page">
            <SectionHeading
              eyebrow="From the journal"
              title="Field notes and planning guides"
              action={
                <ButtonLink href="/blog" variant="ghost">
                  View all posts →
                </ButtonLink>
              }
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {posts.items.map((post, i) => (
                <Reveal key={post._id} delay={i * 90}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ParallaxSection
        image={{ url: '/images/balloon-mara-sunrise.jpg' }}
        overlay="dark"
        className="py-12 sm:py-16 md:py-28"
      >
        <div className="container-page text-center">
          <h2 className="mx-auto max-w-2xl text-3xl text-sand-50 md:text-4xl">
            Tell us where the wild calls you
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-sand-200/75">
            Our specialists will respond within 24 hours to begin your custom itinerary.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">
              Start your journey
            </ButtonLink>
            <ButtonLink href="/tours" variant="outline-light" size="lg">
              Browse expeditions
            </ButtonLink>
          </div>
        </div>
      </ParallaxSection>
    </>
  );
}
