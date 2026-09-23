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
import { GalleryEditor } from './GalleryEditor';
import { ItineraryEditor } from './ItineraryEditor';
import { FormError } from './FormError';
import { useConfirm } from './ConfirmDialog';
import { useToast } from './Toasts';
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
  durationNights: string;
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
  order: string;
  metaTitle: string;
  metaDescription: string;
}

function toFormState(tour?: Tour): FormState {
  return {
    title: tour?.title ?? '',
    category: tour?.category ?? 'SafariExpedition',
    summary: tour?.summary ?? '',
    description: tour?.description ?? '',
    priceFrom: String(tour?.priceFrom ?? ''),
    currency: tour?.currency ?? 'KES',
    durationDays: String(tour?.durationDays ?? ''),
    durationNights: tour?.durationNights === undefined ? '' : String(tour.durationNights),
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
    order: String(tour?.order ?? 0),
    metaTitle: tour?.seo?.metaTitle ?? '',
    metaDescription: tour?.seo?.metaDescription ?? '',
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
  const initial = useRef<FormState>(toFormState(tour));
  const [form, setForm] = useState<FormState>(() => initial.current);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [confirm, confirmDialog] = useConfirm();
  const { toast } = useToast();

  // Leaving with unsaved edits used to discard a long form silently.
  const dirty = JSON.stringify(form) !== JSON.stringify(initial.current);
  useUnsavedChangesGuard(dirty && !saving && !deleting);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    if (!form.heroImage?.url || !form.heroImage.alt) {
      // Reported against the field itself, so the banner's jump-link lands on
      // the uploader rather than leaving the admin to hunt for it.
      setError('A hero image with alt text is required.');
      setFieldErrors({ heroImage: 'Upload an image and describe it.' });
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
      order: Number(form.order),
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

    // Blank means "derive from days" on the server, so only send a real value.
    if (form.durationNights !== '') payload.durationNights = Number(form.durationNights);

    if (form.metaTitle || form.metaDescription) {
      payload.seo = {
        ...(form.metaTitle ? { metaTitle: form.metaTitle } : {}),
        ...(form.metaDescription ? { metaDescription: form.metaDescription } : {}),
      };
    }

    if (form.destination) payload.destination = form.destination;
    if (form.category === 'SafariExpedition') payload.parks = form.parks;

    // Category is a Mongoose discriminator key and cannot change after creation.
    if (!tour) payload.category = form.category;

    try {
      if (tour) {
        await adminApi.patch(`/api/admin/tours/${tour._id}`, payload);
        // The form now matches what is stored, so it is no longer dirty.
        initial.current = form;
        toast({
          message:
            form.status === 'published'
              ? 'Saved. The change is live on the public site.'
              : 'Saved as a draft.',
        });
      } else {
        const created = await adminApi.post<Tour>('/api/admin/tours', payload);
        toast({ message: `"${form.title}" created.` });
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
      toast({ tone: 'error', message: 'The tour could not be saved.' });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!tour) return;

    const ok = await confirm({
      title: 'Delete this tour?',
      body: (
        <>
          <strong className="text-ink">{tour.title}</strong> will be permanently removed, along with
          its itinerary and gallery. This cannot be undone.
        </>
      ),
      confirmLabel: 'Delete tour',
    });
    if (!ok) return;

    setDeleting(true);
    try {
      await adminApi.remove(`/api/admin/tours/${tour._id}`);
      toast({ message: `"${tour.title}" was deleted.` });
      router.push('/admin/tours');
      router.refresh();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Could not delete the tour.';
      setError(message);
      toast({ tone: 'error', message });
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-4">
      <FormError message={error} fieldErrors={fieldErrors} />

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
            label="Duration (nights)"
            name="durationNights"
            type="number"
            value={form.durationNights}
            onChange={(v) => set('durationNights', v)}
            hint="Leave blank for one fewer than the number of days."
            error={fieldErrors.durationNights}
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
              { value: '', label: '(none)' },
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
          name="heroImage"
          label="Hero image"
          value={form.heroImage}
          onChange={(v) => set('heroImage', v)}
          required
          error={fieldErrors.heroImage}
        />

        <GalleryEditor value={form.gallery} onChange={(v) => set('gallery', v)} />
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
            { value: 'draft', label: 'Draft: hidden from the public site' },
            { value: 'published', label: 'Published: live' },
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
        <TextField
          label="Order"
          name="order"
          type="number"
          value={form.order}
          onChange={(v) => set('order', v)}
          hint="Lower numbers sort first in listings."
          error={fieldErrors.order}
        />
      </FormSection>

      <FormSection title="SEO" description="Used where this tour needs its own meta tags.">
        <TextField
          label="Meta title"
          name="metaTitle"
          value={form.metaTitle}
          onChange={(v) => set('metaTitle', v)}
          maxLength={70}
          hint="Falls back to the tour title."
          error={fieldErrors['seo.metaTitle']}
        />
        <TextArea
          label="Meta description"
          name="metaDescription"
          value={form.metaDescription}
          onChange={(v) => set('metaDescription', v)}
          rows={2}
          maxLength={180}
          hint="Falls back to the summary."
          error={fieldErrors['seo.metaDescription']}
        />
      </FormSection>

      <FormActions
        saving={saving}
        onDelete={tour ? onDelete : undefined}
        deleting={deleting}
        submitLabel={tour ? 'Save changes' : 'Create tour'}
        dirty={dirty}
      />

      {confirmDialog}
    </form>
  );
}
