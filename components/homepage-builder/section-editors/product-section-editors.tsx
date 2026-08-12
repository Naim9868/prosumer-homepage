"use client";

import type { FeaturedProductsSettings, NewArrivalsSettings, BestSellersSettings, FlashSaleSettings } from "@/types/homepage";
import { Field, FieldGrid, TextInput, Select } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { useCatalog } from "@/components/shared/catalog-context";

function useProductItems(): CatalogPickerItem[] {
  const { products } = useCatalog();
  return products.map((p) => ({
    id: p.id,
    label: p.name,
    image: p.image || undefined,
    subtitle: p.price > 0 ? `৳${p.price.toLocaleString()}` : undefined,
  }));
}

export function FeaturedProductsEditor({
  settings,
  onChange,
}: {
  settings: FeaturedProductsSettings;
  onChange: (next: FeaturedProductsSettings) => void;
}) {
  const set = <K extends keyof FeaturedProductsSettings>(key: K, value: FeaturedProductsSettings[K]) =>
    onChange({ ...settings, [key]: value });
  const productItems = useProductItems();

  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Title">
          <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <Field label="Columns">
          <Select value={String(settings.columns)} onChange={(v) => set("columns", Number(v) as 2 | 3 | 4)} options={[{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]} />
        </Field>
        <Field label="Limit">
          <TextInput type="number" min={1} max={24} value={settings.limit} onChange={(e) => set("limit", Number(e.target.value))} />
        </Field>
      </FieldGrid>
      <Field label="Products (leave empty to auto-select)">
        <CatalogPicker items={productItems} selected={settings.productIds} onChange={(ids) => set("productIds", ids)} searchPlaceholder="Search products..." />
      </Field>
    </div>
  );
}

export function NewArrivalsEditor({ settings, onChange }: { settings: NewArrivalsSettings; onChange: (next: NewArrivalsSettings) => void }) {
  const set = <K extends keyof NewArrivalsSettings>(key: K, value: NewArrivalsSettings[K]) => onChange({ ...settings, [key]: value });
  return (
    <FieldGrid>
      <Field label="Title">
        <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Subtitle">
        <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </Field>
      <Field label="Limit">
        <TextInput type="number" min={1} max={24} value={settings.limit} onChange={(e) => set("limit", Number(e.target.value))} />
      </Field>
    </FieldGrid>
  );
}

export function BestSellersEditor({ settings, onChange }: { settings: BestSellersSettings; onChange: (next: BestSellersSettings) => void }) {
  const set = <K extends keyof BestSellersSettings>(key: K, value: BestSellersSettings[K]) => onChange({ ...settings, [key]: value });
  const productItems = useProductItems();
  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Title">
          <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <Field label="Limit">
          <TextInput type="number" min={1} max={24} value={settings.limit} onChange={(e) => set("limit", Number(e.target.value))} />
        </Field>
      </FieldGrid>
      <Field label="Products (pick from catalog — only your picks are shown)">
        <CatalogPicker items={productItems} selected={settings.productIds} onChange={(ids) => set("productIds", ids)} searchPlaceholder="Search products..." />
      </Field>
    </div>
  );
}

export function FlashSaleEditor({ settings, onChange }: { settings: FlashSaleSettings; onChange: (next: FlashSaleSettings) => void }) {
  const set = <K extends keyof FlashSaleSettings>(key: K, value: FlashSaleSettings[K]) => onChange({ ...settings, [key]: value });
  const productItems = useProductItems();
  const localDatetime = settings.endsAt ? new Date(settings.endsAt).toISOString().slice(0, 16) : "";
  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Title">
          <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <Field label="Ends At">
          <TextInput type="datetime-local" value={localDatetime} onChange={(e) => set("endsAt", new Date(e.target.value).toISOString())} />
        </Field>
        <Field label="Button Label">
          <TextInput value={settings.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} />
        </Field>
        <Field label="Button URL">
          <TextInput value={settings.buttonUrl} onChange={(e) => set("buttonUrl", e.target.value)} />
        </Field>
      </FieldGrid>
      <Field label="Products (leave empty to auto-select)">
        <CatalogPicker items={productItems} selected={settings.productIds} onChange={(ids) => set("productIds", ids)} searchPlaceholder="Search products..." />
      </Field>
    </div>
  );
}
