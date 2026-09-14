import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageBanner } from '@/components/ui/PageBanner';
import { BlogCard } from '@/components/blog/BlogCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';

import { apiGet, apiListSafe, ApiRequestError } from '@/lib/api';
import { TAGS } from '@/lib/tags';
import { formatDate } from '@/lib/format';
import type { BlogPost } from '@/types';

type Params = Promise<{ slug: string }>;

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await apiGet<BlogPost>(`/api/blog/${slug}`, { tags: [TAGS.post(slug), TAGS.blog] });
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Article not found' };

  return {
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: [{ url: post.seo?.ogImage ?? post.coverImage.url }],
    },
  };
}

/**
 * Seeded posts use a small Markdown subset (## headings, **bold**, - bullets).
 * Rendered manually rather than pulling in a full Markdown pipeline.
 */
function renderBody(content: string) {
  const blocks = content.trim().split(/\n{2,}/);

  return blocks.map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="mt-10 mb-4 text-2xl">
          {trimmed.slice(3)}
        </h2>
      );
    }

    if (/^[-*] /m.test(trimmed)) {
      const points = trimmed.split('\n').filter((l) => /^[-*] /.test(l.trim()));
      return (
        <ul key={i} className="my-5 space-y-2.5">
          {points.map((point, j) => (
            <li key={j} className="flex items-start gap-3 text-base leading-relaxed text-muted">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span>{renderInline(point.trim().replace(/^[-*] /, ''))}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="my-5 text-base leading-relaxed text-muted">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { items: more } = await apiListSafe<BlogPost>('/api/blog?limit=4', { tags: [TAGS.blog] });
  const related = more.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageBanner
        title={post.title}
        image={post.coverImage}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/blog', label: 'Journal' },
          { href: `/blog/${post.slug}`, label: post.title },
        ]}
        meta={
          <p className="flex flex-wrap items-center gap-3 text-sm text-sand-100/80">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingMinutes} min read</span>
            <span aria-hidden>·</span>
            <span>{post.author?.name ?? 'Lekker Tours'}</span>
          </p>
        }
      />

      <article className="bg-sand-50 py-16 md:py-20">
        <div className="container-page max-w-3xl">
          <p className="mb-8 border-l-2 border-amber-500 pl-5 font-display text-lg leading-relaxed text-forest-900">
            {post.excerpt}
          </p>

          <div>{renderBody(post.content)}</div>

          {post.tags?.length ? (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-sand-200 pt-8">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-sand-200 px-3 py-1 text-xs text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-12 rounded-card bg-forest-900 p-8 text-center">
            <h2 className="mb-3 text-xl text-sand-50">Planning a trip of your own?</h2>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-sand-200/75">
              Our Nairobi specialists will answer your questions directly and build an itinerary
              around your dates.
            </p>
            <ButtonLink href="/contact">Start your journey</ButtonLink>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="bg-white py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Keep reading" title="More from the journal" align="left" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={r._id} post={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
