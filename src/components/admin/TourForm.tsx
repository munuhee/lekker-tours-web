'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminApiError } from '@/lib/adminApi';
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
import { ItineraryEditor } from './ItineraryEditor';
import type { Tour, Destination, ItineraryDay, ApiImage } from '@/types';

const COUNTRIES = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Zanzibar'] as const;

interface FormState {
  title: string;
  category: string;
  summary: string;
  description: string;
  priceFrom: string;
  currency: string;
  durationDays: string;
  groupSizeMax: string;
  difficulty: string;
  rating: string;
  reviewCount: string;
  destination: string;
  countries: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  parks: string[];
  heroImage?: ApiImage;
  gallery: ApiImage[];
  itinerary: ItineraryDay[];
  featured: boolean;
  bestSelling: boolean;
  status: string;
}

function toFormState(tour?: Tour): FormState {
  return {
    title: tour?.title ?? '',
    category: tour?.category ?? 'SafariExpedition',
    summary: tour?.summary ?? '',
    description: tour?.description ?? '',
    priceFrom: String(tour?.priceFrom ?? ''),
    currency: tour?.currency ?? 'USD',
    durationDays: String(tour?.durationDays ?? ''),
    groupSizeMax: String(tour?.groupSizeMax ?? 7),
    difficulty: tour?.difficulty ?? 'easy',
    rating: String(tour?.rating ?? 4.8),
    reviewCount: String(tour?.reviewCount ?? 0),
    destination:
      typeof tour?.destination === 'object' && tour?.destination
        ? tour.destination._id
        : (tour?.destination as string) ?? '',
    countries: tour?.countries ?? [],
    highlights: tour?.highlights ?? [],
    inclusions: tour?.inclusions ?? [],
    exclusions: tour?.exclusions ?? [],
    parks: tour?.parks ?? [],
    heroImage: tour?.heroImage,
    gallery: tour?.gallery ?? [],
    itinerary: tour?.itinerary ?? [],
    featured: tour?.featured ?? false,
    bestSelling: tour?.bestSelling ?? false,
    status: tour?.status ?? 'draft',
  };
}

export function TourForm({
  tour,
  destinations,
}: {
  tour?: Tour;
  destinations: Destination[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(tour));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    if (!form.heroImage?.url || !form.heroImage.alt) {
      setError('A hero image with alt text is required.');
      setSaving(false);
      return;
    }

    const payload: Record<string, unknown> = {
      title: form.title,
      summary: form.summary,
      description: form.description,
      priceFrom: Number(form.priceFrom),
      currency: form.currency,
      durationDays: Number(form.durationDays),
      groupSizeMax: Number(form.groupSizeMax),
      difficulty: form.difficulty,
      rating: Number(form.rating),
      reviewCount: Number(form.reviewCount),
      countries: form.countries,
      highlights: form.highlights,
      inclusions: form.inclusions,
      exclusions: form.exclusions,
      heroImage: form.heroImage,
      gallery: form.gallery.filter((g) => g.url && g.alt),
      itinerary: form.itinerary,
      featured: form.featured,
      bestSelling: form.bestSelling,
      status: form.status,
    };

    if (form.destination) payload.destination = form.destination;
    if (form.category === 'SafariExpedition') payload.parks = form.parks;

    // Category is a Mongoose discriminator key and cannot change after creation.
    if (!tour) payload.category = form.category;

    try {
      if (tour) {
        await adminApi.patch(`/api/admin/tours/${tour._id}`, payload);
      } else {
        const created = await adminApi.post<Tour>('/api/admin/tours', payload);
        router.push(`/admin/tours/${created._id}`);
        router.refresh();
        return;
      }
      router.refresh();
      setError('');
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        if (err.details) setFieldErrors(err.details);
      } else {
        setError('Could not save the tour.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!tour) return;
    if (!confirm(`Delete "${tour.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      await adminApi.remove(`/api/admin/tours/${tour._id}`);
      router.push('/admin/tours');
      router.refresh();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not delete the tour.');
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
          label="Title"
          name="title"
          value={form.title}
          onChange={(v) => set('title', v)}
          required
          error={fieldErrors.title}
        />

        <SelectField
          label="Type"
          name="category"
          value={form.category}
          onChange={(v) => set('category', v)}
          options={[
            { value: 'SafariExpedition', label: 'Safari Expedition' },
            { value: 'WeekendEscape', label: 'Weekend Escape' },
          ]}
        />
        {tour ? (
          <p className="-mt-2 text-xs text-muted">
            Type cannot be changed after a tour is created.
          </p>
        ) : null}

        <TextArea
          label="Summary"
          name="summary"
          value={form.summary}
          onChange={(v) => set('summary', v)}
          rows={2}
          required
          hint="Shown on cards. Maximum 300 characters."
          error={fieldErrors.summary}
        />

        <TextArea
          label="Full description"
          name="description"
          value={form.description}
          onChange={(v) => set('description', v)}
          rows={6}
          required
          error={fieldErrors.description}
        />
      </FormSection>

      <FormSection title="Pricing and logistics">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Price from"
            name="priceFrom"
            type="number"
            value={form.priceFrom}
            onChange={(v) => set('priceFrom', v)}
            required
            error={fieldErrors.priceFrom}
          />
          <TextField
            label="Currency"
            name="currency"
            value={form.currency}
            onChange={(v) => set('currency', v.toUpperCase())}
          />
          <TextField
            label="Duration (days)"
            name="durationDays"
            type="number"
            value={form.durationDays}
            onChange={(v) => set('durationDays', v)}
            required
            error={fieldErrors.durationDays}
          />
          <TextField
            label="Maximum guests"
            name="groupSizeMax"
            type="number"
            value={form.groupSizeMax}
            onChange={(v) => set('groupSizeMax', v)}
          />
          <SelectField
            label="Difficulty"
            name="difficulty"
            value={form.difficulty}
            onChange={(v) => set('difficulty', v)}
            options={[
              { value: 'easy', label: 'Easy / relaxed' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'challenging', label: 'Challenging' },
            ]}
          />
          <SelectField
            label="Destination"
            name="destination"
            value={form.destination}
            onChange={(v) => set('destination', v)}
            options={[
              { value: '', label: '— none —' },
              ...destinations.map((d) => ({ value: d._id, label: d.name })),
            ]}
          />
          <TextField
            label="Rating"
            name="rating"
            type="number"
            value={form.rating}
            onChange={(v) => set('rating', v)}
          />
          <TextField
            label="Review count"
            name="reviewCount"
            type="number"
            value={form.reviewCount}
            onChange={(v) => set('reviewCount', v)}
          />
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-ink">Countries</legend>
          <div className="flex flex-wrap gap-3">
            {COUNTRIES.map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.countries.includes(c)}
                  onChange={(e) =>
                    set(
                      'countries',
                      e.target.checked
                        ? [...form.countries, c]
                        : form.countries.filter((x) => x !== c)
                    )
                  }
                  className="h-4 w-4 accent-amber-500"
                />
                {c}
              </label>
            ))}
          </div>
        </fieldset>
      </FormSection>

      <FormSection title="Imagery">
        <ImageUploader
          label="Hero image"
          value={form.heroImage}
          onChange={(v) => set('heroImage', v)}
          required
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">Gallery</p>
          {form.gallery.map((image, i) => (
            <ImageUploader
              key={i}
              label={`Gallery image ${i + 1}`}
              value={image}
              onChange={(v) =>
                set(
                  'gallery',
                  v ? form.gallery.map((g, j) => (j === i ? v : g)) : form.gallery.filter((_, j) => j !== i)
                )
              }
            />
          ))}
          <button
            type="button"
            onClick={() => set('gallery', [...form.gallery, { url: '', alt: '' }])}
            className="w-full rounded-lg border border-dashed border-sand-300 py-2.5 text-sm text-forest-700 hover:border-amber-500"
          >
            + Add gallery image
          </button>
        </div>
      </FormSection>

      <FormSection title="Content">
        <ListField
          label="Highlights"
          value={form.highlights}
          onChange={(v) => set('highlights', v)}
        />
        {form.category === 'SafariExpedition' ? (
          <ListField label="Parks visited" value={form.parks} onChange={(v) => set('parks', v)} />
        ) : null}
        <ListField
          label="What's included"
          value={form.inclusions}
          onChange={(v) => set('inclusions', v)}
          rows={7}
        />
        <ListField
          label="What's not included"
          value={form.exclusions}
          onChange={(v) => set('exclusions', v)}
          rows={6}
        />
      </FormSection>

      <FormSection title="Itinerary" description="Shown as a day-by-day timeline on the tour page.">
        <ItineraryEditor days={form.itinerary} onChange={(v) => set('itinerary', v)} />
      </FormSection>

      <FormSection title="Visibility">
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={(v) => set('status', v)}
          options={[
            { value: 'draft', label: 'Draft — hidden from the public site' },
            { value: 'published', label: 'Published — live' },
          ]}
        />
        <CheckboxField
          label="Featured"
          checked={form.featured}
          onChange={(v) => set('featured', v)}
          hint="Prioritised in listings."
        />
        <CheckboxField
          label="Best selling"
          checked={form.bestSelling}
          onChange={(v) => set('bestSelling', v)}
          hint="Appears in the best-selling row on the homepage."
        />
      </FormSection>

      <FormActions
        saving={saving}
        onDelete={tour ? onDelete : undefined}
        deleting={deleting}
        submitLabel={tour ? 'Save changes' : 'Create tour'}
      />
    </form>
  );
}
