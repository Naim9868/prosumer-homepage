"use client";

import { useState } from "react";
import { GripVertical, Monitor, Plus, Smartphone, Tablet, Trash2 } from "lucide-react";
import type { BeforeAfterCategory, BeforeAfterItem, BeforeAfterResponsiveStyle, BeforeAfterSettings, BeforeAfterStyle, CatTheme, EditorDevice, SectionStyle } from "@/types/homepage";
import { Field, FieldGrid, Select, TextInput, TextArea, Toggle, ColorField } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { ImageUploader } from "@/components/homepage-builder/image-uploader";
import { useCatalog } from "@/components/shared/catalog-context";
import { EditorSection } from "@/components/homepage-builder/hero/editor-section";
import { BeforeAfterSection } from "@/components/homepage-sections/before-after-section";

function ComparisonDisclosure({
  item,
  index,
  categories,
  productItems,
  updateItem,
  removeItem,
  move,
}: {
  item: BeforeAfterItem;
  index: number;
  categories: BeforeAfterCategory[];
  productItems: CatalogPickerItem[];
  updateItem: (index: number, patch: Partial<BeforeAfterItem>) => void;
  removeItem: (index: number) => void;
  move: (from: number, to: number) => void;
}) {
  const categoryName = categories.find((category) => category.id === item.categoryId)?.name || "Uncategorized";
  return (
    <details
      open={index === 0}
      draggable
      onDragStart={(event) => event.dataTransfer.setData("before-after-item", String(index))}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => move(Number(event.dataTransfer.getData("before-after-item")), index)}
      className="rounded border border-border"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 p-3 text-[13px] font-semibold text-foreground">
        <GripVertical className="h-4 w-4 shrink-0 text-foreground-muted" />
        <span className="min-w-0 flex-1 truncate">{item.title || "Untitled comparison"}</span>
        <span className="hidden max-w-32 truncate text-[11px] font-normal text-foreground-muted sm:inline" title={categoryName}>{categoryName}</span>
        <span className="text-[11px] font-normal text-foreground-muted">{item.isActive ? "Active" : "Disabled"}</span>
      </summary>
      <div className="space-y-3 border-t border-border p-3">
        <div className="flex items-center gap-2">
          <TextInput value={item.title} onChange={(event) => updateItem(index, { title: event.target.value })} className="flex-1" placeholder="Title" />
          <Toggle checked={item.isActive} onChange={(value) => updateItem(index, { isActive: value })} label={`Enable ${item.title}`} />
          <button type="button" onClick={() => removeItem(index)} className="text-destructive" aria-label={`Delete ${item.title}`}><Trash2 className="h-4 w-4" /></button>
        </div>
        <TextArea value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} placeholder="Description" />
        <FieldGrid>
          <Field label="Category"><Select value={item.categoryId} onChange={(value) => updateItem(index, { categoryId: value })} options={[{ label: "Select category", value: "" }, ...categories.map((category) => ({ label: category.name, value: category.id }))]} /></Field>
          <Field label="Button text"><TextInput value={item.buttonText} onChange={(event) => updateItem(index, { buttonText: event.target.value })} /></Field>
          <Field label="Button URL"><TextInput value={item.buttonUrl ?? ""} onChange={(event) => updateItem(index, { buttonUrl: event.target.value })} placeholder="/products/your-lens or https://..." /></Field>
          <Field label="Before label"><TextInput value={item.beforeLabel} onChange={(event) => updateItem(index, { beforeLabel: event.target.value })} /></Field>
          <Field label="After label"><TextInput value={item.afterLabel} onChange={(event) => updateItem(index, { afterLabel: event.target.value })} /></Field>
        </FieldGrid>
        <div className="grid gap-3 sm:grid-cols-2"><ImageUploader label="Before image" value={item.beforeImage} onChange={(url) => updateItem(index, { beforeImage: url })} folder="prosumer-lens/before-after" /><ImageUploader label="After image" value={item.afterImage} onChange={(url) => updateItem(index, { afterImage: url })} folder="prosumer-lens/before-after" /></div>
        <Field label="Product (optional)"><CatalogPicker items={productItems} selected={item.productId ? [item.productId] : []} limit={1} onChange={(ids) => updateItem(index, { productId: ids[0] ?? "" })} /></Field>
      </div>
    </details>
  );
}

const devices: { id: EditorDevice; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor }, { id: "tablet", label: "Tablet", icon: Tablet }, { id: "mobile", label: "Mobile", icon: Smartphone },
];
const themes: CatTheme[] = ["light", "dark"];
const styleTargets: { key: keyof BeforeAfterSettings; label: string }[] = [
  { key: "sectionStyle", label: "Section" }, { key: "headingStyle", label: "Title" }, { key: "subtitleStyle", label: "Subtitle" },
  { key: "categoryStyle", label: "Category tabs" }, { key: "activeCategoryStyle", label: "Active tab" }, { key: "itemTitleStyle", label: "Comparison title" },
  { key: "itemDescriptionStyle", label: "Comparison description" }, { key: "ctaStyle", label: "Product button" }, { key: "comparisonStyle", label: "Comparison frame" },
];

function mapStyle(settings: BeforeAfterSettings, key: keyof BeforeAfterSettings, device: EditorDevice, theme: CatTheme): BeforeAfterStyle {
  const map = settings[key] as BeforeAfterResponsiveStyle | undefined;
  return map?.[device]?.[theme] ?? {};
}

function StyleFields({ style, onChange, frame }: { style: BeforeAfterStyle; onChange: (style: BeforeAfterStyle) => void; frame?: boolean }) {
  const set = <K extends keyof BeforeAfterStyle>(key: K, value: BeforeAfterStyle[K]) => onChange({ ...style, [key]: value });
  return <div className="space-y-2">
    <Field label="Font family"><TextInput value={style.fontFamily ?? ""} onChange={(e) => set("fontFamily", e.target.value || undefined)} placeholder="e.g. Manrope, Georgia" /></Field>
    {!frame && <FieldGrid><Field label="Font size (px)"><TextInput type="number" value={style.fontSize ?? ""} onChange={(e) => set("fontSize", e.target.value ? Number(e.target.value) : undefined)} /></Field><Field label="Weight"><Select value={String(style.fontWeight ?? 400)} onChange={(v) => set("fontWeight", Number(v))} options={[300, 400, 500, 600, 700, 800].map((v) => ({ label: String(v), value: String(v) }))} /></Field></FieldGrid>}
    {!frame && <FieldGrid><Field label="Line height"><TextInput type="number" step="0.1" value={style.lineHeight ?? ""} onChange={(e) => set("lineHeight", e.target.value ? Number(e.target.value) : undefined)} /></Field><Field label="Letter spacing (px)"><TextInput type="number" step="0.5" value={style.letterSpacing ?? ""} onChange={(e) => set("letterSpacing", e.target.value ? Number(e.target.value) : undefined)} /></Field></FieldGrid>}
    <FieldGrid><ColorField label="Text color" value={style.color ?? ""} onChange={(v) => set("color", v || undefined)} /><ColorField label="Background" value={style.backgroundColor ?? ""} onChange={(v) => set("backgroundColor", v || undefined)} /></FieldGrid>
    <FieldGrid><ColorField label="Border color" value={style.borderColor ?? ""} onChange={(v) => set("borderColor", v || undefined)} /><Field label="Radius (px)"><TextInput className="py-1.5 text-xs" type="number" value={style.borderRadius ?? ""} onChange={(e) => set("borderRadius", e.target.value ? Number(e.target.value) : undefined)} /></Field><Field label="Border width (px)"><TextInput className="py-1.5 text-xs" type="number" min="0" value={style.borderWidth ?? ""} onChange={(e) => set("borderWidth", e.target.value ? Number(e.target.value) : undefined)} /></Field><Field label="Border type"><Select className="py-1.5 text-xs" value={style.borderStyle ?? "solid"} onChange={(v) => set("borderStyle", v as BeforeAfterStyle["borderStyle"])} options={["solid", "dashed", "dotted", "double", "none"].map((v) => ({ label: v, value: v }))} /></Field></FieldGrid>
    {frame === false && <FieldGrid><Field label="Width (px)"><TextInput className="py-1.5 text-xs" type="number" min="0" value={style.width ?? ""} onChange={(e) => set("width", e.target.value ? Number(e.target.value) : undefined)} /></Field><Field label="Height (px)"><TextInput className="py-1.5 text-xs" type="number" min="0" value={style.height ?? ""} onChange={(e) => set("height", e.target.value ? Number(e.target.value) : undefined)} /></Field></FieldGrid>}
    <Field label="Text alignment"><Select value={style.textAlign ?? "left"} onChange={(v) => set("textAlign", v as BeforeAfterStyle["textAlign"])} options={["left", "center", "right"].map((v) => ({ label: v, value: v }))} /></Field>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Padding (px)</p><FieldGrid><TextInput className="py-1.5 text-xs" type="number" placeholder="Top" value={style.paddingTop ?? ""} onChange={(e) => set("paddingTop", e.target.value ? Number(e.target.value) : undefined)} /><TextInput className="py-1.5 text-xs" type="number" placeholder="Bottom" value={style.paddingBottom ?? ""} onChange={(e) => set("paddingBottom", e.target.value ? Number(e.target.value) : undefined)} /><TextInput className="py-1.5 text-xs" type="number" placeholder="Left" value={style.paddingLeft ?? ""} onChange={(e) => set("paddingLeft", e.target.value ? Number(e.target.value) : undefined)} /><TextInput className="py-1.5 text-xs" type="number" placeholder="Right" value={style.paddingRight ?? ""} onChange={(e) => set("paddingRight", e.target.value ? Number(e.target.value) : undefined)} /></FieldGrid>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Margin (px)</p><FieldGrid><TextInput className="py-1.5 text-xs" type="number" placeholder="Top" value={style.marginTop ?? ""} onChange={(e) => set("marginTop", e.target.value ? Number(e.target.value) : undefined)} /><TextInput className="py-1.5 text-xs" type="number" placeholder="Bottom" value={style.marginBottom ?? ""} onChange={(e) => set("marginBottom", e.target.value ? Number(e.target.value) : undefined)} /><TextInput className="py-1.5 text-xs" type="number" placeholder="Left" value={style.marginLeft ?? ""} onChange={(e) => set("marginLeft", e.target.value ? Number(e.target.value) : undefined)} /><TextInput className="py-1.5 text-xs" type="number" placeholder="Right" value={style.marginRight ?? ""} onChange={(e) => set("marginRight", e.target.value ? Number(e.target.value) : undefined)} /></FieldGrid>
  </div>;
}

export function BeforeAfterEditor({ settings, onChange, style = {} }: { settings: BeforeAfterSettings; onChange: (next: BeforeAfterSettings) => void; style?: SectionStyle }) {
  const { products, categories: catalogCategories } = useCatalog();
  const [device, setDevice] = useState<EditorDevice>("desktop");
  const [theme, setTheme] = useState<CatTheme>("light");
  const [styleTarget, setStyleTarget] = useState<keyof BeforeAfterSettings>("headingStyle");
  const categories = settings.categories ?? [];
  const items = settings.items ?? [];
  const set = <K extends keyof BeforeAfterSettings>(key: K, value: BeforeAfterSettings[K]) => onChange({ ...settings, [key]: value });
  const updateCategory = (index: number, patch: Partial<BeforeAfterCategory>) => set("categories", categories.map((value, i) => i === index ? { ...value, ...patch } : value));
  const updateItem = (index: number, patch: Partial<BeforeAfterItem>) => set("items", items.map((value, i) => i === index ? { ...value, ...patch } : value));
  const move = (key: "categories" | "items", from: number, to: number) => { const list = [...(key === "categories" ? categories : items)]; const [entry] = list.splice(from, 1); list.splice(to, 0, entry); set(key, list.map((value, index) => ({ ...value, order: index })) as BeforeAfterSettings[typeof key]); };
  const productItems: CatalogPickerItem[] = products.map((product) => ({ id: product.id, label: product.name, subtitle: product.category, image: product.image || undefined }));
  const currentStyle = mapStyle(settings, styleTarget, device, theme);
  const updateStyle = (style: BeforeAfterStyle) => set(styleTarget, { ...(settings[styleTarget] as BeforeAfterResponsiveStyle | undefined), [device]: { ...((settings[styleTarget] as BeforeAfterResponsiveStyle | undefined)?.[device] ?? {}), [theme]: style } });
  const layoutDefaults = { layoutMode: "column" as const, imageWidth: 1080, imageAspectRatio: 1.6, contentGap: 32, categoryGap: 8, itemGap: 8, imageColumnPercent: 75, contentColumnPercent: 25 };
  const updateLayoutMode = (targetDevice: EditorDevice, value: "row" | "column") => set("layout", { ...settings.layout, [targetDevice]: { ...layoutDefaults, ...(settings.layout?.[targetDevice] ?? {}), layoutMode: value } });
  const updateLayoutFor = (targetDevice: EditorDevice, key: Exclude<keyof typeof layoutDefaults, "layoutMode">, value: number) => {
    const nextValue = key === "imageColumnPercent" || key === "contentColumnPercent" ? Math.max(0, Math.min(100, value)) : value;
    set("layout", { ...settings.layout, [targetDevice]: { ...layoutDefaults, ...(settings.layout?.[targetDevice] ?? {}), [key]: nextValue } });
  };
  const previewSection = { id: "before-after-preview", type: "beforeAfter" as const, enabled: true, order: 0, style, settings };
  const previewWidth = device === "mobile" ? 390 : device === "tablet" ? 760 : 1180;
  return <div className="before-after-editor space-y-5">
    <div className="overflow-hidden rounded-[var(--radius-sm)] border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Live preview</p>
        <span className="text-[11px] text-foreground-muted">{theme} / {device}</span>
      </div>
      <div className="overflow-x-auto bg-muted/30 p-3">
        <div className="mx-auto" style={{ width: "100%", maxWidth: previewWidth }}>
          <div className={theme === "dark" ? "dark" : ""}>
            <BeforeAfterSection key={`${device}-${theme}-${JSON.stringify(settings)}-${JSON.stringify(style)}`} section={previewSection} catalog={{ products, categories: catalogCategories, reviews: [] }} breakpoint={device} forceTheme={theme} />
          </div>
        </div>
      </div>
    </div>
    <EditorSection title="Content" defaultOpen>
    <FieldGrid><Field label="Eyebrow"><TextInput value={settings.eyebrow ?? ""} onChange={(e) => set("eyebrow", e.target.value)} /></Field><Field label="Title"><TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} /></Field><Field label="Subtitle"><TextArea value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} rows={2} /></Field></FieldGrid>
    </EditorSection>
    <EditorSection title="Design" defaultOpen>
    <div className="rounded-[var(--radius-sm)] border border-border p-3"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Design target</span>{devices.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setDevice(id)} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${device === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><Icon className="h-3 w-3" />{label}</button>)}<span className="mx-1 h-4 w-px bg-border" />{themes.map((value) => <button key={value} type="button" onClick={() => setTheme(value)} className={`rounded-md px-2 py-1 text-[11px] capitalize ${theme === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{value}</button>)}</div><div className="mt-3 flex gap-2"><Select value={String(styleTarget)} onChange={(value) => setStyleTarget(value as keyof BeforeAfterSettings)} options={styleTargets.map((target) => ({ label: target.label, value: String(target.key) }))} /></div><div className="mt-3"><StyleFields style={currentStyle} onChange={updateStyle} frame={styleTarget === "comparisonStyle"} /></div></div>
    </EditorSection>
    <EditorSection title="Responsive Layout" defaultOpen>
    <div className="rounded-[var(--radius-sm)] border border-border p-3"><p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Responsive layout</p><FieldGrid>{devices.map(({ id, label }) => <div key={id} className="space-y-2 rounded border border-border p-2"><p className="text-[11px] font-semibold">{label}</p><Select value={settings.layout?.[id]?.layoutMode ?? (id === "desktop" ? "row" : "column")} onChange={(value) => updateLayoutMode(id, value as "row" | "column")} options={[{ label: "Details beside image", value: "row" }, { label: "Details below image", value: "column" }]} /><TextInput type="number" value={settings.layout?.[id]?.imageWidth ?? ""} placeholder="Image width (px)" onChange={(e) => updateLayoutFor(id, "imageWidth", Number(e.target.value) || 0)} /><TextInput type="number" step="0.05" value={settings.layout?.[id]?.imageAspectRatio ?? ""} placeholder="Image ratio" onChange={(e) => updateLayoutFor(id, "imageAspectRatio", Number(e.target.value) || 1)} /><TextInput type="number" value={settings.layout?.[id]?.contentGap ?? ""} placeholder="Content gap (px)" onChange={(e) => updateLayoutFor(id, "contentGap", Number(e.target.value) || 0)} /><div className="grid grid-cols-2 gap-2"><TextInput type="number" min="0" max="100" value={settings.layout?.[id]?.imageColumnPercent ?? ""} placeholder="Image %" onChange={(e) => updateLayoutFor(id, "imageColumnPercent", Number(e.target.value) || 0)} /><TextInput type="number" min="0" max="100" value={settings.layout?.[id]?.contentColumnPercent ?? ""} placeholder="Details %" onChange={(e) => updateLayoutFor(id, "contentColumnPercent", Number(e.target.value) || 0)} /></div></div>)}</FieldGrid></div>
    </EditorSection>
    <EditorSection title="Categories" defaultOpen>
    <div className="space-y-3"><div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Categories</p><button type="button" onClick={() => set("categories", [...categories, { id: `bac_${Date.now()}`, name: "New category", slug: "new-category", isActive: true, order: categories.length }])} className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary"><Plus className="h-4 w-4" /> Add Category</button></div>{categories.map((category, index) => <div key={category.id} draggable onDragStart={(e) => e.dataTransfer.setData("before-after-category", String(index))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => move("categories", Number(e.dataTransfer.getData("before-after-category")), index)} className="flex items-center gap-2 rounded border border-border p-2"><GripVertical className="h-4 w-4 text-foreground-muted" /><TextInput value={category.name} onChange={(e) => updateCategory(index, { name: e.target.value, slug: e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") })} className="flex-1" /><Toggle checked={category.isActive} onChange={(value) => updateCategory(index, { isActive: value })} label={`Enable ${category.name}`} /><button type="button" onClick={() => set("categories", categories.filter((_, i) => i !== index))} className="text-destructive"><Trash2 className="h-4 w-4" /></button></div>)}</div>
    </EditorSection>
    <EditorSection title="Comparisons" defaultOpen>
    <div className="space-y-3"><div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Comparisons</p><button type="button" onClick={() => set("items", [...items, { id: `bai_${Date.now()}`, title: "New comparison", description: "Describe the difference.", categoryId: categories[0]?.id ?? "", beforeImage: "", afterImage: "", beforeLabel: "Before", afterLabel: "After", productId: "", buttonText: "Shop This Lens", buttonUrl: "", isActive: true, order: items.length }])} className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary"><Plus className="h-4 w-4" /> Add Comparison</button></div>{items.map((item, index) => <ComparisonDisclosure key={item.id} item={item} index={index} categories={categories} productItems={productItems} updateItem={updateItem} removeItem={(itemIndex) => set("items", items.filter((_, i) => i !== itemIndex))} move={(from, to) => move("items", from, to)} />)}</div>
    </EditorSection>
  </div>;
}
