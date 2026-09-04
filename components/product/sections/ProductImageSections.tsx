// components/product/sections/ProductImageSections.tsx
// v2: features/lifestyle/usage/diagram/scale/dimensions -> AlternatingBlocks,
// installation/instruction -> HowToUse, result -> ShotOnGallery,
// contents -> InTheBox. This file now only covers the remaining grid-style
// types (detail, package, infographic) that don't need bespoke layout.
import type { Product, ImageGroupType } from "@/types/product";
import { getGridGroups } from "@/lib/section-config";
import { ImageGroupSection } from "./ImageGroupSection";

const LAYOUT: Partial<Record<ImageGroupType, "grid" | "stacked" | "wide">> = {
  infographic: "wide",
};

export function ProductImageSections({ product }: { product: Product }) {
  const entries = getGridGroups(product);
  if (!entries.length) return null;

  return (
    <div className="flex flex-col gap-14">
      {entries.map(({ type, group }, i) => (
        <ImageGroupSection
          key={`${type}-${i}`}
          group={group}
          productName={product.name}
          layout={LAYOUT[type] ?? "grid"}
        />
      ))}
    </div>
  );
}
