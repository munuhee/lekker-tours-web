/**
 * Cache tag vocabulary shared with the Express API, which POSTs these strings
 * to /api/revalidate after any admin write. Keep in step with the
 * `revalidateTags` callbacks in api/src/routes/*.js.
 */
export const TAGS = {
  home: 'home',
  tours: 'tours',
  tour: (slug: string) => `tour:${slug}`,
  destinations: 'destinations',
  destination: (slug: string) => `destination:${slug}`,
  blog: 'blog',
  post: (slug: string) => `post:${slug}`,
  testimonials: 'testimonials',
  faqs: 'faqs',
  settings: 'settings',
} as const;

/** Public pages revalidate on this cadence even without a webhook. */
export const DEFAULT_REVALIDATE = 300;
