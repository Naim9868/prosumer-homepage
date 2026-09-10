"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ProductVariant } from "@/types/checkout";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantKey?: string;
  isExpanded?: boolean;
  onToggle: () => void;
  onVariantSelect: (variantKey: string) => void;
  label?: string;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantKey,
  isExpanded = false,
  onToggle,
  onVariantSelect,
  label = "Select Variant",
}) => {
  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-2.5 py-1 text-[11px] text-foreground-muted transition hover:bg-muted"
      >
        <span>{isExpanded ? "Hide variants" : "Show variants"}</span>
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isExpanded && (
        <div className="space-y-2 px-2.5 pb-2.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-foreground">{label}</label>
            <div className="flex flex-wrap gap-1">
              {variants.map((variant) => {
                const isSelected = selectedVariantKey === variant.variantKey;
                const hasStock = variant.inventory > 0;
                const variantName = Object.values(variant.attributes).join(" - ") || variant.variantKey;

                return (
                  <button
                    type="button"
                    key={variant.variantKey}
                    onClick={() => hasStock && onVariantSelect(variant.variantKey)}
                    disabled={!hasStock}
                    className={cn(
                      "rounded-md border-2 px-2 py-1 text-[11px] font-medium transition",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : hasStock
                          ? "border-transparent bg-muted text-foreground hover:bg-muted/70"
                          : "cursor-not-allowed border-transparent bg-muted text-foreground-muted opacity-50"
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span>{variantName}</span>
                      <span className="text-[9px] opacity-75">
                        ৳{variant.price}
                        {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                          <span className="ml-0.5 text-foreground-muted line-through">৳{variant.compareAtPrice}</span>
                        )}
                        {!hasStock && <span className="ml-0.5 text-destructive">(Out of stock)</span>}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
