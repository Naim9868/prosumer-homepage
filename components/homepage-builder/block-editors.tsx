"use client";

import type { CSSProperties } from "react";
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
  CustomWidgetBlockSettings,
  ContainerBlockSettings,
  Block,
  BlockType,
} from "@/types/homepage";
import { BLOCK_TYPES, BLOCK_TYPE_META } from "@/types/homepage";
import { Field, FieldGrid, TextInput, TextArea, Select, Toggle } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { ImageUploader } from "@/components/homepage-builder/image-uploader";
import { useCatalog } from "@/components/shared/catalog-context";
import { createDefaultBlock } from "@/lib/homepage-defaults";

function useProductItems(): CatalogPickerItem[] {
  const { products } = useCatalog();
  return products.map((p) => ({
    id: p.id,
    label: p.name,
    image: p.image || undefined,
    subtitle: p.price > 0 ? `৳${p.price.toLocaleString()}` : undefined,
  }));
}

const commonIconNames = ["Star", "Truck", "ShieldCheck", "Headset", "Gem", "RotateCcw", "Banknote", "Heart", "Camera", "Zap", "Sparkles"];

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

export function CustomWidgetBlockEditor({ settings, onChange }: { settings: CustomWidgetBlockSettings; onChange: (n: CustomWidgetBlockSettings) => void }) {
  const set = <K extends keyof CustomWidgetBlockSettings>(k: K, v: CustomWidgetBlockSettings[K]) => onChange({ ...settings, [k]: v });

  return (
    <div className="space-y-4">
      <FieldGrid>
        <Field label="Container Tag">
          <Select
            value={settings.tag}
            onChange={(v) => set("tag", v as CustomWidgetBlockSettings["tag"])}
            options={[
              { label: "div", value: "div" },
              { label: "section", value: "section" },
              { label: "article", value: "article" },
              { label: "aside", value: "aside" },
              { label: "nav", value: "nav" },
            ]}
          />
        </Field>
        <Field label="Text Align">
          <Select
            value={settings.align}
            onChange={(v) => set("align", v as CustomWidgetBlockSettings["align"])}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
          />
        </Field>
        <Field label="Content Gap (px)">
          <TextInput
            type="number"
            min={6}
            max={64}
            value={settings.contentGap}
            onChange={(e) => set("contentGap", Number(e.target.value) || 12)}
          />
        </Field>
      </FieldGrid>

      <FieldGrid>
        <Field label="Badge">
          <TextInput value={settings.badge || ""} onChange={(e) => set("badge", e.target.value)} />
        </Field>
        <Field label="Eyebrow">
          <TextInput value={settings.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} />
        </Field>
      </FieldGrid>

      <Field label="Title">
        <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <Field label="Description">
        <TextArea value={settings.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} />
      </Field>

      <Field label="Rich Content HTML" hint="Optional. Supports basic HTML. Scripts/event handlers are stripped at render time.">
        <TextArea value={settings.contentHtml || ""} onChange={(e) => set("contentHtml", e.target.value)} rows={6} />
      </Field>

      <FieldGrid>
        <Field label="Media Type">
          <Select
            value={settings.mediaType}
            onChange={(v) => set("mediaType", v as CustomWidgetBlockSettings["mediaType"])}
            options={[
              { label: "None", value: "none" },
              { label: "Icon", value: "icon" },
              { label: "Image", value: "image" },
            ]}
          />
        </Field>
      </FieldGrid>

      {settings.mediaType === "icon" ? (
        <FieldGrid>
          <Field label="Icon">
            <Select value={settings.icon} onChange={(v) => set("icon", v)} options={commonIconNames.map((n) => ({ label: n, value: n }))} />
          </Field>
          <Field label="Icon Size (px)">
            <TextInput type="number" min={12} max={96} value={settings.iconSize} onChange={(e) => set("iconSize", Number(e.target.value) || 22)} />
          </Field>
        </FieldGrid>
      ) : null}

      {settings.mediaType === "image" ? (
        <>
          <ImageUploader label="Widget Image" value={settings.imageUrl || ""} onChange={(url) => set("imageUrl", url)} folder="prosumer-lens/custom" />
          <Field label="Image Alt Text">
            <TextInput value={settings.imageAlt || ""} onChange={(e) => set("imageAlt", e.target.value)} />
          </Field>
        </>
      ) : null}

      <FieldGrid>
        <Field label="Primary Button Label">
          <TextInput value={settings.primaryLabel || ""} onChange={(e) => set("primaryLabel", e.target.value)} />
        </Field>
        <Field label="Primary URL">
          <TextInput value={settings.primaryUrl || ""} onChange={(e) => set("primaryUrl", e.target.value)} />
        </Field>
      </FieldGrid>

      <FieldGrid>
        <Field label="Secondary Button Label">
          <TextInput value={settings.secondaryLabel || ""} onChange={(e) => set("secondaryLabel", e.target.value)} />
        </Field>
        <Field label="Secondary URL">
          <TextInput value={settings.secondaryUrl || ""} onChange={(e) => set("secondaryUrl", e.target.value)} />
        </Field>
      </FieldGrid>

      <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
        <Toggle checked={settings.openInNewTab === true} onChange={(v) => set("openInNewTab", v)} label="Open links in new tab" />
        Open links in new tab
      </label>
    </div>
  );
}

function layoutStylePreview(layout: ContainerBlockSettings["layout"]): CSSProperties {
  if (layout.mode === "grid") {
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
      gap: `${layout.gap}px`,
    };
  }
  if (layout.mode === "flex") {
    const dir: "row" | "column" = layout.flexDirection === "column-wrap" ? "column" : "row";
    const wrap: "wrap" | "nowrap" = layout.flexDirection === "row-wrap" || layout.flexDirection === "column-wrap" ? "wrap" : "nowrap";
    return {
      display: "flex",
      flexDirection: dir,
      flexWrap: wrap,
      gap: `${layout.gap}px`,
    };
  }
  return {
    display: "flex",
    flexDirection: "column",
    gap: `${layout.gap}px`,
  };
}

function childTitle(child: Block): string {
  switch (child.type) {
    case "customWidget": return (child.settings as CustomWidgetBlockSettings).title || "Custom Widget";
    case "container": return (child.settings as ContainerBlockSettings).name || "Container";
    case "heading": return (child.settings as HeadingBlockSettings).text || "Heading";
    case "paragraph": return (child.settings as ParagraphBlockSettings).text || "Paragraph";
    case "image": return (child.settings as ImageBlockSettings).alt || "Image";
    case "button": return (child.settings as ButtonBlockSettings).label || "Button";
    case "icon": return (child.settings as IconBlockSettings).label || "Icon";
    case "video": return "Video";
    case "html": return "HTML";
    case "spacer": return "Spacer";
    case "divider": return "Divider";
    case "productGrid": return "Product Grid";
    case "productSlider": return "Product Slider";
    default: return child.type;
  }
}

export function ContainerBlockEditor({ settings, onChange }: { settings: ContainerBlockSettings; onChange: (n: ContainerBlockSettings) => void }) {
  const setLayout = <K extends keyof ContainerBlockSettings["layout"]>(key: K, value: ContainerBlockSettings["layout"][K]) => {
    onChange({
      ...settings,
      layout: {
        ...settings.layout,
        [key]: value,
      },
    });
  };

  const addChild = (type: BlockType) => {
    const child = createDefaultBlock(type, settings.blocks.length);
    onChange({
      ...settings,
      blocks: [...settings.blocks, child],
    });
  };

  const updateChild = (id: string, updater: (prev: Block) => Block) => {
    onChange({
      ...settings,
      blocks: settings.blocks.map((b) => (b.id === id ? updater(b) : b)),
    });
  };

  const removeChild = (id: string) => {
    onChange({
      ...settings,
      blocks: settings.blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })),
    });
  };

  const moveChild = (id: string, direction: "up" | "down") => {
    const sorted = [...settings.blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === id);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sorted.length - 1) return;
    const target = direction === "up" ? idx - 1 : idx + 1;
    const tmp = sorted[idx];
    sorted[idx] = sorted[target];
    sorted[target] = tmp;
    onChange({
      ...settings,
      blocks: sorted.map((b, i) => ({ ...b, order: i })),
    });
  };

  const sortedChildren = [...settings.blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <Field label="Container Name">
        <TextInput value={settings.name} onChange={(e) => onChange({ ...settings, name: e.target.value })} />
      </Field>

      <FieldGrid>
        <Field label="Layout Mode">
          <Select
            value={settings.layout.mode}
            onChange={(v) => setLayout("mode", v as ContainerBlockSettings["layout"]["mode"])}
            options={[
              { label: "Stack", value: "stack" },
              { label: "Grid", value: "grid" },
              { label: "Flex", value: "flex" },
            ]}
          />
        </Field>
        <Field label="Columns">
          <TextInput
            type="number"
            min={1}
            max={12}
            value={settings.layout.columns}
            onChange={(e) => setLayout("columns", Number(e.target.value) || 1)}
          />
        </Field>
        <Field label="Gap (px)">
          <TextInput
            type="number"
            min={0}
            max={80}
            value={settings.layout.gap}
            onChange={(e) => setLayout("gap", Number(e.target.value) || 0)}
          />
        </Field>
      </FieldGrid>

      {settings.layout.mode === "flex" && (
        <FieldGrid>
          <Field label="Flex Direction">
            <Select
              value={settings.layout.flexDirection}
              onChange={(v) => setLayout("flexDirection", v as ContainerBlockSettings["layout"]["flexDirection"])}
              options={[
                { label: "Row", value: "row" },
                { label: "Row (Wrap)", value: "row-wrap" },
                { label: "Column", value: "column" },
                { label: "Column (Wrap)", value: "column-wrap" },
              ]}
            />
          </Field>
          <Field label="Justify Content">
            <Select
              value={settings.layout.justifyContent}
              onChange={(v) => setLayout("justifyContent", v)}
              options={[
                { label: "Start", value: "flex-start" },
                { label: "Center", value: "center" },
                { label: "End", value: "flex-end" },
                { label: "Space Between", value: "space-between" },
              ]}
            />
          </Field>
        </FieldGrid>
      )}

      <div className="rounded-md border p-3" style={{ borderColor: "var(--editor-border)", background: "var(--editor-card)" }}>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>
          Inner Widgets
        </p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {BLOCK_TYPES.map((type) => {
            const meta = BLOCK_TYPE_META[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => addChild(type)}
                className="rounded border px-2 py-1 text-[10px] font-semibold transition-colors hover:opacity-80"
                style={{ borderColor: "var(--editor-border)", color: "var(--editor-accent)" }}
                title={`Add ${meta.label}`}
              >
                + {meta.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {sortedChildren.length === 0 ? (
            <p className="text-[11px]" style={{ color: "var(--editor-text-muted)" }}>No inner widgets yet.</p>
          ) : sortedChildren.map((child) => (
            <div key={child.id} className="rounded border p-2" style={{ borderColor: "var(--editor-border)", background: "var(--editor-surface)" }}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="truncate text-[11px] font-semibold" style={{ color: "var(--editor-text)" }}>{childTitle(child)}</p>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveChild(child.id, "up")} className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--editor-border)", color: "var(--editor-text-muted)" }}>Up</button>
                  <button type="button" onClick={() => moveChild(child.id, "down")} className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--editor-border)", color: "var(--editor-text-muted)" }}>Down</button>
                  <button type="button" onClick={() => removeChild(child.id)} className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--editor-border)", color: "#ef4444" }}>Delete</button>
                </div>
              </div>

              {child.type === "customWidget" && (
                <FieldGrid>
                  <Field label="Title">
                    <TextInput
                      value={(child.settings as CustomWidgetBlockSettings).title}
                      onChange={(e) => updateChild(child.id, (prev) => prev.type === "customWidget" ? { ...prev, settings: { ...prev.settings, title: e.target.value } } : prev)}
                    />
                  </Field>
                  <Field label="Description">
                    <TextInput
                      value={(child.settings as CustomWidgetBlockSettings).description || ""}
                      onChange={(e) => updateChild(child.id, (prev) => prev.type === "customWidget" ? { ...prev, settings: { ...prev.settings, description: e.target.value } } : prev)}
                    />
                  </Field>
                </FieldGrid>
              )}

              {child.type === "container" && (
                <p className="text-[10px]" style={{ color: "var(--editor-text-muted)" }}>
                  This nested container can be edited by selecting it in the canvas.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border border-dashed p-2" style={{ borderColor: "var(--editor-border)", ...layoutStylePreview(settings.layout) }}>
        <p className="text-[10px] font-medium" style={{ color: "var(--editor-text-muted)" }}>
          Layout preview: {settings.layout.mode} / {settings.layout.columns} columns / {settings.layout.gap}px gap
        </p>
      </div>
    </div>
  );
}
