import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Lekker Tours and Travel: Safari Expeditions across East Africa',
    template: '%s | Lekker Tours and Travel',
  },
  description:
    'Expertly curated safari expeditions and weekend escapes across Kenya, Tanzania, Uganda, Rwanda and Zanzibar, from our base in Nairobi.',
  icons: { icon: '/logo.png' },
  openGraph: {
    type: 'website',
    siteName: 'Lekker Tours and Travel',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
