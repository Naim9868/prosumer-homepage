"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CategoriesSettings, BrandsSettings, GallerySettings } from "@/types/homepage";
import { Field, FieldGrid, TextInput } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { ImageUploader } from "@/components/homepage-builder/image-uploader";
import { useCatalog } from "@/components/shared/catalog-context";

function useCategoryItems(): CatalogPickerItem[] {
  const { categories } = useCatalog();
  return categories.map((c) => ({
    id: c.id,
    label: c.name,
    image: c.image || undefined,
    subtitle: c.slug,
  }));
}

export function CategoriesEditor({ settings, onChange }: { settings: CategoriesSettings; onChange: (next: CategoriesSettings) => void }) {
  const set = <K extends keyof CategoriesSettings>(key: K, value: CategoriesSettings[K]) => onChange({ ...settings, [key]: value });
  const categoryItems = useCategoryItems();
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
      <Field label="Lens categories to show (leave empty to show all)">
        <CatalogPicker items={categoryItems} selected={settings.categoryIds} onChange={(ids) => set("categoryIds", ids)} searchPlaceholder="Search categories..." />
      </Field>
    </div>
  );
}

export function BrandsEditor({ settings, onChange }: { settings: BrandsSettings; onChange: (next: BrandsSettings) => void }) {
  const set = <K extends keyof BrandsSettings>(key: K, value: BrandsSettings[K]) => onChange({ ...settings, [key]: value });

  const updateLogo = (i: number, patch: Partial<{ name: string; url: string }>) => {
    const next = settings.logos.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    set("logos", next);
  };
  const addLogo = () => set("logos", [...settings.logos, { name: "New Brand", url: "" }]);
  const removeLogo = (i: number) => set("logos", settings.logos.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <Field label="Title">
        <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Logos</p>
        {settings.logos.map((logo, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput value={logo.name} onChange={(e) => updateLogo(i, { name: e.target.value })} placeholder="Brand name" className="flex-1" />
            <button type="button" onClick={() => removeLogo(i)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border text-destructive hover:bg-muted">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={addLogo} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          <Plus className="h-4 w-4" /> Add Logo
        </button>
      </div>
    </div>
  );
}

export function GalleryEditor({ settings, onChange }: { settings: GallerySettings; onChange: (next: GallerySettings) => void }) {
  const set = <K extends keyof GallerySettings>(key: K, value: GallerySettings[K]) => onChange({ ...settings, [key]: value });

  const updateImage = (i: number, patch: Partial<{ url: string; caption?: string }>) => {
    set("images", settings.images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));
  };
  const addImage = () => set("images", [...settings.images, { url: "", caption: "" }]);
  const removeImage = (i: number) => set("images", settings.images.filter((_, idx) => idx !== i));

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
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
          Images {settings.images.length === 0 && "(empty = procedural placeholders)"}
        </p>
        {settings.images.map((img, i) => (
          <div key={i} className="space-y-2 rounded-[var(--radius-sm)] border border-border p-3">
            <div className="flex items-center gap-2">
              <ImageUploader value={img.url} onChange={(url) => updateImage(i, { url })} folder="prosumer-lens/gallery" className="flex-1" />
              <button type="button" onClick={() => removeImage(i)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border text-destructive hover:bg-muted">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <TextInput value={img.caption ?? ""} onChange={(e) => updateImage(i, { caption: e.target.value })} placeholder="Caption (optional)" />
          </div>
        ))}
        <button type="button" onClick={addImage} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          <Plus className="h-4 w-4" /> Add Image
        </button>
      </div>
    </div>
  );
}
