"use client";

// components/product/VariantCardSelector.tsx
// Used when variants vary on exactly one attribute dimension — each full
// variant becomes one card (thumbnail, label, price), matching the
// reference site's "Choose Your Setup" pattern. For multi-dimension
// products (color + storage, etc.) VariantSelector's per-attribute
// swatches are used instead — see ProductExperience.

import type { ProductVariant, Product } from "@/types/product";
import { formatPrice, getVariantCardImage, getVariantCardLabel } from "@/lib/product-helpers";

export function VariantCardSelector({
  product,
  variants,
  selectedSku,
  onSelect,
}: {
  product: Product;
  variants: ProductVariant[];
  selectedSku?: string;
  onSelect: (variant: ProductVariant) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {variants.map((variant) => {
        const isSelected = variant.sku === selectedSku;
        const image = getVariantCardImage(variant, product);
        const outOfStock = variant.inventory - (variant.reserved ?? 0) <= 0;

        return (
          <button
            key={variant.sku}
            type="button"
            aria-pressed={isSelected}
            disabled={outOfStock}
            onClick={() => onSelect(variant)}
            className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
              isSelected
                ? "border-[color:var(--brass-500)] bg-[color:var(--brass-500)]/10"
                : "border-[color:var(--titanium-700)] hover:border-[color:var(--titanium-500)]"
            } ${outOfStock ? "cursor-not-allowed opacity-40" : ""}`}
          >
            {image && (
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[color:var(--surface-800)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-cover" />
              </span>
            )}
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-[color:var(--titanium-100)]">
                {getVariantCardLabel(variant)}
              </span>
              {outOfStock && (
                <span className="text-xs text-[color:var(--titanium-500)]">Out of stock</span>
              )}
            </span>
            <span className="text-sm font-medium text-[color:var(--titanium-200)]">
              {formatPrice(variant.price)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
