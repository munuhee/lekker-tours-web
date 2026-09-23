/**
 * Prices are quoted in Kenyan shillings. en-KE renders KES as "KSh 1,200";
 * en-US would render the same value as the less familiar "KES 1,200".
 */
export function formatPrice(amount: number, currency = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDuration(days: number, nights?: number): string {
  if (days === 1) return 'Day trip';
  const n = nights ?? Math.max(0, days - 1);
  return `${days} days / ${n} nights`;
}

/** "+254 182 308 871" -> "+254182308871", for tel: and wa.me links. */
export function telHref(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}`;
}

/**
 * The second contact number, or undefined when there is nothing extra to show.
 *
 * Compared on digits alone: the same number stored as "+254182308871" in one
 * field and "+254 182 308 871" in the other is one number, and listing it twice
 * looks like a mistake to a visitor.
 */
export function secondaryNumber(phone: string, whatsapp?: string): string | undefined {
  if (!whatsapp) return undefined;
  const digits = (v: string) => v.replace(/\D/g, '');
  return digits(whatsapp) === digits(phone) ? undefined : whatsapp;
}
