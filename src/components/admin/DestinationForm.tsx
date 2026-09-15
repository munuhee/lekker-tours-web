'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { useUnsavedChangesGuard } from '@/lib/useUnsavedChanges';
import {
  TextField,
  TextArea,
  SelectField,
  CheckboxField,
  ListField,
  FormSection,
  FormActions,
} from './FormControls';
import { ImageUploader } from './ImageUploader';
import { ParksEditor } from './ParksEditor';
import type { Destination, Park, ApiImage } from '@/types';

const COUNTRIES = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Zanzibar'] as const;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DestinationForm({ destination }: { destination?: Destination }) {
  const router = useRouter();

  const [name, setName] = useState(destination?.name ?? '');
  const [country, setCountry] = useState<string>(destination?.country ?? 'Kenya');
  const [tagline, setTagline] = useState(destination?.tagline ?? '');
  const [categoryLabel, setCategoryLabel] = useState(destination?.categoryLabel ?? 'Country');
  const [overview, setOverview] = useState(destination?.overview ?? '');
  const [heroImage, setHeroImage] = useState<ApiImage | undefined>(destination?.heroImage);
  const [cardImage, setCardImage] = useState<ApiImage | undefined>(destination?.cardImage);
  const [highlights, setHighlights] = useState<string[]>(destination?.highlights ?? []);
  const [months, setMonths] = useState<string[]>(destination?.bestTime?.months ?? []);
  const [bestTimeNote, setBestTimeNote] = useState(destination?.bestTime?.note ?? '');
  const [parks, setParks] = useState<Park[]>(destination?.parks ?? []);
  const [featured, setFeatured] = useState(destination?.featured ?? false);
  const [order, setOrder] = useState(String(destination?.order ?? 0));
  const [status, setStatus] = useState(destination?.status ?? 'draft');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const snapshot = JSON.stringify({
    name,
    country,
    tagline,
    categoryLabel,
    overview,
    heroImage,
    cardImage,
    highlights,
    months,
    bestTimeNote,
    parks,
    featured,
    order,
    status,
  });
  const initial = useRef(snapshot);
  useUnsavedChangesGuard(snapshot !== initial.current && !saving && !deleting);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!heroImage?.url || !heroImage.alt || !cardImage?.url || !cardImage.alt) {
      setError('Both a hero image and a card image are required, each with alt text.');
      return;
    }

    setSaving(true);
    setError('');
    setFieldErrors({});

    const body = {
      name,
      country,
      tagline: tagline || undefined,
      categoryLabel,
      overview,
      heroImage,
      cardImage,
      highlights,
      bestTime: { months, note: bestTimeNote || undefined },
      // Drop half-filled rows so an empty repeater slot cannot fail validation.
      parks: parks.filter((p) => p.name.trim()),
      featured,
      order: Number(order),
      status,
    };

    try {
      if (destination) {
        await adminApi.patch(`/api/admin/destinations/${destination._id}`, body);
        initial.current = snapshot;
        router.refresh();
      } else {
        const created = await adminApi.post<Destination>('/api/admin/destinations', body);
        router.push(`/admin/destinations/${created._id}`);
        router.refresh();
      }
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        if (err.details) setFieldErrors(err.details);
      } else {
        setError('Could not save the destination.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!destination || !confirm(`Delete "${destination.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await adminApi.remove(`/api/admin/destinations/${destination._id}`);
      router.push('/admin/destinations');
      router.refresh();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not delete.');
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-4">
      {error ? (
        <p role="alert" className="rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
          {error}
        </p>
      ) : null}

      <FormSection title="Basics">
        <TextField
          label="Name"
          name="name"
          value={name}
          onChange={setName}
          required
          error={fieldErrors.name}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Country"
            name="country"
            value={country}
            onChange={setCountry}
            options={COUNTRIES.map((c) => ({ value: c, label: c }))}
            required
          />
          <TextField
            label="Category label"
            name="categoryLabel"
            value={categoryLabel}
            onChange={setCategoryLabel}
            hint="Shown above the name on cards, e.g. Country or Island."
          />
        </div>
        <TextField
          label="Tagline"
          name="tagline"
          value={tagline}
          onChange={setTagline}
          hint="One line shown under the name on cards and the banner."
        />
        <TextArea
          label="Overview"
          name="overview"
          value={overview}
          onChange={setOverview}
          rows={6}
          required
          error={fieldErrors.overview}
        />
      </FormSection>

      <FormSection title="Imagery">
        <ImageUploader label="Hero image (page banner)" value={heroImage} onChange={setHeroImage} required />
        <ImageUploader label="Card image (grids)" value={cardImage} onChange={setCardImage} required />
      </FormSection>

      <FormSection title="Highlights and season">
        <ListField label="Highlights" value={highlights} onChange={setHighlights} />

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-ink">Best months to visit</legend>
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((m) => (
              <label
                key={m}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  months.includes(m)
                    ? 'border-amber-500 bg-amber-500 text-forest-950'
                    : 'border-sand-300 text-muted hover:border-forest-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={months.includes(m)}
                  onChange={(e) =>
                    setMonths(
                      e.target.checked ? [...months, m] : months.filter((x) => x !== m)
                    )
                  }
                  className="sr-only"
                />
                {m.slice(0, 3)}
              </label>
            ))}
          </div>
        </fieldset>

        <TextArea
          label="Season note"
          name="bestTimeNote"
          value={bestTimeNote}
          onChange={setBestTimeNote}
          rows={3}
          hint="Explain the trade-offs between seasons."
        />
      </FormSection>

      <FormSection
        title="Parks and regions"
        description="Each appears as a card on the destination page."
      >
        <ParksEditor parks={parks} onChange={setParks} />
      </FormSection>

      <FormSection title="Visibility">
        <SelectField
          label="Status"
          name="status"
          value={status}
          onChange={(v) => setStatus(v as Destination['status'])}
          options={[
            { value: 'draft', label: 'Draft — hidden from the public site' },
            { value: 'published', label: 'Published — live' },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Order" name="order" type="number" value={order} onChange={setOrder} />
        </div>
        <CheckboxField
          label="Featured"
          checked={featured}
          onChange={setFeatured}
          hint="Prioritised on the homepage countries grid."
        />
      </FormSection>

      <FormActions
        saving={saving}
        onDelete={destination ? onDelete : undefined}
        deleting={deleting}
        submitLabel={destination ? 'Save changes' : 'Create destination'}
      />
    </form>
  );
}
