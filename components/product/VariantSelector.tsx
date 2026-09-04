"use client";

// components/product/VariantSelector.tsx
import type { ProductVariant } from "@/types/product";
import {
  getVariantAttributeOptions,
  findVariantBySelection,
  isAttributeValueAvailable,
} from "@/lib/product-helpers";

export function VariantSelector({
  variants,
  selection,
  onSelect,
}: {
  variants: ProductVariant[];
  selection: Record<string, string>;
  onSelect: (variant: ProductVariant, selection: Record<string, string>) => void;
}) {
  const options = getVariantAttributeOptions(variants);
  if (!options.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {options.map((option) => (
        <div key={option.key}>
          <span className="mb-2 block text-sm font-medium text-[color:var(--titanium-300)]">
            {option.label}
          </span>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selection[option.key] === value;
              const available = isAttributeValueAvailable(variants, selection, option.key, value);

              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available}
                  aria-pressed={isSelected}
                  onClick={() => {
                    const nextSelection = { ...selection, [option.key]: value };
                    const match = findVariantBySelection(variants, nextSelection);
                    if (match) onSelect(match, nextSelection);
                  }}
                  className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                    isSelected
                      ? "border-[color:var(--brass-500)] bg-[color:var(--brass-500)]/10 text-[color:var(--brass-500)]"
                      : available
                        ? "border-[color:var(--titanium-700)] text-[color:var(--titanium-200)] hover:border-[color:var(--titanium-500)]"
                        : "cursor-not-allowed border-[color:var(--titanium-800)] text-[color:var(--titanium-700)] line-through"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
