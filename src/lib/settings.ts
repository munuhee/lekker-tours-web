import { apiGet } from './api';
import { TAGS } from './tags';
import type { SiteSettings } from '@/types';

/**
 * Fallback used only when the API is unreachable, so the shell still renders
 * with correct contact details rather than collapsing into an error page.
 */
const FALLBACK: SiteSettings = {
  hero: {
    title: 'Feel the Pulse of the African Wilderness',
    subtitle:
      'Expertly curated expeditions from the heart of Nairobi to the legendary golden plains.',
    backgroundImage: {
      url: '/images/mara-wildebeest-migration.jpg',
      alt: 'Wildebeest crossing the Maasai Mara plains',
    },
    primaryCta: { label: 'Explore Expeditions', href: '/tours' },
    secondaryCta: { label: 'Plan My Trip', href: '/contact' },
  },
  values: [],
  contact: {
    phone: '+254 705 356 161',
    whatsapp: '+254 705 356 161',
    email: 'lekkertours@gmail.com',
    addressLine: 'Agip House, Haile Selassie Avenue',
    poBox: 'P.O Box 13689-00200',
    city: 'Nairobi, Kenya',
    supportHours: 'We aim to respond to enquiries as quickly as practical',
  },
  socials: {},
  // No video in the fallback: if the API is down we cannot know which film the
  // admin chose, and the placeholder is the honest thing to show.
  video: {},
  newsletter: {
    heading: 'Stories from the bush',
    blurb: 'Occasional dispatches on wildlife, seasons and new expeditions. No noise.',
  },
  footerBlurb:
    'Bringing the pulse of the African wilderness to life through expertly curated expeditions. Based in Nairobi, serving East Africa with excellence.',
  seo: {
    defaultTitle: 'Lekker Tours and Travel',
    defaultDescription:
      'Expertly curated safari expeditions and weekend escapes across East Africa, from our base in Nairobi.',
  },
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    return await apiGet<SiteSettings>('/api/settings', { tags: [TAGS.settings] });
  } catch (err) {
    console.error('[settings] falling back to defaults:', (err as Error).message);
    return FALLBACK;
  }
}
