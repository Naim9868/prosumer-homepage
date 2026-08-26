"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Monitor, Tablet, Smartphone, Sun, Moon } from "lucide-react";
import type {
  CategoriesSettings,
  CategoriesTextStyle,
  CatResponsiveThemeStyle,
  CatDeviceLayout,
  CatTheme,
  EditorDevice,
  SectionStyle,
  BrandsSettings,
  GallerySettings,
} from "@/types/homepage";
import { Field, FieldGrid, TextInput, Select, ColorField } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { ImageUploader } from "@/components/homepage-builder/image-uploader";
import { useCatalog } from "@/components/shared/catalog-context";
import { EditorDeviceProvider, EditorThemeProvider } from "@/components/homepage-builder/editor-context";
import { CategoriesSection } from "@/components/homepage-sections/categories-section";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────

function useCategoryItems(): CatalogPickerItem[] {
  const { categories } = useCatalog();
  return categories.map((c) => ({
    id: c.id,
    label: c.name,
    image: c.image || undefined,
    subtitle: c.slug,
  }));
}

function getStyle(
  map: CatResponsiveThemeStyle | undefined,
  device: EditorDevice,
  theme: CatTheme,
): CategoriesTextStyle {
  return map?.[device]?.[theme] ?? {};
}

function setStyle(
  map: CatResponsiveThemeStyle | undefined,
  device: EditorDevice,
  theme: CatTheme,
  patch: CategoriesTextStyle,
): CatResponsiveThemeStyle {
  return {
    ...map,
    [device]: {
      ...map?.[device],
      [theme]: patch,
    },
  };
}

function getLayout(
  layout: CatDeviceLayout | undefined,
  device: EditorDevice,
): { columns: 1 | 2 | 3 | 4 | 5 | 6; gridGap: number } {
  return layout?.[device] ?? { columns: 2, gridGap: 16 };
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
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        {title}
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-3 py-3">{children}</div>
      )}
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
  const set = <K extends keyof CategoriesTextStyle>(
    key: K,
    value: CategoriesTextStyle[K],
  ) => onChange({ ...style, [key]: value });

  return (
    <CollapsibleSection title={label} defaultOpen={false}>
      <TextInput
        value={style.fontFamily ?? ""}
        onChange={(e) => set("fontFamily", e.target.value || undefined)}
        placeholder="Font family (e.g. Inter, Georgia)"
      />
      <FieldGrid>
        <TextInput
          type="number"
          value={style.fontSize ?? ""}
          onChange={(e) =>
            set("fontSize", e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Font size (px)"
        />
        <Select
          value={String(style.fontWeight ?? 400)}
          onChange={(v) => set("fontWeight", Number(v))}
          options={[
            { label: "Light (300)", value: "300" },
            { label: "Regular (400)", value: "400" },
            { label: "Medium (500)", value: "500" },
            { label: "Semibold (600)", value: "600" },
            { label: "Bold (700)", value: "700" },
            { label: "Extra Bold (800)", value: "800" },
          ]}
        />
      </FieldGrid>
      <FieldGrid>
        <TextInput
          type="number"
          value={style.lineHeight ?? ""}
          onChange={(e) =>
            set("lineHeight", e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Line height (e.g. 1.2)"
          step="0.1"
        />
        <TextInput
          type="number"
          value={style.letterSpacing ?? ""}
          onChange={(e) =>
            set(
              "letterSpacing",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          placeholder="Letter spacing (px)"
          step="0.5"
        />
      </FieldGrid>
      <ColorField
        label="Text color"
        value={style.color ?? ""}
        onChange={(v) => set("color", v || undefined)}
      />
      <ColorField
        label="Background color"
        value={style.backgroundColor ?? ""}
        onChange={(v) => set("backgroundColor", v || undefined)}
      />
      <Field label="Text align">
        <Select
          value={style.textAlign ?? "left"}
          onChange={(v) =>
            set("textAlign", v as CategoriesTextStyle["textAlign"])
          }
          options={[
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
        />
      </Field>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
        Padding (px)
      </p>
      <FieldGrid>
        <TextInput
          type="number"
          value={style.paddingTop ?? ""}
          onChange={(e) =>
            set("paddingTop", e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Top"
        />
        <TextInput
          type="number"
          value={style.paddingBottom ?? ""}
          onChange={(e) =>
            set(
              "paddingBottom",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          placeholder="Bottom"
        />
      </FieldGrid>
      <FieldGrid>
        <TextInput
          type="number"
          value={style.paddingLeft ?? ""}
          onChange={(e) =>
            set(
              "paddingLeft",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          placeholder="Left"
        />
        <TextInput
          type="number"
          value={style.paddingRight ?? ""}
          onChange={(e) =>
            set(
              "paddingRight",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          placeholder="Right"
        />
      </FieldGrid>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
        Margin (px)
      </p>
      <FieldGrid>
        <TextInput
          type="number"
          value={style.marginTop ?? ""}
          onChange={(e) =>
            set("marginTop", e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Top"
        />
        <TextInput
          type="number"
          value={style.marginBottom ?? ""}
          onChange={(e) =>
            set(
              "marginBottom",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          placeholder="Bottom"
        />
      </FieldGrid>
      <FieldGrid>
        <TextInput
          type="number"
          value={style.marginLeft ?? ""}
          onChange={(e) =>
            set("marginLeft", e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Left"
        />
        <TextInput
          type="number"
          value={style.marginRight ?? ""}
          onChange={(e) =>
            set(
              "marginRight",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          placeholder="Right"
        />
      </FieldGrid>
    </CollapsibleSection>
  );
}

// ── responsive style fields (reads/writes device+theme slice) ────

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
  return (
    <TextStyleFields
      label={label}
      style={current}
      onChange={(s) => onMapChange(setStyle(map, device, theme, s))}
    />
  );
}

// ── stacked preview (all 3 devices) ──────────────────────────────

const DEVICES: { id: EditorDevice; label: string; icon: typeof Monitor; width: number }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1280 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
];

function CategoriesStackedPreview({
  settings,
  style,
}: {
  settings: CategoriesSettings;
  style?: SectionStyle;
}) {
  const { categories } = useCatalog();
  const [previewTheme, setPreviewTheme] = useState<CatTheme>("light");

  const sectionData = {
    id: "categories-preview",
    type: "categories" as const,
    enabled: true,
    order: 0,
    settings,
    style: style ?? {},
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
          Live Preview
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPreviewTheme("light")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              previewTheme === "light"
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:bg-muted",
            )}
            title="Light"
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewTheme("dark")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              previewTheme === "dark"
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:bg-muted",
            )}
            title="Dark"
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {DEVICES.map((d) => (
        <div key={d.id} className="space-y-1">
          <div className="flex items-center gap-1.5 px-1">
            <d.icon className="h-3 w-3 text-foreground-muted" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
              {d.label}
            </span>
            <span className="text-[10px] text-foreground-muted">({d.width}px)</span>
          </div>
          <div
            className={cn(
              "overflow-hidden rounded-[var(--radius-md)] border border-border shadow-inner",
              previewTheme === "dark" ? "bg-[#121416]" : "bg-[#f8f9fb]",
            )}
          >
            <div className="mx-auto" style={{ maxWidth: d.width }}>
              <div className={previewTheme === "dark" ? "dark" : ""}>
                <CategoriesSection
                  section={sectionData}
                  catalog={{ products: [], categories, reviews: [] }}
                  breakpoint={d.id}
                  forceTheme={previewTheme}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── main editor ──────────────────────────────────────────────────

export function CategoriesEditor({
  settings,
  onChange,
  style,
}: {
  settings: CategoriesSettings;
  onChange: (next: CategoriesSettings) => void;
  style?: SectionStyle;
}) {
  return (
    <EditorThemeProvider>
      <EditorDeviceProvider>
        <CategoriesEditorInner settings={settings} onChange={onChange} style={style} />
      </EditorDeviceProvider>
    </EditorThemeProvider>
  );
}

function CategoriesEditorInner({
  settings,
  onChange,
  style,
}: {
  settings: CategoriesSettings;
  onChange: (next: CategoriesSettings) => void;
  style?: SectionStyle;
}) {
  const [device, setDevice] = useState<EditorDevice>("desktop");
  const [theme, setTheme] = useState<CatTheme>("light");
  const categoryItems = useCategoryItems();

  const set = <K extends keyof CategoriesSettings>(
    key: K,
    value: CategoriesSettings[K],
  ) => onChange({ ...settings, [key]: value });

  const layout = getLayout(settings.layout, device);

  const DEVBtns: { id: EditorDevice; icon: typeof Monitor; label: string }[] = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  return (
    <div className="space-y-4">
      {/* Device + Theme switcher bar */}
      <div
        className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2"
        style={{ background: "var(--editor-card, var(--card))" }}
      >
        <div className="flex items-center gap-1">
          {DEVBtns.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDevice(d.id)}
              title={d.label}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors",
                device === d.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground-muted hover:bg-muted",
              )}
            >
              <d.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors",
              theme === "light"
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:bg-muted",
            )}
          >
            <Sun className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors",
              theme === "dark"
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:bg-muted",
            )}
          >
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
            <TextInput
              value={settings.eyebrow ?? ""}
              onChange={(e) => set("eyebrow", e.target.value || undefined)}
              placeholder="The Collection"
            />
          </Field>
          <FieldGrid>
            <Field label="Title">
              <TextInput
                value={settings.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <Field label="Subtitle">
              <TextInput
                value={settings.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
              />
            </Field>
          </FieldGrid>

          {/* Per-device layout */}
          <CollapsibleSection
            title={`Layout — ${device}`}
            defaultOpen={true}
          >
            <FieldGrid>
              <Field label="Columns (1–6)">
                <Select
                  value={String(layout.columns)}
                  onChange={(v) =>
                    set("layout", {
                      ...settings.layout,
                      [device]: {
                        ...layout,
                        columns: Number(v) as 1 | 2 | 3 | 4 | 5 | 6,
                      },
                    })
                  }
                  options={[
                    { label: "1", value: "1" },
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "4", value: "4" },
                    { label: "5", value: "5" },
                    { label: "6", value: "6" },
                  ]}
                />
              </Field>
              <Field label="Grid gap (px)">
                <TextInput
                  type="number"
                  value={layout.gridGap}
                  onChange={(e) =>
                    set("layout", {
                      ...settings.layout,
                      [device]: {
                        ...layout,
                        gridGap: e.target.value ? Number(e.target.value) : 16,
                      },
                    })
                  }
                  placeholder="16"
                />
              </Field>
            </FieldGrid>
          </CollapsibleSection>

          {/* Per device+theme text styles */}
          <ResponsiveStyleFields
            label={`Eyebrow style — ${device} ${theme}`}
            map={settings.eyebrowStyle}
            device={device}
            theme={theme}
            onMapChange={(m) => set("eyebrowStyle", m)}
          />
          <ResponsiveStyleFields
            label={`Title style — ${device} ${theme}`}
            map={settings.titleStyle}
            device={device}
            theme={theme}
            onMapChange={(m) => set("titleStyle", m)}
          />
          <ResponsiveStyleFields
            label={`Subtitle style — ${device} ${theme}`}
            map={settings.subtitleStyle}
            device={device}
            theme={theme}
            onMapChange={(m) => set("subtitleStyle", m)}
          />
          <ResponsiveStyleFields
            label={`Card name style — ${device} ${theme}`}
            map={settings.cardNameStyle}
            device={device}
            theme={theme}
            onMapChange={(m) => set("cardNameStyle", m)}
          />
          <ResponsiveStyleFields
            label={`Card description style — ${device} ${theme}`}
            map={settings.cardDescriptionStyle}
            device={device}
            theme={theme}
            onMapChange={(m) => set("cardDescriptionStyle", m)}
          />

          {/* Card text position (shared) */}
          <CollapsibleSection title="Card text position" defaultOpen={false}>
            <Field label="Position">
              <Select
                value={settings.cardTextPosition ?? "inside"}
                onChange={(v) =>
                  set(
                    "cardTextPosition",
                    v as CategoriesSettings["cardTextPosition"],
                  )
                }
                options={[
                  { label: "Inside image", value: "inside" },
                  { label: "Outside — top", value: "outside-top" },
                  { label: "Outside — bottom", value: "outside-bottom" },
                ]}
              />
            </Field>
            <FieldGrid>
              <TextInput
                type="number"
                value={settings.cardTextOffsetX ?? ""}
                onChange={(e) =>
                  set(
                    "cardTextOffsetX",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="Offset X (px)"
              />
              <TextInput
                type="number"
                value={settings.cardTextOffsetY ?? ""}
                onChange={(e) =>
                  set(
                    "cardTextOffsetY",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="Offset Y (px)"
              />
            </FieldGrid>
          </CollapsibleSection>

          {/* Categories picker (shared) */}
          <Field label="Categories to show (leave empty to show all)">
            <CatalogPicker
              items={categoryItems}
              selected={settings.categoryIds}
              onChange={(ids) => set("categoryIds", ids)}
              searchPlaceholder="Search categories..."
            />
          </Field>
        </div>

        {/* Right: Stacked preview */}
        <div className="min-w-0">
          <CategoriesStackedPreview settings={settings} style={style} />
        </div>
      </div>
    </div>
  );
}

// ── brands / gallery (unchanged) ─────────────────────────────────

export function BrandsEditor({
  settings,
  onChange,
}: {
  settings: BrandsSettings;
  onChange: (next: BrandsSettings) => void;
}) {
  const set = <K extends keyof BrandsSettings>(
    key: K,
    value: BrandsSettings[K],
  ) => onChange({ ...settings, [key]: value });

  const updateLogo = (i: number, patch: Partial<{ name: string; url: string }>) => {
    const next = settings.logos.map((l, idx) =>
      idx === i ? { ...l, ...patch } : l,
    );
    set("logos", next);
  };
  const addLogo = () =>
    set("logos", [...settings.logos, { name: "New Brand", url: "" }]);
  const removeLogo = (i: number) =>
    set(
      "logos",
      settings.logos.filter((_, idx) => idx !== i),
    );

  return (
    <div className="space-y-4">
      <Field label="Title">
        <TextInput
          value={settings.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
          Logos
        </p>
        {settings.logos.map((logo, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput
              value={logo.name}
              onChange={(e) => updateLogo(i, { name: e.target.value })}
              placeholder="Brand name"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeLogo(i)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border text-destructive hover:bg-muted"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addLogo}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary"
        >
          <Plus className="h-4 w-4" /> Add Logo
        </button>
      </div>
    </div>
  );
}

export function GalleryEditor({
  settings,
  onChange,
}: {
  settings: GallerySettings;
  onChange: (next: GallerySettings) => void;
}) {
  const set = <K extends keyof GallerySettings>(
    key: K,
    value: GallerySettings[K],
  ) => onChange({ ...settings, [key]: value });

  const updateImage = (
    i: number,
    patch: Partial<{ url: string; caption?: string }>,
  ) => {
    set(
      "images",
      settings.images.map((img, idx) =>
        idx === i ? { ...img, ...patch } : img,
      ),
    );
  };
  const addImage = () =>
    set("images", [...settings.images, { url: "", caption: "" }]);
  const removeImage = (i: number) =>
    set(
      "images",
      settings.images.filter((_, idx) => idx !== i),
    );

  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Title">
          <TextInput
            value={settings.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
        <Field label="Subtitle">
          <TextInput
            value={settings.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
          />
        </Field>
      </FieldGrid>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
          Images{" "}
          {settings.images.length === 0 && "(empty = procedural placeholders)"}
        </p>
        {settings.images.map((img, i) => (
          <div
            key={i}
            className="space-y-2 rounded-[var(--radius-sm)] border border-border p-3"
          >
            <div className="flex items-center gap-2">
              <ImageUploader
                value={img.url}
                onChange={(url) => updateImage(i, { url })}
                folder="prosumer-lens/gallery"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border text-destructive hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <TextInput
              value={img.caption ?? ""}
              onChange={(e) => updateImage(i, { caption: e.target.value })}
              placeholder="Caption (optional)"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addImage}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary"
        >
          <Plus className="h-4 w-4" /> Add Image
        </button>
      </div>
    </div>
  );
}
