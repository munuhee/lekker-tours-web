import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { getSettings } from '@/lib/settings';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const whatsapp = settings.contact.whatsapp || settings.contact.phone;

  return (
    <div className="flex min-h-screen flex-col">
      <Header phone={settings.contact.phone} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      {whatsapp ? <WhatsAppButton phone={whatsapp} /> : null}
    </div>
  );
}
