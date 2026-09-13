"use client";

import { useEffect } from "react";
import type { HeroBackgroundConfig, HeroFloatingBadge, HeroImageWidthMode, HeroMedia, HeroBorderRadius, HeroProductImageSettings } from "@/types/homepage";
import { DEFAULT_HERO_BACKGROUND_CONFIG } from "@/types/homepage";
import { Field, FieldGrid, TextInput, Select, Toggle } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { ImagePositionControls } from "@/components/homepage-builder/hero/image-position-controls";
import { BackgroundSizeControls } from "@/components/homepage-builder/hero/background-size-controls";
import { BackgroundImageEditor } from "@/components/homepage-builder/hero/background-image-editor";
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

const FLOATING_BADGE_POSITIONS: { label: string; value: HeroFloatingBadge["position"] }[] = [
  { label: "Top Left", value: "top-left" },
  { label: "Top Right", value: "top-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Right", value: "bottom-right" },
];

export function MediaEditor({ media, onChange, advanced }: { media: HeroMedia; onChange: (next: HeroMedia) => void; advanced: boolean }) {
  const set = <K extends keyof HeroMedia>(key: K, value: HeroMedia[K]) => onChange({ ...media, [key]: value });
  const setFloating = (patch: Partial<HeroFloatingBadge>) => onChange({ ...media, floatingBadge: { ...media.floatingBadge, ...patch } });
  const productItems = useProductItems();

  // Auto-initialize backgroundConfig with existing image data if not present
  useEffect(() => {
    if (!media.backgroundConfig) {
      const existingImage = media.backgroundImage || media.desktopImage || "";
      onChange({
        ...media,
        backgroundConfig: {
          ...DEFAULT_HERO_BACKGROUND_CONFIG,
          image: existingImage,
        },
      });
    }
  // Only run on mount when backgroundConfig is missing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard: ensure borderRadius is always an object (legacy data may have a number)
  const br = (media.borderRadius && typeof media.borderRadius === "object"
    ? media.borderRadius
    : { topLeft: 40, topRight: 40, bottomLeft: 40, bottomRight: 40 });
  const setBorderRadius = (patch: Partial<typeof br>) => set("borderRadius", { ...br, ...patch });

  return (
    <div className="space-y-4">
      <Field label="Media Source">
        <Select
          value={media.source}
          onChange={(v) => set("source", v as HeroMedia["source"])}
          options={[
            { label: "Upload Image", value: "upload" },
            { label: "Select Product", value: "product" },
            { label: "Product + Custom Image", value: "product-custom" },
          ]}
        />
      </Field>

      {media.source !== "upload" && (
        <Field label="Product" hint="Primary CTA will link to this product's listing">
          <CatalogPicker
            items={productItems}
            selected={media.productId ? [media.productId] : []}
            onChange={(ids) => set("productId", ids[ids.length - 1] ?? "")}
            limit={1}
            searchPlaceholder="Search products..."
          />
        </Field>
      )}

      {(media.source === "upload" || media.source === "product-custom") && (
        <>
          <FieldGrid>
            <ImageUploader
              label="Desktop Image"
              value={media.desktopImage}
              onChange={(desktopImage) => set("desktopImage", desktopImage)}
              hint="Leave empty for procedural visual"
            />
            <ImageUploader
              label="Tablet Image"
              value={media.tabletImage}
              onChange={(tabletImage) => set("tabletImage", tabletImage)}
              hint="Falls back to desktop"
            />
            <ImageUploader
              label="Mobile Image"
              value={media.mobileImage}
              onChange={(mobileImage) => set("mobileImage", mobileImage)}
              hint="Falls back to desktop"
            />
            <ImageUploader
              label="Product Image"
              value={media.productImage}
              onChange={(productImage) => set("productImage", productImage)}
              hint="Overrides the catalog image"
            />
          </FieldGrid>
          <FieldGrid>
            <ImageUploader
              label="Background Image"
              value={media.backgroundImage}
              onChange={(backgroundImage) => set("backgroundImage", backgroundImage)}
              hint="Shows behind the slide; each theme (dark/light) keeps its own image"
            />
          </FieldGrid>

          <div className="rounded-[var(--radius-sm)] border border-border p-3 space-y-3">
            <Field label="Image Width">
              <Select
                value={media.imageWidthMode}
                onChange={(v) => set("imageWidthMode", v as HeroImageWidthMode)}
                options={[
                  { label: "Auto (responsive)", value: "auto" },
                  { label: "Manual (fixed px)", value: "manual" },
                ]}
              />
            </Field>
            {media.imageWidthMode === "manual" && (
              <Field label="Width (px)" hint="Fixed width for the builder image">
                <input
                  type="number"
                  min={100}
                  max={1200}
                  step={4}
                  value={media.imageWidth}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) set("imageWidth", Math.max(100, Math.min(1200, n)));
                  }}
                  className="flex h-9 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </Field>
            )}
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
              Border Radius (px)
            </p>
            <FieldGrid>
              <Field label="Top Left">
                <TextInput
                  type="number"
                  min={0}
                  max={200}
                  value={br.topLeft}
                  onChange={(e) =>
                    setBorderRadius({ topLeft: Math.max(0, Math.min(200, Number(e.target.value))) })
                  }
                />
              </Field>
              <Field label="Top Right">
                <TextInput
                  type="number"
                  min={0}
                  max={200}
                  value={br.topRight}
                  onChange={(e) =>
                    setBorderRadius({ topRight: Math.max(0, Math.min(200, Number(e.target.value))) })
                  }
                />
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label="Bottom Left">
                <TextInput
                  type="number"
                  min={0}
                  max={200}
                  value={br.bottomLeft}
                  onChange={(e) =>
                    setBorderRadius({ bottomLeft: Math.max(0, Math.min(200, Number(e.target.value))) })
                  }
                />
              </Field>
              <Field label="Bottom Right">
                <TextInput
                  type="number"
                  min={0}
                  max={200}
                  value={br.bottomRight}
                  onChange={(e) =>
                    setBorderRadius({ bottomRight: Math.max(0, Math.min(200, Number(e.target.value))) })
                  }
                />
              </Field>
            </FieldGrid>
            <p className="text-[11px] text-foreground-muted/70">
              Auto mode keeps the image width consistent and responsive across all devices.
              Manual mode sets a fixed pixel width.
            </p>
          </div>
          <BackgroundSizeControls
            size={media.backgroundSize ?? { width: 1920, height: 1080 }}
            position={media.backgroundPosition ?? { x: 0, y: 0 }}
            onSizeChange={(backgroundSize) => onChange({ ...media, backgroundSize })}
            onPositionChange={(backgroundPosition) => onChange({ ...media, backgroundPosition })}
          />

          {/* Advanced Background Image Editor */}
          <div className="rounded-[var(--radius-md)] border border-primary/30 bg-primary/5 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-primary">Background Image Config</p>
            <BackgroundImageEditor
              config={media.backgroundConfig ?? DEFAULT_HERO_BACKGROUND_CONFIG}
              onChange={(backgroundConfig: HeroBackgroundConfig) => onChange({ ...media, backgroundConfig })}
            />
          </div>
        </>
      )}

      {advanced && <ImagePositionControls position={media.position} onChange={(position) => onChange({ ...media, position })} />}

      <div className="space-y-3 rounded-[var(--radius-md)] border border-border p-3">
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={media.floatingBadge.enabled} onChange={(v) => setFloating({ enabled: v })} label="Floating badge" />
          Floating Badge
        </label>
        {media.floatingBadge.enabled && (
          <FieldGrid>
            <Field label="Title">
              <TextInput value={media.floatingBadge.title} onChange={(e) => setFloating({ title: e.target.value })} />
            </Field>
            <Field label="Subtitle">
              <TextInput value={media.floatingBadge.subtitle} onChange={(e) => setFloating({ subtitle: e.target.value })} />
            </Field>
            <Field label="Position">
              <Select value={media.floatingBadge.position} onChange={(v) => setFloating({ position: v as HeroFloatingBadge["position"] })} options={FLOATING_BADGE_POSITIONS} />
            </Field>
          </FieldGrid>
        )}
      </div>

      {/* ── Product Image Settings ─────────────────────────── */}
      {media.source !== "upload" && (
        <ProductImageSettingsEditor
          settings={media.productImageSettings}
          onChange={(productImageSettings) => onChange({ ...media, productImageSettings })}
          productUrl={media.productId ? `/products/${media.productId}` : ""}
        />
      )}
    </div>
  );
}

/* ── Product Image Settings sub-editor ─────────────────────────── */

const BORDER_STYLES = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "None", value: "none" },
] as const;

const BUTTON_STYLES = [
  { label: "Filled", value: "filled" },
  { label: "Outline", value: "outline" },
  { label: "Ghost", value: "ghost" },
] as const;

const DEFAULT_PRODUCT_IMG: HeroProductImageSettings = {
  enabled: false,
  height: 200,
  width: 200,
  offsetX: 0,
  offsetY: 0,
  border: { width: 0, color: "#ffffff", style: "solid" },
  borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 12, bottomRight: 12 },
  shadow: 0.3,
  button: {
    enabled: false,
    text: "View Product",
    url: "",
    style: "filled",
    backgroundColor: "",
    textColor: "",
    borderRadius: 9999,
  },
};

function ProductImageSettingsEditor({
  settings,
  onChange,
  productUrl,
}: {
  settings: HeroProductImageSettings;
  onChange: (next: HeroProductImageSettings) => void;
  productUrl: string;
}) {
  const s = { ...DEFAULT_PRODUCT_IMG, ...settings };
  const patch = (partial: Partial<HeroProductImageSettings>) => onChange({ ...s, ...partial });
  const patchBorder = (partial: Partial<typeof s.border>) => patch({ border: { ...s.border, ...partial } });
  const patchBr = (partial: Partial<typeof s.borderRadius>) => patch({ borderRadius: { ...s.borderRadius, ...partial } });
  const patchBtn = (partial: Partial<typeof s.button>) => patch({ button: { ...s.button, ...partial } });

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-border p-3">
      <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
        <Toggle
          checked={s.enabled}
          onChange={(enabled) => patch({ enabled })}
          label="Product image overlay"
        />
        Product Image
      </label>

      {s.enabled && (
        <>
          {/* Size */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Size (px)</p>
          <FieldGrid>
            <Field label="Width">
              <TextInput
                type="number"
                min={40}
                max={800}
                value={s.width}
                onChange={(e) => patch({ width: Math.max(40, Math.min(800, Number(e.target.value))) })}
              />
            </Field>
            <Field label="Height">
              <TextInput
                type="number"
                min={40}
                max={800}
                value={s.height}
                onChange={(e) => patch({ height: Math.max(40, Math.min(800, Number(e.target.value))) })}
              />
            </Field>
          </FieldGrid>

          {/* Position */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Position Offset (px)</p>
          <FieldGrid>
            <Field label="X (left/right)">
              <TextInput
                type="number"
                min={-400}
                max={400}
                value={s.offsetX}
                onChange={(e) => patch({ offsetX: Math.max(-400, Math.min(400, Number(e.target.value))) })}
              />
            </Field>
            <Field label="Y (up/down)">
              <TextInput
                type="number"
                min={-400}
                max={400}
                value={s.offsetY}
                onChange={(e) => patch({ offsetY: Math.max(-400, Math.min(400, Number(e.target.value))) })}
              />
            </Field>
          </FieldGrid>

          {/* Shadow */}
          <Field label={`Shadow (${Math.round(s.shadow * 100)}%)`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={s.shadow}
              onChange={(e) => patch({ shadow: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </Field>

          {/* Border */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Border</p>
          <FieldGrid>
            <Field label="Width (px)">
              <TextInput
                type="number"
                min={0}
                max={20}
                value={s.border.width}
                onChange={(e) => patchBorder({ width: Math.max(0, Math.min(20, Number(e.target.value))) })}
              />
            </Field>
            <Field label="Style">
              <Select
                value={s.border.style}
                onChange={(v) => patchBorder({ style: v as HeroProductImageSettings["border"]["style"] })}
                options={[...BORDER_STYLES]}
              />
            </Field>
          </FieldGrid>
          <Field label="Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={s.border.color}
                onChange={(e) => patchBorder({ color: e.target.value })}
                className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent"
              />
              <TextInput value={s.border.color} onChange={(e) => patchBorder({ color: e.target.value })} />
            </div>
          </Field>

          {/* Border Radius */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Border Radius (px)</p>
          <FieldGrid>
            <Field label="Top Left">
              <TextInput
                type="number"
                min={0}
                max={200}
                value={s.borderRadius.topLeft}
                onChange={(e) => patchBr({ topLeft: Math.max(0, Math.min(200, Number(e.target.value))) })}
              />
            </Field>
            <Field label="Top Right">
              <TextInput
                type="number"
                min={0}
                max={200}
                value={s.borderRadius.topRight}
                onChange={(e) => patchBr({ topRight: Math.max(0, Math.min(200, Number(e.target.value))) })}
              />
            </Field>
          </FieldGrid>
          <FieldGrid>
            <Field label="Bottom Left">
              <TextInput
                type="number"
                min={0}
                max={200}
                value={s.borderRadius.bottomLeft}
                onChange={(e) => patchBr({ bottomLeft: Math.max(0, Math.min(200, Number(e.target.value))) })}
              />
            </Field>
            <Field label="Bottom Right">
              <TextInput
                type="number"
                min={0}
                max={200}
                value={s.borderRadius.bottomRight}
                onChange={(e) => patchBr({ bottomRight: Math.max(0, Math.min(200, Number(e.target.value))) })}
              />
            </Field>
          </FieldGrid>

          {/* Button */}
          <div className="rounded-[var(--radius-sm)] border border-border p-3 space-y-3">
            <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
              <Toggle
                checked={s.button.enabled}
                onChange={(enabled) => patchBtn({ enabled })}
                label="Product link button"
              />
              Link Button
            </label>
            {s.button.enabled && (
              <>
                <Field label="Button Text">
                  <TextInput value={s.button.text} onChange={(e) => patchBtn({ text: e.target.value })} />
                </Field>
                <Field label="Link URL" hint="Leave empty to use product page">
                  <TextInput
                    value={s.button.url}
                    onChange={(e) => patchBtn({ url: e.target.value })}
                    placeholder={productUrl || "/products/..."}
                  />
                </Field>
                <Field label="Button Style">
                  <Select
                    value={s.button.style}
                    onChange={(v) => patchBtn({ style: v as HeroProductImageSettings["button"]["style"] })}
                    options={[...BUTTON_STYLES]}
                  />
                </Field>
                <FieldGrid>
                  <Field label="Background">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={s.button.backgroundColor || "#ffffff"}
                        onChange={(e) => patchBtn({ backgroundColor: e.target.value })}
                        className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent"
                      />
                      <TextInput
                        value={s.button.backgroundColor}
                        onChange={(e) => patchBtn({ backgroundColor: e.target.value })}
                        placeholder="auto"
                      />
                    </div>
                  </Field>
                  <Field label="Text Color">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={s.button.textColor || "#000000"}
                        onChange={(e) => patchBtn({ textColor: e.target.value })}
                        className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent"
                      />
                      <TextInput
                        value={s.button.textColor}
                        onChange={(e) => patchBtn({ textColor: e.target.value })}
                        placeholder="auto"
                      />
                    </div>
                  </Field>
                </FieldGrid>
                <Field label="Button Radius (px)">
                  <TextInput
                    type="number"
                    min={0}
                    max={9999}
                    value={s.button.borderRadius}
                    onChange={(e) => patchBtn({ borderRadius: Math.max(0, Math.min(9999, Number(e.target.value))) })}
                  />
                </Field>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
