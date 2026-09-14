export type Status = 'draft' | 'published';
export type Country = 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda' | 'Zanzibar';
export type TourCategory = 'SafariExpedition' | 'WeekendEscape';

export interface ApiImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  activities: string[];
  meals: Array<'Breakfast' | 'Lunch' | 'Dinner'>;
  accommodation?: string;
}

export interface Tour {
  _id: string;
  id: string;
  title: string;
  slug: string;
  category: TourCategory;
  summary: string;
  description: string;
  priceFrom: number;
  currency: string;
  durationDays: number;
  durationNights: number;
  durationLabel: string;
  groupSizeMax: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  rating: number;
  reviewCount: number;
  destination?: Pick<Destination, '_id' | 'name' | 'slug' | 'country'> | string;
  countries: Country[];
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  heroImage: ApiImage;
  gallery: ApiImage[];
  featured: boolean;
  bestSelling: boolean;
  status: Status;
  order: number;
  seo?: Seo;
  /* discriminator fields */
  parks?: string[];
  gameDriveCount?: number;
  conservancyFeesIncluded?: boolean;
  departsFrom?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Park {
  name: string;
  slug?: string;
  blurb?: string;
  image?: ApiImage;
  bestTime?: string;
  highlights: string[];
}

export interface Destination {
  _id: string;
  id: string;
  name: string;
  slug: string;
  country: Country;
  tagline?: string;
  categoryLabel?: string;
  overview: string;
  heroImage: ApiImage;
  cardImage: ApiImage;
  highlights: string[];
  bestTime?: { months: string[]; note?: string };
  parks: Park[];
  parkCount: number;
  featured: boolean;
  status: Status;
  order: number;
  seo?: Seo;
}

export interface BlogPost {
  _id: string;
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: ApiImage;
  author: { name: string; avatar?: string };
  tags: string[];
  readingMinutes: number;
  publishedAt: string;
  featured: boolean;
  status: Status;
  seo?: Seo;
}

export interface Testimonial {
  _id: string;
  id: string;
  authorName: string;
  authorLocation?: string;
  avatar?: { url?: string; alt?: string };
  quote: string;
  rating: number;
  tourName?: string;
  featured: boolean;
  status: Status;
  order: number;
}

export interface Faq {
  _id: string;
  id: string;
  question: string;
  answer: string;
  group: 'general' | 'booking' | 'travel' | 'payment';
  order: number;
  status: Status;
}

export interface SiteSettings {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: ApiImage;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  values: Array<{ title: string; description: string; icon?: string }>;
  contact: {
    phone: string;
    whatsapp?: string;
    email: string;
    addressLine: string;
    poBox?: string;
    city: string;
    supportHours: string;
  };
  socials: Partial<Record<'facebook' | 'instagram' | 'x' | 'youtube' | 'tiktok', string>>;
  newsletter: { heading: string; blurb: string };
  footerBlurb: string;
  seo: { defaultTitle: string; defaultDescription: string; ogImage?: string };
}

export interface Enquiry {
  _id: string;
  id: string;
  type: 'contact' | 'booking';
  name: string;
  email: string;
  phone?: string;
  expeditionInterest?: string;
  budgetUSD?: number;
  message?: string;
  tour?: { _id: string; title: string; slug: string } | string;
  tourTitle?: string;
  travelDate?: string;
  guests?: { adults: number; children: number; infants: number };
  totalGuests?: number | null;
  status: 'new' | 'read' | 'responded' | 'archived';
  adminNotes?: string;
  createdAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  unreadCount?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface ApiFailure {
  success: false;
  error: { message: string; code: string; details?: Record<string, string> };
}
