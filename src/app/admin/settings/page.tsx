'use client';

import { useEffect, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { TextField, TextArea, FormSection, FormActions } from '@/components/admin/FormControls';
import { ImageUploader } from '@/components/admin/ImageUploader';
import type { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi
      .get<SiteSettings>('/api/settings')
      .then(setSettings)
      .catch((err) =>
        setError(err instanceof AdminApiError ? err.message : 'Could not load settings.')
      )
      .finally(() => setLoading(false));
  }, []);

  function patch<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError('');
    try {
      const updated = await adminApi.patch<SiteSettings>('/api/admin/settings', {
        hero: settings.hero,
        values: settings.values,
        contact: settings.contact,
        socials: settings.socials,
        newsletter: settings.newsletter,
        footerBlurb: settings.footerBlurb,
        seo: settings.seo,
      });
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-sand-200" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-card bg-white" />
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <p role="alert" className="rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
        {error || 'Settings are unavailable.'}
      </p>
    );
  }

  return (
    <div className="max-w-3xl">
      <header className="mb-7">
        <h1 className="text-3xl">Site settings</h1>
        <p className="mt-2 text-sm text-muted">
          Everything here appears on the public site — the homepage hero, the values strip, the
          contact block and the footer.
        </p>
      </header>

      {error ? (
        <p role="alert" className="mb-5 rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="mb-5 rounded-lg bg-forest-100 px-4 py-3 text-sm text-forest-700">
          Saved. The public site will reflect this within moments.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5 pb-4">
        <FormSection title="Homepage hero" description="The first thing every visitor sees.">
          <TextField
            label="Headline"
            name="heroTitle"
            value={settings.hero.title}
            onChange={(v) => patch('hero', { ...settings.hero, title: v })}
          />
          <TextArea
            label="Subheadline"
            name="heroSubtitle"
            value={settings.hero.subtitle}
            rows={2}
            onChange={(v) => patch('hero', { ...settings.hero, subtitle: v })}
          />
          <ImageUploader
            label="Background image"
            value={settings.hero.backgroundImage}
            onChange={(v) =>
              patch('hero', {
                ...settings.hero,
                backgroundImage: v ?? { url: '', alt: '' },
              })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Primary button label"
              name="primaryLabel"
              value={settings.hero.primaryCta.label}
              onChange={(v) =>
                patch('hero', {
                  ...settings.hero,
                  primaryCta: { ...settings.hero.primaryCta, label: v },
                })
              }
            />
            <TextField
              label="Primary button link"
              name="primaryHref"
              value={settings.hero.primaryCta.href}
              onChange={(v) =>
                patch('hero', {
                  ...settings.hero,
                  primaryCta: { ...settings.hero.primaryCta, href: v },
                })
              }
            />
            <TextField
              label="Secondary button label"
              name="secondaryLabel"
              value={settings.hero.secondaryCta.label}
              onChange={(v) =>
                patch('hero', {
                  ...settings.hero,
                  secondaryCta: { ...settings.hero.secondaryCta, label: v },
                })
              }
            />
            <TextField
              label="Secondary button link"
              name="secondaryHref"
              value={settings.hero.secondaryCta.href}
              onChange={(v) =>
                patch('hero', {
                  ...settings.hero,
                  secondaryCta: { ...settings.hero.secondaryCta, href: v },
                })
              }
            />
          </div>
        </FormSection>

        <FormSection
          title="Values"
          description="The four cards below the hero, and the panel on the About page."
        >
          {settings.values.map((value, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-sand-200 bg-sand-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted">Value {i + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    patch('values', settings.values.filter((_, j) => j !== i))
                  }
                  className="text-xs text-maroon-600 underline"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={value.title}
                placeholder="Title"
                onChange={(e) =>
                  patch(
                    'values',
                    settings.values.map((v, j) => (j === i ? { ...v, title: e.target.value } : v))
                  )
                }
                className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
              <textarea
                rows={2}
                value={value.description}
                placeholder="Description"
                onChange={(e) =>
                  patch(
                    'values',
                    settings.values.map((v, j) =>
                      j === i ? { ...v, description: e.target.value } : v
                    )
                  )
                }
                className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
              <select
                value={value.icon ?? 'compass'}
                onChange={(e) =>
                  patch(
                    'values',
                    settings.values.map((v, j) => (j === i ? { ...v, icon: e.target.value } : v))
                  )
                }
                className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                {['compass', 'clock', 'leaf', 'receipt'].map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch('values', [
                ...settings.values,
                { title: '', description: '', icon: 'compass' },
              ])
            }
            className="w-full rounded-lg border border-dashed border-sand-300 py-2.5 text-sm text-forest-700 hover:border-amber-500"
          >
            + Add value
          </button>
        </FormSection>

        <FormSection title="Contact details" description="Used in the header, footer and contact page.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Phone"
              name="phone"
              value={settings.contact.phone}
              onChange={(v) => patch('contact', { ...settings.contact, phone: v })}
            />
            <TextField
              label="WhatsApp"
              name="whatsapp"
              value={settings.contact.whatsapp ?? ''}
              onChange={(v) => patch('contact', { ...settings.contact, whatsapp: v })}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={settings.contact.email}
              onChange={(v) => patch('contact', { ...settings.contact, email: v })}
            />
            <TextField
              label="Support hours"
              name="supportHours"
              value={settings.contact.supportHours}
              onChange={(v) => patch('contact', { ...settings.contact, supportHours: v })}
            />
            <TextField
              label="Address line"
              name="addressLine"
              value={settings.contact.addressLine}
              onChange={(v) => patch('contact', { ...settings.contact, addressLine: v })}
            />
            <TextField
              label="P.O. Box"
              name="poBox"
              value={settings.contact.poBox ?? ''}
              onChange={(v) => patch('contact', { ...settings.contact, poBox: v })}
            />
            <TextField
              label="City"
              name="city"
              value={settings.contact.city}
              onChange={(v) => patch('contact', { ...settings.contact, city: v })}
            />
          </div>
        </FormSection>

        <FormSection title="Social links" description="Leave blank to hide a platform from the footer.">
          <div className="grid gap-4 sm:grid-cols-2">
            {(['facebook', 'instagram', 'x', 'youtube', 'tiktok'] as const).map((key) => (
              <TextField
                key={key}
                label={key === 'x' ? 'X (Twitter)' : key[0].toUpperCase() + key.slice(1)}
                name={key}
                value={settings.socials[key] ?? ''}
                placeholder="https://…"
                onChange={(v) => patch('socials', { ...settings.socials, [key]: v })}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="Footer and newsletter">
          <TextArea
            label="Footer description"
            name="footerBlurb"
            value={settings.footerBlurb}
            rows={3}
            onChange={(v) => patch('footerBlurb', v)}
          />
          <TextField
            label="Newsletter heading"
            name="newsletterHeading"
            value={settings.newsletter.heading}
            onChange={(v) => patch('newsletter', { ...settings.newsletter, heading: v })}
          />
          <TextArea
            label="Newsletter blurb"
            name="newsletterBlurb"
            value={settings.newsletter.blurb}
            rows={2}
            onChange={(v) => patch('newsletter', { ...settings.newsletter, blurb: v })}
          />
        </FormSection>

        <FormSection title="Default SEO" description="Used where a page does not set its own.">
          <TextField
            label="Default title"
            name="seoTitle"
            value={settings.seo.defaultTitle}
            onChange={(v) => patch('seo', { ...settings.seo, defaultTitle: v })}
          />
          <TextArea
            label="Default description"
            name="seoDescription"
            value={settings.seo.defaultDescription}
            rows={2}
            onChange={(v) => patch('seo', { ...settings.seo, defaultDescription: v })}
          />
        </FormSection>

        <FormActions saving={saving} submitLabel="Save settings" />
      </form>
    </div>
  );
}
