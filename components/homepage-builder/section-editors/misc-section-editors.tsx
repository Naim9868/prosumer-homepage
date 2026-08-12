"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  TestimonialsSettings,
  BeforeAfterSettings,
  VideoSettings,
  FaqSettings,
  NewsletterSettings,
  BannerSettings,
} from "@/types/homepage";
import { Field, FieldGrid, TextInput, TextArea } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { ImageUploader } from "@/components/homepage-builder/image-uploader";
import { useCatalog } from "@/components/shared/catalog-context";

function useReviewItems(): CatalogPickerItem[] {
  const { reviews } = useCatalog();
  return reviews.map((r) => ({
    id: r.id,
    label: r.name,
    subtitle: r.product,
    image: r.image || undefined,
  }));
}

export function TestimonialsEditor({
  settings,
  onChange,
}: {
  settings: TestimonialsSettings;
  onChange: (next: TestimonialsSettings) => void;
}) {
  const set = <K extends keyof TestimonialsSettings>(key: K, value: TestimonialsSettings[K]) => onChange({ ...settings, [key]: value });
  const reviewItems = useReviewItems();
  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Title">
          <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
      </FieldGrid>
      <Field label="Reviews (leave empty to show all approved)">
        <CatalogPicker items={reviewItems} selected={settings.testimonialIds} onChange={(ids) => set("testimonialIds", ids)} searchPlaceholder="Search reviews..." />
      </Field>
    </div>
  );
}

export function BeforeAfterEditor({ settings, onChange }: { settings: BeforeAfterSettings; onChange: (next: BeforeAfterSettings) => void }) {
  const set = <K extends keyof BeforeAfterSettings>(key: K, value: BeforeAfterSettings[K]) => onChange({ ...settings, [key]: value });
  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Title">
          <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <Field label="Before Label">
          <TextInput value={settings.beforeLabel} onChange={(e) => set("beforeLabel", e.target.value)} />
        </Field>
        <Field label="After Label">
          <TextInput value={settings.afterLabel} onChange={(e) => set("afterLabel", e.target.value)} />
        </Field>
      </FieldGrid>
      <ImageUploader label="Before Image" value={settings.beforeImage} onChange={(url) => set("beforeImage", url)} hint="Leave empty for procedural placeholder" />
      <ImageUploader label="After Image" value={settings.afterImage} onChange={(url) => set("afterImage", url)} hint="Leave empty for procedural placeholder" />
    </div>
  );
}

export function VideoEditor({ settings, onChange }: { settings: VideoSettings; onChange: (next: VideoSettings) => void }) {
  const set = <K extends keyof VideoSettings>(key: K, value: VideoSettings[K]) => onChange({ ...settings, [key]: value });
  return (
    <FieldGrid>
      <Field label="Title">
        <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Subtitle">
        <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </Field>
      <Field label="YouTube Video ID" hint="The part after v= in the YouTube URL">
        <TextInput value={settings.youtubeId} onChange={(e) => set("youtubeId", e.target.value)} />
      </Field>
    </FieldGrid>
  );
}

export function FaqEditor({ settings, onChange }: { settings: FaqSettings; onChange: (next: FaqSettings) => void }) {
  const set = <K extends keyof FaqSettings>(key: K, value: FaqSettings[K]) => onChange({ ...settings, [key]: value });

  const updateItem = (i: number, patch: Partial<{ question: string; answer: string }>) => {
    set("items", settings.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const addItem = () =>
    set("items", [...settings.items, { id: `faq_${Date.now()}`, question: "New question?", answer: "Answer here." }]);
  const removeItem = (i: number) => set("items", settings.items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Title">
          <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
      </FieldGrid>
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Questions</p>
        {settings.items.map((item, i) => (
          <div key={item.id} className="space-y-2 rounded-[var(--radius-sm)] border border-border p-3">
            <div className="flex items-center gap-2">
              <TextInput value={item.question} onChange={(e) => updateItem(i, { question: e.target.value })} placeholder="Question" className="flex-1" />
              <button type="button" onClick={() => removeItem(i)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border text-destructive hover:bg-muted">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <TextArea value={item.answer} onChange={(e) => updateItem(i, { answer: e.target.value })} placeholder="Answer" rows={2} />
          </div>
        ))}
        <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          <Plus className="h-4 w-4" /> Add Question
        </button>
      </div>
    </div>
  );
}

export function NewsletterEditor({ settings, onChange }: { settings: NewsletterSettings; onChange: (next: NewsletterSettings) => void }) {
  const set = <K extends keyof NewsletterSettings>(key: K, value: NewsletterSettings[K]) => onChange({ ...settings, [key]: value });
  return (
    <FieldGrid>
      <Field label="Title">
        <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Subtitle">
        <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </Field>
      <Field label="Input Placeholder">
        <TextInput value={settings.placeholder} onChange={(e) => set("placeholder", e.target.value)} />
      </Field>
      <Field label="Button Label">
        <TextInput value={settings.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} />
      </Field>
    </FieldGrid>
  );
}

export function BannerEditor({ settings, onChange }: { settings: BannerSettings; onChange: (next: BannerSettings) => void }) {
  const set = <K extends keyof BannerSettings>(key: K, value: BannerSettings[K]) => onChange({ ...settings, [key]: value });
  return (
    <FieldGrid>
      <Field label="Title">
        <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Subtitle">
        <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </Field>
      <ImageUploader label="Background Image" value={settings.image ?? ""} onChange={(url) => set("image", url)} hint="Leave empty for the brass/teal gradient" />
      <Field label="Button Label">
        <TextInput value={settings.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} />
      </Field>
      <Field label="Button URL">
        <TextInput value={settings.buttonUrl} onChange={(e) => set("buttonUrl", e.target.value)} />
      </Field>
    </FieldGrid>
  );
}
