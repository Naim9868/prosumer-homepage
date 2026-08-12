"use client";

import type { HeroFloatingBadge, HeroMedia } from "@/types/homepage";
import { Field, FieldGrid, TextInput, Select, Toggle } from "@/components/homepage-builder/fields";
import { CatalogPicker, type CatalogPickerItem } from "@/components/homepage-builder/catalog-picker";
import { ImagePositionControls } from "@/components/homepage-builder/hero/image-position-controls";
import { BackgroundSizeControls } from "@/components/homepage-builder/hero/background-size-controls";
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
              hint="Shows behind the slide"
            />
            <ImageUploader
              label="Background Image (Dark)"
              value={media.backgroundImageDark ?? ""}
              onChange={(backgroundImageDark) => set("backgroundImageDark", backgroundImageDark)}
              hint="Used for the dark theme"
            />
          </FieldGrid>
          <BackgroundSizeControls
            size={media.backgroundSize ?? { width: 100, height: 100 }}
            onChange={(backgroundSize) => onChange({ ...media, backgroundSize })}
          />
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
    </div>
  );
}
