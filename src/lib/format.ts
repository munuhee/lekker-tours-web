export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
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

/** "+254 100 201 950" -> "+254100201950", for tel: and wa.me links. */
export function telHref(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}`;
}
