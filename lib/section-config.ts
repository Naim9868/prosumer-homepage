// lib/section-config.ts
import type { Product, ImageGroupType, ProductImageGroup } from "@/types/product";
import { getGroupsByType, isComparisonData, getSortedSpecGroups } from "./product-helpers";

/** Types rendered as alternating full-bleed image+text blocks (spec v2 §4-5). */
export const ALTERNATING_TYPES: ImageGroupType[] = [
  "features",
  "lifestyle",
  "usage",
  "diagram",
  "scale",
  "dimensions",
];

export const ALTERNATING_HEADINGS: Partial<Record<ImageGroupType, string>> = {
  features: "What makes it great",
  usage: "In action",
  lifestyle: "In action",
  diagram: "How it works",
  scale: "Size & dimensions",
  dimensions: "Size & dimensions",
};

/** Types combined into the sequential "How to use" section. */
export const HOW_TO_USE_TYPES: ImageGroupType[] = ["installation", "instruction"];

/** Types that use the plain grid ImageGroupSection with no special treatment. */
export const GRID_TYPES: ImageGroupType[] = ["detail", "package", "infographic"];

export function getAlternatingGroups(product: Product) {
  return ALTERNATING_TYPES.flatMap((type) =>
    getGroupsByType(product, type).map((group) => ({ type, group }))
  );
}

export function getHowToUseGroups(product: Product) {
  return HOW_TO_USE_TYPES.flatMap((type) =>
    getGroupsByType(product, type).map((group) => ({ type, group }))
  );
}

export function getGridGroups(product: Product) {
  return GRID_TYPES.flatMap((type) =>
    getGroupsByType(product, type).map((group) => ({ type, group }))
  );
}

export function getResultGroups(product: Product) {
  return getGroupsByType(product, "result");
}

export function getContentsGroups(product: Product) {
  return getGroupsByType(product, "contents");
}

/**
 * Computes which top-level sections actually have data, in page order, for
 * the sticky anchor nav. Only sections with real content appear.
 */
export function getPresentSections(product: Product): Array<{ id: string; label: string }> {
  const sections: Array<{ id: string; label: string }> = [];

  if (getAlternatingGroups(product).length) sections.push({ id: "features", label: "Features" });
  if (getHowToUseGroups(product).length) sections.push({ id: "how-to-use", label: "How to use" });
  if (getResultGroups(product).length) sections.push({ id: "shot-on", label: "Photos" });
  if (product.description?.trim()) sections.push({ id: "description", label: "Description" });
  if (isComparisonData(product)) {
    sections.push({ id: "comparison", label: "Compare" });
  } else if (getSortedSpecGroups(product).length) {
    sections.push({ id: "specifications", label: "Specs" });
  }
  if (getContentsGroups(product).length) sections.push({ id: "in-the-box", label: "In the box" });
  if (product.videos?.length) sections.push({ id: "videos", label: "Videos" });
  sections.push({ id: "related", label: "Related" });
  if (product.ratingCount && product.ratingCount > 0) sections.push({ id: "reviews", label: "Reviews" });

  return sections;
}
