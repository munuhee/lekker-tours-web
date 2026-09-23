import { SectionHeading } from '@/components/ui/SectionHeading';

/**
 * Embedded film block.
 *
 * `youtubeId` comes from admin -> Site Settings. Until one is set, a styled
 * placeholder renders instead, deliberately NOT someone else's safari footage,
 * which would misrepresent whose trip the viewer is watching.
 */
export function VideoSection({ youtubeId }: { youtubeId?: string }) {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Watch the journey"
          title="View East Africa in motion."
          align="center"
        />

        <div className="mx-auto max-w-4xl overflow-hidden rounded-card bg-forest-950 shadow-card">
          {youtubeId ? (
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                title="Lekker Tours and Travel film"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-4 px-6 text-center">
              <span
                aria-hidden
                className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 text-2xl text-amber-400"
              >
                ▶
              </span>
              <p className="text-lg text-sand-50">Your safari film goes here</p>
              <p className="max-w-md text-sm leading-relaxed text-sand-200/60">
                Add a YouTube video ID in the admin dashboard under Site settings, and your own
                footage will play in this frame.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
