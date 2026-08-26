"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone, Sun, Moon, ChevronDown, ChevronRight } from "lucide-react";
import type {
  FeaturedProductsSettings,
  CategoriesTextStyle,
  CatResponsiveThemeStyle,
  CatDeviceLayout,
  CatTheme,
  EditorDevice,
  SectionStyle,
  NewArrivalsSettings,
  BestSellersSettings,
  FlashSaleSettings,
} from "@/types/homepage";
import { Field, FieldGrid, TextInput, Select, ColorField } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { useCatalog } from "@/components/shared/catalog-context";
import { EditorDeviceProvider, EditorThemeProvider } from "@/components/homepage-builder/editor-context";
import { FeaturedProductsSection } from "@/components/homepage-sections/featured-products-section";
import { NewArrivalsSection } from "@/components/homepage-sections/new-arrivals-section";
import { BestSellersSection } from "@/components/homepage-sections/best-sellers-section";
import { catLayoutFor } from "@/components/homepage-sections/categories-section";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────

function useProductItems(): CatalogPickerItem[] {
  const { products } = useCatalog();
  return products.map((p) => ({
    id: p.id,
    label: p.name,
    image: p.image || undefined,
    subtitle: p.price > 0 ? `৳${p.price.toLocaleString()}` : undefined,
  }));
}

function getStyle(map: CatResponsiveThemeStyle | undefined, device: EditorDevice, theme: CatTheme): CategoriesTextStyle {
  return map?.[device]?.[theme] ?? {};
}

function setStyle(
  map: CatResponsiveThemeStyle | undefined,
  device: EditorDevice,
  theme: CatTheme,
  patch: CategoriesTextStyle,
): CatResponsiveThemeStyle {
  return { ...map, [device]: { ...map?.[device], [theme]: patch } };
}

// ── collapsible ──────────────────────────────────────────────────

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-[var(--radius-sm)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted hover:bg-muted/50"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        {title}
      </button>
      {open && <div className="space-y-3 border-t border-border px-3 py-3">{children}</div>}
    </div>
  );
}

// ── text style fields ────────────────────────────────────────────

function TextStyleFields({
  label,
  style,
  onChange,
}: {
  label: string;
  style: CategoriesTextStyle;
  onChange: (next: CategoriesTextStyle) => void;
}) {
  const set = <K extends keyof CategoriesTextStyle>(key: K, value: CategoriesTextStyle[K]) =>
    onChange({ ...style, [key]: value });

  return (
    <CollapsibleSection title={label} defaultOpen={false}>
      <TextInput value={style.fontFamily ?? ""} onChange={(e) => set("fontFamily", e.target.value || undefined)} placeholder="Font family" />
      <FieldGrid>
        <TextInput type="number" value={style.fontSize ?? ""} onChange={(e) => set("fontSize", e.target.value ? Number(e.target.value) : undefined)} placeholder="Font size (px)" />
        <Select value={String(style.fontWeight ?? 400)} onChange={(v) => set("fontWeight", Number(v))} options={[{ label: "Light (300)", value: "300" }, { label: "Regular (400)", value: "400" }, { label: "Medium (500)", value: "500" }, { label: "Semibold (600)", value: "600" }, { label: "Bold (700)", value: "700" }, { label: "Extra Bold (800)", value: "800" }]} />
      </FieldGrid>
      <FieldGrid>
        <TextInput type="number" value={style.lineHeight ?? ""} onChange={(e) => set("lineHeight", e.target.value ? Number(e.target.value) : undefined)} placeholder="Line height" step="0.1" />
        <TextInput type="number" value={style.letterSpacing ?? ""} onChange={(e) => set("letterSpacing", e.target.value ? Number(e.target.value) : undefined)} placeholder="Letter spacing (px)" step="0.5" />
      </FieldGrid>
      <ColorField label="Text color" value={style.color ?? ""} onChange={(v) => set("color", v || undefined)} />
      <ColorField label="Background color" value={style.backgroundColor ?? ""} onChange={(v) => set("backgroundColor", v || undefined)} />
      <Field label="Text align">
        <Select value={style.textAlign ?? "left"} onChange={(v) => set("textAlign", v as CategoriesTextStyle["textAlign"])} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} />
      </Field>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Padding (px)</p>
      <FieldGrid>
        <TextInput type="number" value={style.paddingTop ?? ""} onChange={(e) => set("paddingTop", e.target.value ? Number(e.target.value) : undefined)} placeholder="Top" />
        <TextInput type="number" value={style.paddingBottom ?? ""} onChange={(e) => set("paddingBottom", e.target.value ? Number(e.target.value) : undefined)} placeholder="Bottom" />
      </FieldGrid>
      <FieldGrid>
        <TextInput type="number" value={style.paddingLeft ?? ""} onChange={(e) => set("paddingLeft", e.target.value ? Number(e.target.value) : undefined)} placeholder="Left" />
        <TextInput type="number" value={style.paddingRight ?? ""} onChange={(e) => set("paddingRight", e.target.value ? Number(e.target.value) : undefined)} placeholder="Right" />
      </FieldGrid>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Margin (px)</p>
      <FieldGrid>
        <TextInput type="number" value={style.marginTop ?? ""} onChange={(e) => set("marginTop", e.target.value ? Number(e.target.value) : undefined)} placeholder="Top" />
        <TextInput type="number" value={style.marginBottom ?? ""} onChange={(e) => set("marginBottom", e.target.value ? Number(e.target.value) : undefined)} placeholder="Bottom" />
      </FieldGrid>
      <FieldGrid>
        <TextInput type="number" value={style.marginLeft ?? ""} onChange={(e) => set("marginLeft", e.target.value ? Number(e.target.value) : undefined)} placeholder="Left" />
        <TextInput type="number" value={style.marginRight ?? ""} onChange={(e) => set("marginRight", e.target.value ? Number(e.target.value) : undefined)} placeholder="Right" />
      </FieldGrid>
    </CollapsibleSection>
  );
}

function ResponsiveStyleFields({
  label,
  map,
  device,
  theme,
  onMapChange,
}: {
  label: string;
  map: CatResponsiveThemeStyle | undefined;
  device: EditorDevice;
  theme: CatTheme;
  onMapChange: (next: CatResponsiveThemeStyle) => void;
}) {
  const current = getStyle(map, device, theme);
  return <TextStyleFields label={label} style={current} onChange={(s) => onMapChange(setStyle(map, device, theme, s))} />;
}

// ── stacked preview ──────────────────────────────────────────────

const DEVICES: { id: EditorDevice; label: string; icon: typeof Monitor; width: number }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1280 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
];

function FeaturedProductsStackedPreview({
  settings,
  style,
}: {
  settings: FeaturedProductsSettings;
  style?: SectionStyle;
}) {
  const { products } = useCatalog();
  const [previewTheme, setPreviewTheme] = useState<CatTheme>("light");

  const sectionData = {
    id: "featured-products-preview",
    type: "featuredProducts" as const,
    enabled: true,
    order: 0,
    settings,
    style: style ?? {},
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Live Preview</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPreviewTheme("light")} className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-colors", previewTheme === "light" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")} title="Light">
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setPreviewTheme("dark")} className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-colors", previewTheme === "dark" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")} title="Dark">
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {DEVICES.map((d) => (
        <div key={d.id} className="space-y-1">
          <div className="flex items-center gap-1.5 px-1">
            <d.icon className="h-3 w-3 text-foreground-muted" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">{d.label}</span>
            <span className="text-[10px] text-foreground-muted">({d.width}px)</span>
          </div>
          <div className={cn("overflow-hidden rounded-[var(--radius-md)] border border-border shadow-inner", previewTheme === "dark" ? "bg-[#121416]" : "bg-[#f8f9fb]")}>
            <div className="mx-auto" style={{ maxWidth: d.width }}>
              <div className={previewTheme === "dark" ? "dark" : ""}>
                <FeaturedProductsSection section={sectionData} catalog={{ products, categories: [], reviews: [] }} breakpoint={d.id} forceTheme={previewTheme} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── main editor ──────────────────────────────────────────────────

export function FeaturedProductsEditor({
  settings,
  onChange,
  style,
}: {
  settings: FeaturedProductsSettings;
  onChange: (next: FeaturedProductsSettings) => void;
  style?: SectionStyle;
}) {
  return (
    <EditorThemeProvider>
      <EditorDeviceProvider>
        <FeaturedProductsEditorInner settings={settings} onChange={onChange} style={style} />
      </EditorDeviceProvider>
    </EditorThemeProvider>
  );
}

function FeaturedProductsEditorInner({
  settings,
  onChange,
  style,
}: {
  settings: FeaturedProductsSettings;
  onChange: (next: FeaturedProductsSettings) => void;
  style?: SectionStyle;
}) {
  const [device, setDevice] = useState<EditorDevice>("desktop");
  const [theme, setTheme] = useState<CatTheme>("light");
  const productItems = useProductItems();

  const set = <K extends keyof FeaturedProductsSettings>(key: K, value: FeaturedProductsSettings[K]) =>
    onChange({ ...settings, [key]: value });

  const layout = catLayoutFor(settings.layout, device);

  const DEVBtns: { id: EditorDevice; icon: typeof Monitor; label: string }[] = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  return (
    <div className="space-y-4">
      {/* Device + Theme switcher bar */}
      <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2" style={{ background: "var(--editor-card, var(--card))" }}>
        <div className="flex items-center gap-1">
          {DEVBtns.map((d) => (
            <button key={d.id} type="button" onClick={() => setDevice(d.id)} title={d.label} className={cn("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors", device === d.id ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")}>
              <d.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setTheme("light")} className={cn("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors", theme === "light" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")}>
            <Sun className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Light</span>
          </button>
          <button type="button" onClick={() => setTheme("dark")} className={cn("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors", theme === "dark" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")}>
            <Moon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left: Editor fields */}
        <div className="space-y-4 lg:sticky lg:top-0 lg:max-h-[calc(100vh-220px)] lg:self-start lg:overflow-y-auto">
          {/* Content (shared) */}
          <Field label="Eyebrow text">
            <TextInput value={settings.eyebrow ?? ""} onChange={(e) => set("eyebrow", e.target.value || undefined)} placeholder="Featured" />
          </Field>
          <FieldGrid>
            <Field label="Title">
              <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </Field>
          </FieldGrid>
          <FieldGrid>
            <Field label="View all label">
              <TextInput value={settings.viewAllLabel ?? ""} onChange={(e) => set("viewAllLabel", e.target.value || undefined)} placeholder="View all products" />
            </Field>
          </FieldGrid>
          <Field label="View all URL">
            <TextInput value={settings.viewAllUrl ?? ""} onChange={(e) => set("viewAllUrl", e.target.value || undefined)} placeholder="#best-sellers" />
          </Field>

          {/* Per-device layout */}
          <CollapsibleSection title={`Layout — ${device}`} defaultOpen={true}>
            <FieldGrid>
              <Field label={`Columns (${device})`}>
                <Select value={String(layout.columns)} onChange={(v) => set("layout", { ...settings.layout, [device]: { ...layout, columns: Number(v) as 1 | 2 | 3 | 4 | 5 | 6 } })} options={[{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }]} />
              </Field>
              <Field label={`Product limit (${device})`}>
                <TextInput type="number" min={1} max={24} value={layout.limit ?? 8} onChange={(e) => set("layout", { ...settings.layout, [device]: { ...layout, limit: e.target.value ? Number(e.target.value) : 8 } })} placeholder="8" />
              </Field>
            </FieldGrid>
            <Field label={`Card gap — px (${device})`}>
              <TextInput type="number" min={0} max={64} value={layout.gridGap} onChange={(e) => set("layout", { ...settings.layout, [device]: { ...layout, gridGap: e.target.value ? Number(e.target.value) : 16 } })} placeholder="16" />
            </Field>
          </CollapsibleSection>

          {/* Per device+theme text styles */}
          <ResponsiveStyleFields label={`Eyebrow style — ${device} ${theme}`} map={settings.eyebrowStyle} device={device} theme={theme} onMapChange={(m) => set("eyebrowStyle", m)} />
          <ResponsiveStyleFields label={`Title style — ${device} ${theme}`} map={settings.titleStyle} device={device} theme={theme} onMapChange={(m) => set("titleStyle", m)} />
          <ResponsiveStyleFields label={`Subtitle style — ${device} ${theme}`} map={settings.subtitleStyle} device={device} theme={theme} onMapChange={(m) => set("subtitleStyle", m)} />
          <ResponsiveStyleFields label={`View all style — ${device} ${theme}`} map={settings.viewAllStyle} device={device} theme={theme} onMapChange={(m) => set("viewAllStyle", m)} />

          {/* Products picker */}
          <Field label="Products (leave empty to auto-select)">
            <CatalogPicker items={productItems} selected={settings.productIds} onChange={(ids) => set("productIds", ids)} searchPlaceholder="Search products..." />
          </Field>
        </div>

        {/* Right: Stacked preview */}
        <div className="min-w-0">
          <FeaturedProductsStackedPreview settings={settings} style={style} />
        </div>
      </div>
    </div>
  );
}

// ── other editors (unchanged) ────────────────────────────────────

// ── New Arrivals stacked preview ──────────────────────────────────

function NewArrivalsStackedPreview({
  settings,
  style,
}: {
  settings: NewArrivalsSettings;
  style?: SectionStyle;
}) {
  const { products } = useCatalog();
  const [previewTheme, setPreviewTheme] = useState<CatTheme>("light");

  const sectionData = {
    id: "new-arrivals-preview",
    type: "newArrivals" as const,
    enabled: true,
    order: 0,
    settings,
    style: style ?? {},
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Live Preview</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPreviewTheme("light")} className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-colors", previewTheme === "light" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")} title="Light">
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setPreviewTheme("dark")} className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-colors", previewTheme === "dark" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")} title="Dark">
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {DEVICES.map((d) => (
        <div key={d.id} className="space-y-1">
          <div className="flex items-center gap-1.5 px-1">
            <d.icon className="h-3 w-3 text-foreground-muted" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">{d.label}</span>
            <span className="text-[10px] text-foreground-muted">({d.width}px)</span>
          </div>
          <div className={cn("overflow-hidden rounded-[var(--radius-md)] border border-border shadow-inner", previewTheme === "dark" ? "bg-[#121416]" : "bg-[#f8f9fb]")}>
            <div className="mx-auto" style={{ maxWidth: d.width }}>
              <div className={previewTheme === "dark" ? "dark" : ""}>
                <NewArrivalsSection section={sectionData} catalog={{ products, categories: [], reviews: [] }} breakpoint={d.id} forceTheme={previewTheme} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── New Arrivals editor ──────────────────────────────────────────

export function NewArrivalsEditor({
  settings,
  onChange,
  style,
}: {
  settings: NewArrivalsSettings;
  onChange: (next: NewArrivalsSettings) => void;
  style?: SectionStyle;
}) {
  return (
    <EditorThemeProvider>
      <EditorDeviceProvider>
        <NewArrivalsEditorInner settings={settings} onChange={onChange} style={style} />
      </EditorDeviceProvider>
    </EditorThemeProvider>
  );
}

function NewArrivalsEditorInner({
  settings,
  onChange,
  style,
}: {
  settings: NewArrivalsSettings;
  onChange: (next: NewArrivalsSettings) => void;
  style?: SectionStyle;
}) {
  const [device, setDevice] = useState<EditorDevice>("desktop");
  const [theme, setTheme] = useState<CatTheme>("light");

  const set = <K extends keyof NewArrivalsSettings>(key: K, value: NewArrivalsSettings[K]) =>
    onChange({ ...settings, [key]: value });

  const layout = catLayoutFor(settings.layout, device);

  const DEVBtns: { id: EditorDevice; icon: typeof Monitor; label: string }[] = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  return (
    <div className="space-y-4">
      {/* Device + Theme switcher bar */}
      <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2" style={{ background: "var(--editor-card, var(--card))" }}>
        <div className="flex items-center gap-1">
          {DEVBtns.map((d) => (
            <button key={d.id} type="button" onClick={() => setDevice(d.id)} title={d.label} className={cn("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors", device === d.id ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")}>
              <d.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setTheme("light")} className={cn("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors", theme === "light" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")}>
            <Sun className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Light</span>
          </button>
          <button type="button" onClick={() => setTheme("dark")} className={cn("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors", theme === "dark" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")}>
            <Moon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left: Editor fields */}
        <div className="space-y-4 lg:sticky lg:top-0 lg:max-h-[calc(100vh-220px)] lg:self-start lg:overflow-y-auto">
          {/* Content (shared) */}
          <Field label="Eyebrow text">
            <TextInput value={settings.eyebrow ?? ""} onChange={(e) => set("eyebrow", e.target.value || undefined)} placeholder="Just In" />
          </Field>
          <FieldGrid>
            <Field label="Title">
              <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </Field>
          </FieldGrid>
          <Field label="New within days (empty = show all)">
            <TextInput type="number" min={1} max={365} value={settings.days ?? ""} onChange={(e) => set("days", e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 30" />
          </Field>

          {/* Per-device layout */}
          <CollapsibleSection title={`Layout — ${device}`} defaultOpen={true}>
            <FieldGrid>
              <Field label={`Columns (${device})`}>
                <Select value={String(layout.columns)} onChange={(v) => set("layout", { ...settings.layout, [device]: { ...layout, columns: Number(v) as 1 | 2 | 3 | 4 | 5 | 6 } })} options={[{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }]} />
              </Field>
              <Field label={`Product limit (${device})`}>
                <TextInput type="number" min={1} max={24} value={layout.limit ?? 8} onChange={(e) => set("layout", { ...settings.layout, [device]: { ...layout, limit: e.target.value ? Number(e.target.value) : 8 } })} placeholder="8" />
              </Field>
            </FieldGrid>
            <Field label={`Card gap — px (${device})`}>
              <TextInput type="number" min={0} max={64} value={layout.gridGap} onChange={(e) => set("layout", { ...settings.layout, [device]: { ...layout, gridGap: e.target.value ? Number(e.target.value) : 16 } })} placeholder="16" />
            </Field>
          </CollapsibleSection>

          {/* Per device+theme text styles */}
          <ResponsiveStyleFields label={`Eyebrow style — ${device} ${theme}`} map={settings.eyebrowStyle} device={device} theme={theme} onMapChange={(m) => set("eyebrowStyle", m)} />
          <ResponsiveStyleFields label={`Title style — ${device} ${theme}`} map={settings.titleStyle} device={device} theme={theme} onMapChange={(m) => set("titleStyle", m)} />
          <ResponsiveStyleFields label={`Subtitle style — ${device} ${theme}`} map={settings.subtitleStyle} device={device} theme={theme} onMapChange={(m) => set("subtitleStyle", m)} />
        </div>

        {/* Right: Stacked preview */}
        <div className="min-w-0">
          <NewArrivalsStackedPreview settings={settings} style={style} />
        </div>
      </div>
    </div>
  );
}

// ── Best Sellers stacked preview ──────────────────────────────────

function BestSellersStackedPreview({
  settings,
  style,
}: {
  settings: BestSellersSettings;
  style?: SectionStyle;
}) {
  const { products } = useCatalog();
  const [previewTheme, setPreviewTheme] = useState<CatTheme>("light");

  const sectionData = {
    id: "best-sellers-preview",
    type: "bestSellers" as const,
    enabled: true,
    order: 0,
    settings,
    style: style ?? {},
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Live Preview</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPreviewTheme("light")} className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-colors", previewTheme === "light" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")} title="Light">
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setPreviewTheme("dark")} className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-colors", previewTheme === "dark" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")} title="Dark">
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {DEVICES.map((d) => (
        <div key={d.id} className="space-y-1">
          <div className="flex items-center gap-1.5 px-1">
            <d.icon className="h-3 w-3 text-foreground-muted" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">{d.label}</span>
            <span className="text-[10px] text-foreground-muted">({d.width}px)</span>
          </div>
          <div className={cn("overflow-hidden rounded-[var(--radius-md)] border border-border shadow-inner", previewTheme === "dark" ? "bg-[#121416]" : "bg-[#f8f9fb]")}>
            <div className="mx-auto" style={{ maxWidth: d.width }}>
              <div className={previewTheme === "dark" ? "dark" : ""}>
                <BestSellersSection section={sectionData} catalog={{ products, categories: [], reviews: [] }} breakpoint={d.id} forceTheme={previewTheme} preview />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Best Sellers editor ──────────────────────────────────────────

export function BestSellersEditor({
  settings,
  onChange,
  style,
}: {
  settings: BestSellersSettings;
  onChange: (next: BestSellersSettings) => void;
  style?: SectionStyle;
}) {
  return (
    <EditorThemeProvider>
      <EditorDeviceProvider>
        <BestSellersEditorInner settings={settings} onChange={onChange} style={style} />
      </EditorDeviceProvider>
    </EditorThemeProvider>
  );
}

function BestSellersEditorInner({
  settings,
  onChange,
  style,
}: {
  settings: BestSellersSettings;
  onChange: (next: BestSellersSettings) => void;
  style?: SectionStyle;
}) {
  const [device, setDevice] = useState<EditorDevice>("desktop");
  const [theme, setTheme] = useState<CatTheme>("light");
  const productItems = useProductItems();

  const set = <K extends keyof BestSellersSettings>(key: K, value: BestSellersSettings[K]) =>
    onChange({ ...settings, [key]: value });

  const layout = catLayoutFor(settings.layout, device);

  const DEVBtns: { id: EditorDevice; icon: typeof Monitor; label: string }[] = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  return (
    <div className="space-y-4">
      {/* Device + Theme switcher bar */}
      <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2" style={{ background: "var(--editor-card, var(--card))" }}>
        <div className="flex items-center gap-1">
          {DEVBtns.map((d) => (
            <button key={d.id} type="button" onClick={() => setDevice(d.id)} title={d.label} className={cn("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors", device === d.id ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")}>
              <d.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setTheme("light")} className={cn("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors", theme === "light" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")}>
            <Sun className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Light</span>
          </button>
          <button type="button" onClick={() => setTheme("dark")} className={cn("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors", theme === "dark" ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted")}>
            <Moon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left: Editor fields */}
        <div className="space-y-4 lg:sticky lg:top-0 lg:max-h-[calc(100vh-220px)] lg:self-start lg:overflow-y-auto">
          {/* Content (shared) */}
          <Field label="Eyebrow text">
            <TextInput value={settings.eyebrow ?? ""} onChange={(e) => set("eyebrow", e.target.value || undefined)} placeholder="Ranked by Shooters" />
          </Field>
          <FieldGrid>
            <Field label="Title">
              <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </Field>
          </FieldGrid>
          <FieldGrid>
            <Field label="View all label">
              <TextInput value={settings.viewAllLabel ?? ""} onChange={(e) => set("viewAllLabel", e.target.value || undefined)} placeholder="View all best sellers" />
            </Field>
            <Field label="View all URL">
              <TextInput value={settings.viewAllUrl ?? ""} onChange={(e) => set("viewAllUrl", e.target.value || undefined)} placeholder="/best-sellers" />
            </Field>
          </FieldGrid>
          <Field label="Products (pick from catalog — only your picks are shown)">
            <CatalogPicker items={productItems} selected={settings.productIds} onChange={(ids) => set("productIds", ids)} searchPlaceholder="Search products..." />
          </Field>

          {/* Per-device layout */}
          <CollapsibleSection title={`Layout — ${device}`} defaultOpen={true}>
            <FieldGrid>
              <Field label={`Columns (${device})`}>
                <Select value={String(layout.columns)} onChange={(v) => set("layout", { ...settings.layout, [device]: { ...layout, columns: Number(v) as 1 | 2 | 3 | 4 | 5 | 6 } })} options={[{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }]} />
              </Field>
              <Field label={`Product limit (${device})`}>
                <TextInput type="number" min={1} max={24} value={layout.limit ?? 8} onChange={(e) => set("layout", { ...settings.layout, [device]: { ...layout, limit: e.target.value ? Number(e.target.value) : 8 } })} placeholder="8" />
              </Field>
            </FieldGrid>
            <Field label={`Card gap — px (${device})`}>
              <TextInput type="number" min={0} max={64} value={layout.gridGap} onChange={(e) => set("layout", { ...settings.layout, [device]: { ...layout, gridGap: e.target.value ? Number(e.target.value) : 16 } })} placeholder="16" />
            </Field>
          </CollapsibleSection>

          {/* Per device+theme text styles */}
          <ResponsiveStyleFields label={`Eyebrow style — ${device} ${theme}`} map={settings.eyebrowStyle} device={device} theme={theme} onMapChange={(m) => set("eyebrowStyle", m)} />
          <ResponsiveStyleFields label={`Title style — ${device} ${theme}`} map={settings.titleStyle} device={device} theme={theme} onMapChange={(m) => set("titleStyle", m)} />
          <ResponsiveStyleFields label={`Subtitle style — ${device} ${theme}`} map={settings.subtitleStyle} device={device} theme={theme} onMapChange={(m) => set("subtitleStyle", m)} />
          <ResponsiveStyleFields label={`View all style — ${device} ${theme}`} map={settings.viewAllStyle} device={device} theme={theme} onMapChange={(m) => set("viewAllStyle", m)} />
        </div>

        {/* Right: Stacked preview */}
        <div className="min-w-0">
          <BestSellersStackedPreview settings={settings} style={style} />
        </div>
      </div>
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
