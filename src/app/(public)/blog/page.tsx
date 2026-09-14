import type { Metadata } from 'next';
import { PageBanner } from '@/components/ui/PageBanner';
import { BlogCard } from '@/components/blog/BlogCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { apiListSafe } from '@/lib/api';
import { TAGS } from '@/lib/tags';
import type { BlogPost } from '@/types';

export const metadata: Metadata = {
  title: 'The Journal',
  description:
    'Field notes, planning guides and seasonal advice from our guides and specialists in Nairobi.',
};

export default async function BlogPage() {
  const { items } = await apiListSafe<BlogPost>('/api/blog?limit=12', { tags: [TAGS.blog] });

  return (
    <>
      <PageBanner
        title="The Journal"
        subtitle="Field notes, planning guides and honest advice from the people who run our expeditions."
        image={{
          url: '/images/balloon-mara-sunrise.jpg',
          alt: 'Hot air balloons rising over the Maasai Mara at sunrise',
        }}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/blog', label: 'Journal' },
        ]}
      />

      <section className="bg-sand-50 py-16 md:py-24">
        <div className="container-page">
          {items.length === 0 ? (
            <EmptyState
              title="No articles yet"
              message="Our guides are writing up their field notes. Check back soon, or ask us anything directly in the meantime."
              action={<ButtonLink href="/contact">Ask a specialist</ButtonLink>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((post, i) => (
                <Reveal key={post._id} delay={i * 80}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
