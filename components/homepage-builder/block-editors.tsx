"use client";

import * as Icons from "lucide-react";
import type {
  HeadingBlockSettings,
  ParagraphBlockSettings,
  ImageBlockSettings,
  ButtonBlockSettings,
  SpacerBlockSettings,
  DividerBlockSettings,
  ProductGridBlockSettings,
  ProductSliderBlockSettings,
  VideoBlockSettings,
  IconBlockSettings,
  HtmlBlockSettings,
} from "@/types/homepage";
import { Field, FieldGrid, TextInput, TextArea, Select, Toggle } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { ImageUploader } from "@/components/homepage-builder/image-uploader";
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

const commonIconNames = ["Star", "Truck", "ShieldCheck", "Headset", "Gem", "RotateCcw", "Banknote", "Heart", "Camera", "Zap"];

export function HeadingBlockEditor({ settings, onChange }: { settings: HeadingBlockSettings; onChange: (n: HeadingBlockSettings) => void }) {
  const set = <K extends keyof HeadingBlockSettings>(k: K, v: HeadingBlockSettings[K]) => onChange({ ...settings, [k]: v });
  return (
    <FieldGrid>
      <Field label="Text">
        <TextInput value={settings.text} onChange={(e) => set("text", e.target.value)} />
      </Field>
      <Field label="Level">
        <Select value={settings.level} onChange={(v) => set("level", v as HeadingBlockSettings["level"])} options={[{ label: "H2", value: "h2" }, { label: "H3", value: "h3" }, { label: "H4", value: "h4" }]} />
      </Field>
      <Field label="Align">
        <Select value={settings.align} onChange={(v) => set("align", v as HeadingBlockSettings["align"])} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} />
      </Field>
    </FieldGrid>
  );
}

export function ParagraphBlockEditor({ settings, onChange }: { settings: ParagraphBlockSettings; onChange: (n: ParagraphBlockSettings) => void }) {
  const set = <K extends keyof ParagraphBlockSettings>(k: K, v: ParagraphBlockSettings[K]) => onChange({ ...settings, [k]: v });
  return (
    <div className="space-y-4">
      <Field label="Text">
        <TextArea value={settings.text} onChange={(e) => set("text", e.target.value)} />
      </Field>
      <Field label="Align">
        <Select value={settings.align} onChange={(v) => set("align", v as ParagraphBlockSettings["align"])} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} />
      </Field>
    </div>
  );
}

export function ImageBlockEditor({ settings, onChange }: { settings: ImageBlockSettings; onChange: (n: ImageBlockSettings) => void }) {
  const set = <K extends keyof ImageBlockSettings>(k: K, v: ImageBlockSettings[K]) => onChange({ ...settings, [k]: v });
  return (
    <div className="space-y-4">
      <ImageUploader label="Image" value={settings.url} onChange={(url) => set("url", url)} folder="prosumer-lens/custom" />
      <FieldGrid>
        <Field label="Alt Text">
          <TextInput value={settings.alt} onChange={(e) => set("alt", e.target.value)} />
        </Field>
      </FieldGrid>
      <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
        <Toggle checked={settings.rounded} onChange={(v) => set("rounded", v)} label="Rounded corners" />
        Rounded corners
      </label>
    </div>
  );
}

export function ButtonBlockEditor({ settings, onChange }: { settings: ButtonBlockSettings; onChange: (n: ButtonBlockSettings) => void }) {
  const set = <K extends keyof ButtonBlockSettings>(k: K, v: ButtonBlockSettings[K]) => onChange({ ...settings, [k]: v });
  return (
    <FieldGrid>
      <Field label="Label">
        <TextInput value={settings.label} onChange={(e) => set("label", e.target.value)} />
      </Field>
      <Field label="URL">
        <TextInput value={settings.url} onChange={(e) => set("url", e.target.value)} />
      </Field>
      <Field label="Style">
        <Select value={settings.variant} onChange={(v) => set("variant", v as ButtonBlockSettings["variant"])} options={[{ label: "Primary", value: "primary" }, { label: "Outline", value: "outline" }]} />
      </Field>
    </FieldGrid>
  );
}

export function SpacerBlockEditor({ settings, onChange }: { settings: SpacerBlockSettings; onChange: (n: SpacerBlockSettings) => void }) {
  return (
    <Field label="Height (px)">
      <TextInput type="number" min={4} max={240} value={settings.height} onChange={(e) => onChange({ height: Number(e.target.value) })} />
    </Field>
  );
}

export function DividerBlockEditor({ settings, onChange }: { settings: DividerBlockSettings; onChange: (n: DividerBlockSettings) => void }) {
  return (
    <Field label="Style">
      <Select value={settings.style} onChange={(v) => onChange({ style: v as DividerBlockSettings["style"] })} options={[{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }]} />
    </Field>
  );
}

export function ProductGridBlockEditor({ settings, onChange }: { settings: ProductGridBlockSettings; onChange: (n: ProductGridBlockSettings) => void }) {
  const set = <K extends keyof ProductGridBlockSettings>(k: K, v: ProductGridBlockSettings[K]) => onChange({ ...settings, [k]: v });
  const productItems = useProductItems();
  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Title (optional)">
          <TextInput value={settings.title ?? ""} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Columns">
          <Select value={String(settings.columns)} onChange={(v) => set("columns", Number(v) as 2 | 3 | 4)} options={[{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]} />
        </Field>
      </FieldGrid>
      <Field label="Products (leave empty to auto-select)">
        <CatalogPicker items={productItems} selected={settings.productIds} onChange={(ids) => set("productIds", ids)} searchPlaceholder="Search products..." />
      </Field>
    </div>
  );
}

export function ProductSliderBlockEditor({ settings, onChange }: { settings: ProductSliderBlockSettings; onChange: (n: ProductSliderBlockSettings) => void }) {
  const set = <K extends keyof ProductSliderBlockSettings>(k: K, v: ProductSliderBlockSettings[K]) => onChange({ ...settings, [k]: v });
  const productItems = useProductItems();
  return (
    <div className="space-y-4">
      <Field label="Title (optional)">
        <TextInput value={settings.title ?? ""} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Products (leave empty to auto-select)">
        <CatalogPicker items={productItems} selected={settings.productIds} onChange={(ids) => set("productIds", ids)} searchPlaceholder="Search products..." />
      </Field>
    </div>
  );
}

export function VideoBlockEditor({ settings, onChange }: { settings: VideoBlockSettings; onChange: (n: VideoBlockSettings) => void }) {
  return (
    <Field label="YouTube Video ID">
      <TextInput value={settings.youtubeId} onChange={(e) => onChange({ youtubeId: e.target.value })} />
    </Field>
  );
}

export function IconBlockEditor({ settings, onChange }: { settings: IconBlockSettings; onChange: (n: IconBlockSettings) => void }) {
  const set = <K extends keyof IconBlockSettings>(k: K, v: IconBlockSettings[K]) => onChange({ ...settings, [k]: v });
  const IconPreview = (Icons as unknown as Record<string, Icons.LucideIcon>)[settings.icon] ?? Icons.Star;
  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Icon">
          <Select value={settings.icon} onChange={(v) => set("icon", v)} options={commonIconNames.map((n) => ({ label: n, value: n }))} />
        </Field>
        <Field label="Label">
          <TextInput value={settings.label} onChange={(e) => set("label", e.target.value)} />
        </Field>
        <Field label="Size (px)">
          <TextInput type="number" min={16} max={64} value={settings.size} onChange={(e) => set("size", Number(e.target.value))} />
        </Field>
      </FieldGrid>
      <div className="flex items-center gap-2 text-foreground-muted">
        <IconPreview className="h-6 w-6 text-primary" />
        <span className="text-[12px]">Preview</span>
      </div>
    </div>
  );
}

export function HtmlBlockEditor({ settings, onChange }: { settings: HtmlBlockSettings; onChange: (n: HtmlBlockSettings) => void }) {
  return (
    <Field label="HTML" hint="Advanced — sanitize before rendering in production.">
      <TextArea value={settings.html} onChange={(e) => onChange({ html: e.target.value })} rows={6} />
    </Field>
  );
}
