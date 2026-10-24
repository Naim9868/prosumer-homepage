// lib/product-helpers.ts
// Pure functions only — safe to import in server and client components alike.

import type {
  Product,
  ProductVariant,
  ProductImage,
  ProductImageGroup,
  ImageGroupType,
  ProductVideo,
  Specification,
} from "@/types/product";

/* ------------------------------------------------------------------ */
/* Variant helpers                                                     */
/* ------------------------------------------------------------------ */

export type VariantMode = "none" | "single" | "multiple";

export function getVariantMode(product: Product): VariantMode {
  const count = product.variants?.length ?? 0;
  if (count === 0) return "none";
  if (count === 1) return "single";
  return "multiple";
}

/** The variant to treat as "current" before the user makes any selection. */
export function getDefaultVariant(product: Product): ProductVariant | undefined {
  if (!product.variants?.length) return undefined;
  // Prefer the first active, in-stock variant; fall back to the first variant.
  const active = product.variants.find(
    (v) => (v.status ?? "active") === "active" && v.inventory > 0
  );
  return active ?? product.variants[0];
}

/**
 * Builds the dynamic attribute-option map for the variant selector, e.g.
 * { color: ["black", "white"], storage: ["128gb", "256gb"] }, in first-seen order.
 * 
 * Handles the case where each variant has a single attribute but keys differ
 * (e.g. "10 in 1" lens kit where each lens uses a different key like
 * "type", "lensType", "model"). Groups them under a single dimension.
 */
export function getVariantAttributeOptions(
  variants: ProductVariant[]
): Array<{ key: string; label: string; values: string[] }> {
  const order: string[] = [];
  const map = new Map<string, { label: string; values: Set<string> }>();

  for (const variant of variants) {
    for (const attr of variant.attributes ?? []) {
      if (!map.has(attr.key)) {
        map.set(attr.key, { label: attr.label ?? humanize(attr.key), values: new Set() });
        order.push(attr.key);
      }
      map.get(attr.key)!.values.add(attr.value);
    }
  }

  const result = order.map((key) => ({
    key,
    label: map.get(key)!.label,
    values: Array.from(map.get(key)!.values),
  }));

  // If all variants have exactly 1 attribute but with different keys,
  // merge them into a single dimension for "Choose Your Setup" style selector
  const variantsWithSingleAttr = variants.filter(v => (v.attributes?.length ?? 0) === 1);
  if (variantsWithSingleAttr.length === variants.length && variants.length > 1 && result.length > 1) {
    const allValues = result.flatMap(r => r.values);
    const firstLabel = result[0].label;
    return [{
      key: result[0].key,
      label: firstLabel,
      values: allValues,
    }];
  }

  return result;
}

/** Finds the variant matching a full set of selected attribute values, if any. */
export function findVariantBySelection(
  variants: ProductVariant[],
  selection: Record<string, string>
): ProductVariant | undefined {
  // Check if this is a "single attribute per variant with different keys" pattern
  const variantsWithSingleAttr = variants.filter(v => (v.attributes?.length ?? 0) === 1);
  const isSingleAttrPerVariant = variantsWithSingleAttr.length === variants.length && variants.length > 1;
  
  if (isSingleAttrPerVariant && Object.keys(selection).length === 1) {
    // For single-attribute-per-variant products, match by value only (key may differ)
    const selectedValue = Object.values(selection)[0];
    return variants.find((variant) => 
      variant.attributes?.some(a => a.value === selectedValue)
    );
  }

  return variants.find((variant) => {
    const attrs = variant.attributes ?? [];
    return Object.entries(selection).every(([key, value]) =>
      attrs.some((a) => a.key === key && a.value === value)
    );
  });
}

/** Given a variant, returns its selection as a plain { key: value } map. */
export function variantToSelection(variant: ProductVariant, allVariants?: ProductVariant[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const attr of variant.attributes ?? []) out[attr.key] = attr.value;
  
  // If this is a single-attribute-per-variant product with different keys,
  // normalize to use the first variant's attribute key for consistency
  if (allVariants) {
    const variantsWithSingleAttr = allVariants.filter(v => (v.attributes?.length ?? 0) === 1);
    const isSingleAttrPerVariant = variantsWithSingleAttr.length === allVariants.length && allVariants.length > 1;
    if (isSingleAttrPerVariant && variant.attributes?.length === 1) {
      const firstKey = allVariants[0].attributes?.[0]?.key;
      if (firstKey && variant.attributes[0].key !== firstKey) {
        return { [firstKey]: variant.attributes[0].value };
      }
    }
  }
  
  return out;
}

/**
 * For a given attribute key, is `value` still reachable given everything else
 * currently selected? Used to disable/grey-out combinations that don't exist.
 */
export function isAttributeValueAvailable(
  variants: ProductVariant[],
  currentSelection: Record<string, string>,
  key: string,
  value: string
): boolean {
  // Check if this is a "single attribute per variant with different keys" pattern
  const variantsWithSingleAttr = variants.filter(v => (v.attributes?.length ?? 0) === 1);
  const isSingleAttrPerVariant = variantsWithSingleAttr.length === variants.length && variants.length > 1;
  
  if (isSingleAttrPerVariant) {
    // For single-attribute-per-variant products, any value that exists in any variant is available
    return variants.some(v => v.attributes?.some(a => a.value === value));
  }

  const trial = { ...currentSelection, [key]: value };
  return variants.some((variant) => {
    const attrs = variant.attributes ?? [];
    return Object.entries(trial).every(([k, v]) =>
      attrs.some((a) => a.key === k && a.value === v)
    );
  });
}

function humanize(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Image group helpers                                                 */
/* ------------------------------------------------------------------ */

function sortedImages(images: ProductImage[] = []): ProductImage[] {
  return [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getGroupsByType(
  product: Product,
  type: ImageGroupType
): ProductImageGroup[] {
  return (product.imageGroups ?? [])
    .filter((g) => g.type === type && g.images?.length > 0)
    .map((g) => ({ ...g, images: sortedImages(g.images) }));
}

export function hasGroupType(product: Product, type: ImageGroupType): boolean {
  return getGroupsByType(product, type).length > 0;
}

/** Ordered list of "content" section types rendered below the hero (see spec §7). */
export const IMAGE_SECTION_ORDER: ImageGroupType[] = [
  "detail",
  "features",
  "diagram",
  "package",
  "contents",
  "lifestyle",
  "usage",
  "scale",
  "dimensions",
  "infographic",
  "result",
  "installation",
  "instruction",
  "gallery",
];

/** Types that belong to the hero gallery / variant system rather than a content section. */
const GALLERY_TYPES: ImageGroupType[] = ["primary", "cover", "product", "variant"];

export function getContentImageSections(product: Product): ProductImageGroup[] {
  const groups = product.imageGroups ?? [];
  return IMAGE_SECTION_ORDER.flatMap((type) => getGroupsByType(product, type));
}

/* ------------------------------------------------------------------ */
/* Main gallery resolution (spec §5, §8)                                */
/* ------------------------------------------------------------------ */

export interface GalleryImage extends ProductImage {
  source: "variant" | "variant-group" | "product" | "thumbnail";
  type?: "image" | "video";
  videoProvider?: ProductVideo["provider"];
  videoUrl?: string;
}

/**
 * Resolves the image set for the main gallery, respecting the priority order:
 * selected variant images -> matching "variant" image groups -> general product
 * images (primary/cover/gallery/product) -> thumbnail as a last resort.
 * Videos from product.videos[] are always appended after images.
 */
export function resolveGalleryImages(
  product: Product,
  selectedVariant?: ProductVariant
): GalleryImage[] {
  let base: GalleryImage[] = [];

  // Priority 1: selected variant's own images.
  if (selectedVariant?.images?.length) {
    base = selectedVariant.images.map((url, i) => ({
      url,
      alt: `${product.name}`,
      sortOrder: i,
      source: "variant" as const,
    }));
  }

  // Priority 2: "variant" image groups whose title/description references the SKU.
  if (!base.length && selectedVariant) {
    const variantGroups = getGroupsByType(product, "variant").filter((g) =>
      [g.title, g.description].some((s) =>
        s?.toLowerCase().includes(selectedVariant.sku.toLowerCase())
      )
    );
    if (variantGroups.length) {
      base = variantGroups
        .flatMap((g) => g.images)
        .map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i, source: "variant-group" as const }));
    }
  }

  // Priority 3: general product gallery (primary, cover, gallery, product), deduped.
  if (!base.length) {
    const generalTypes: ImageGroupType[] = ["primary", "cover", "gallery", "product"];
    const seen = new Set<string>();
    for (const type of generalTypes) {
      for (const group of getGroupsByType(product, type)) {
        for (const img of group.images) {
          if (seen.has(img.url)) continue;
          seen.add(img.url);
          base.push({ ...img, source: "product" });
        }
      }
    }
  }

  // Always append videos after images so they appear in the gallery.
  const videos: GalleryImage[] = (product.videos ?? []).map((v, i) => ({
    url: v.thumbnail || v.url,
    alt: v.title || product.name,
    sortOrder: (base.length || 0) + i,
    source: "product" as const,
    type: "video" as const,
    videoProvider: v.provider,
    videoUrl: v.url,
  }));

  if (base.length || videos.length) return [...base, ...videos];

  // Priority 4: thumbnail fallback.
  if (product.thumbnail) {
    return [{ url: product.thumbnail, alt: product.name, sortOrder: 0, source: "thumbnail" }];
  }

  return [];
}

/* ------------------------------------------------------------------ */
/* Pricing (spec §28)                                                   */
/* ------------------------------------------------------------------ */

export interface PriceDisplay {
  price: number;
  compareAtPrice?: number;
  isRange: boolean;
  rangeLow?: number;
  rangeHigh?: number;
}

export function resolvePriceDisplay(
  product: Product,
  selectedVariant?: ProductVariant
): PriceDisplay | undefined {
  if (selectedVariant) {
    return {
      price: selectedVariant.price,
      compareAtPrice: selectedVariant.compareAtPrice,
      isRange: false,
    };
  }

  const { lowestPrice, highestPrice } = product;
  if (lowestPrice == null) return undefined;

  if (highestPrice != null && highestPrice !== lowestPrice) {
    return { price: lowestPrice, isRange: true, rangeLow: lowestPrice, rangeHigh: highestPrice };
  }

  return { price: lowestPrice, isRange: false };
}

export function formatPrice(amount: number, currency = "BDT", locale = "en-BD"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `৳${amount.toLocaleString()}`;
  }
}

/* ------------------------------------------------------------------ */
/* Inventory (spec §29)                                                 */
/* ------------------------------------------------------------------ */

export type StockState = "in-stock" | "low-stock" | "out-of-stock" | "unknown";

export interface StockStatus {
  state: StockState;
  quantity?: number; // present only when it's safe to show an exact number
}

export function resolveStockStatus(
  product: Product,
  selectedVariant?: ProductVariant
): StockStatus {
  if (selectedVariant) {
    const available = Math.max(0, selectedVariant.inventory - (selectedVariant.reserved ?? 0));
    if (available <= 0) return { state: "out-of-stock" };
    const threshold = product.inventorySummary?.lowStockThreshold ?? 5;
    return {
      state: available <= threshold ? "low-stock" : "in-stock",
      quantity: product.inventorySummary?.hideExactQuantity ? undefined : available,
    };
  }

  const summary = product.inventorySummary;
  if (!summary) return { state: "unknown" };

  const available = Math.max(0, summary.available - (summary.reserved ?? 0));
  if (available <= 0) return { state: "out-of-stock" };
  const threshold = summary.lowStockThreshold ?? 5;
  return {
    state: available <= threshold ? "low-stock" : "in-stock",
    quantity: summary.hideExactQuantity ? undefined : available,
  };
}

/* ------------------------------------------------------------------ */
/* Specifications / comparison (spec §19, §30)                          */
/* ------------------------------------------------------------------ */

/** Heuristic: a spec group is a "comparison" set when 2+ groups share overlapping keys. */
export function isComparisonData(product: Product): boolean {
  const groups = product.specificationGroups ?? [];
  if (groups.length < 2) return false;
  return groups.some((g) => g.specifications.some((s) => s.unit === "comparison"));
}

/** Builds aligned comparison rows across groups, matched by spec `key`, not position.
 *  Only includes groups that have comparison specs, and only specs with unit === "comparison". */
export function buildComparisonRows(product: Product) {
  const groups = (product.specificationGroups ?? [])
    .map((g) => ({
      ...g,
      specifications: g.specifications.filter((s) => s.unit === "comparison"),
    }))
    .filter((g) => g.specifications.length > 0);
  const allKeys: string[] = [];
  const seen = new Set<string>();
  for (const g of groups) {
    for (const s of g.specifications) {
      if (!seen.has(s.key)) {
        seen.add(s.key);
        allKeys.push(s.key);
      }
    }
  }

  return allKeys.map((key) => {
    const row: { key: string; label: string; values: (Specification | undefined)[] } = {
      key,
      label: groups.flatMap((g) => g.specifications).find((s) => s.key === key)?.label ?? humanize(key),
      values: groups.map((g) => g.specifications.find((s) => s.key === key)),
    };
    return row;
  });
}

/* ------------------------------------------------------------------ */
/* Variant selector shape (spec v2 §2)                                  */
/* ------------------------------------------------------------------ */

/**
 * How many distinct attribute dimensions the variants vary on (e.g. just
 * "mount" = 1, "color" + "storage" = 2). Drives whether the selector shows
 * one row of full-variant cards (shopapexel's "Choose Your Setup") or a
 * per-attribute swatch UI (Amazon-style) for multi-dimension products.
 * 
 * Handles the case where each variant has a single attribute but keys differ
 * (e.g. "10 in 1" lens kit where each lens uses a different key like
 * "type", "lensType", "model"). Treats this as a single dimension.
 */
export function getVariantDimensionCount(variants: ProductVariant[]): number {
  const options = getVariantAttributeOptions(variants);
  
  if (options.length <= 1) return options.length;
  
  // Check if this is a "single attribute per variant with different keys" pattern
  // e.g. 10 variants, each with 1 attribute, but keys are "type", "lensType", "model", etc.
  const variantsWithSingleAttr = variants.filter(v => (v.attributes?.length ?? 0) === 1);
  if (variantsWithSingleAttr.length === variants.length && variants.length > 1) {
    // All variants have exactly 1 attribute -> treat as single dimension
    return 1;
  }
  
  return options.length;
}

/** A short display label for a single-dimension variant card, e.g. "37mm Mount". */
export function getVariantCardLabel(variant: ProductVariant): string {
  return (variant.attributes ?? []).map((a) => a.value).join(" / ") || variant.sku;
}

/** First available image for a variant card thumbnail, falling back to the product thumbnail. */
export function getVariantCardImage(variant: ProductVariant, product: Product): string | undefined {
  return variant.images?.[0] ?? product.thumbnail;
}

export function getSortedSpecGroups(product: Product) {
  return [...(product.specificationGroups ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );
}

