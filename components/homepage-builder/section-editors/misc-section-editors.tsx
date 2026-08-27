"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import type {
  TestimonialsSettings,
  BeforeAfterSettings,
  BeforeAfterCategory,
  BeforeAfterItem,
  VideoSettings,
  FaqSettings,
  NewsletterSettings,
  BannerSettings,
} from "@/types/homepage";
import { Field, FieldGrid, Select, TextInput, TextArea, Toggle } from "@/components/homepage-builder/fields";
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
  const { products } = useCatalog();
  const set = <K extends keyof BeforeAfterSettings>(key: K, value: BeforeAfterSettings[K]) => onChange({ ...settings, [key]: value });
  const categories = settings.categories ?? [];
  const items = settings.items ?? [];
  const productItems: CatalogPickerItem[] = products.map((product) => ({ id: product.id, label: product.name, subtitle: product.category, image: product.image || undefined }));
  const updateCategory = (index: number, patch: Partial<BeforeAfterCategory>) => set("categories", categories.map((category, i) => i === index ? { ...category, ...patch } : category));
  const updateItem = (index: number, patch: Partial<BeforeAfterItem>) => set("items", items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const move = <T,>(list: T[], from: number, to: number, key: "categories" | "items") => {
    const next = [...list];
    const [entry] = next.splice(from, 1);
    next.splice(to, 0, entry);
    set(key, next.map((value, index) => ({ ...value as object, order: index })) as BeforeAfterSettings[typeof key]);
  };
  const addCategory = () => {
    const id = `before_after_category_${Date.now()}`;
    set("categories", [...categories, { id, name: "New category", slug: "new-category", isActive: true, order: categories.length }]);
  };
  const addItem = () => set("items", [...items, { id: `before_after_${Date.now()}`, title: "New comparison", description: "Describe the difference this lens makes.", categoryId: categories[0]?.id ?? "", beforeImage: "", afterImage: "", beforeLabel: "Phone Camera", afterLabel: "With Lens", productId: "", buttonText: "Shop This Lens", isActive: true, order: items.length }]);
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
        <div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Categories</p><button type="button" onClick={addCategory} className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary"><Plus className="h-4 w-4" /> Add Category</button></div>
        {categories.map((category, index) => (
          <div key={category.id} draggable onDragStart={(event) => event.dataTransfer.setData("category", String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const from = Number(event.dataTransfer.getData("category")); if (from !== index) move(categories, from, index, "categories"); }} className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-border p-2">
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-foreground-muted" /><TextInput value={category.name} onChange={(event) => updateCategory(index, { name: event.target.value, slug: event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") })} className="flex-1" /><Toggle checked={category.isActive} onChange={(value) => updateCategory(index, { isActive: value })} label={`Enable ${category.name}`} /><button type="button" aria-label={`Delete ${category.name}`} onClick={() => set("categories", categories.filter((_, i) => i !== index))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Comparisons</p><button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary"><Plus className="h-4 w-4" /> Add Comparison</button></div>
        {items.map((item, index) => (
          <div key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("comparison", String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const from = Number(event.dataTransfer.getData("comparison")); if (from !== index) move(items, from, index, "items"); }} className="space-y-3 rounded-[var(--radius-sm)] border border-border p-3">
            <div className="flex items-center gap-2"><GripVertical className="h-4 w-4 shrink-0 cursor-grab text-foreground-muted" /><TextInput value={item.title} onChange={(event) => updateItem(index, { title: event.target.value })} placeholder="Title" className="flex-1" /><Toggle checked={item.isActive} onChange={(value) => updateItem(index, { isActive: value })} label={`Enable ${item.title}`} /><button type="button" aria-label={`Delete ${item.title}`} onClick={() => set("items", items.filter((_, i) => i !== index))} className="text-destructive"><Trash2 className="h-4 w-4" /></button></div>
            <TextArea value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} placeholder="Description" rows={2} />
            <FieldGrid><Field label="Category"><Select value={item.categoryId} onChange={(value) => updateItem(index, { categoryId: value })} options={[{ label: "Select category", value: "" }, ...categories.map((category) => ({ label: category.name, value: category.id }))]} /></Field><Field label="Button Text"><TextInput value={item.buttonText} onChange={(event) => updateItem(index, { buttonText: event.target.value })} /></Field><Field label="Before Label"><TextInput value={item.beforeLabel} onChange={(event) => updateItem(index, { beforeLabel: event.target.value })} /></Field><Field label="After Label"><TextInput value={item.afterLabel} onChange={(event) => updateItem(index, { afterLabel: event.target.value })} /></Field></FieldGrid>
            <div className="grid gap-4 sm:grid-cols-2"><ImageUploader label="Before Image" value={item.beforeImage} onChange={(url) => updateItem(index, { beforeImage: url })} folder="prosumer-lens/before-after" /><ImageUploader label="After Image" value={item.afterImage} onChange={(url) => updateItem(index, { afterImage: url })} folder="prosumer-lens/before-after" /></div>
            <Field label="Product (optional)"><CatalogPicker items={productItems} selected={item.productId ? [item.productId] : []} limit={1} onChange={(ids) => updateItem(index, { productId: ids[0] ?? "" })} searchPlaceholder="Search products..." /></Field>
          </div>
        ))}
      </div>
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
