"use client";

// components/product/ProductExperience.tsx
// This is the one piece of client-side state in the page: which variant is
// selected. Everything that needs to react to it (gallery, price, SKU,
// inventory, purchase actions) lives below this component so a variant
// change never triggers a full page reload or refetch.

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import {
  getDefaultVariant,
  getVariantDimensionCount,
  getVariantMode,
  resolveGalleryImages,
  resolvePriceDisplay,
  resolveStockStatus,
  variantToSelection,
} from "@/lib/product-helpers";
import { ProductGallery } from "./ProductGallery";
import { VariantSelector } from "./VariantSelector";
import { VariantCardSelector } from "./VariantCardSelector";
import { PurchaseActions } from "./PurchaseActions";
import { PriceDisplay } from "./ui/PriceDisplay";
import { StockPill } from "./ui/BadgesAndStock";
import { ProductInfoHeader } from "./ProductInfoHeader";

export function ProductExperience({ product }: { product: Product }) {
  const mode = getVariantMode(product);
  const [selectedVariant, setSelectedVariant] = useState(() => getDefaultVariant(product));
  const [selection, setSelection] = useState(() =>
    selectedVariant ? variantToSelection(selectedVariant) : {}
  );

  const images = useMemo(
    () => resolveGalleryImages(product, selectedVariant),
    [product, selectedVariant]
  );
  const price = resolvePriceDisplay(product, selectedVariant);
  const stock = resolveStockStatus(product, selectedVariant);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <ProductGallery images={images} productName={product.name} />

      <div className="flex flex-col gap-5">
        <ProductInfoHeader product={product} />

        <PriceDisplay data={price} />

        <StockPill status={stock} />

        {mode === "multiple" && (
          getVariantDimensionCount(product.variants) === 1 ? (
            // Single attribute dimension (e.g. just "mount") — shopapexel-style
            // full-variant cards with thumbnail, label, and price.
            <VariantCardSelector
              product={product}
              variants={product.variants}
              selectedSku={selectedVariant?.sku}
              onSelect={(variant) => {
                setSelectedVariant(variant);
                setSelection(variantToSelection(variant));
              }}
            />
          ) : (
            // Multiple dimensions (e.g. color + storage) — per-attribute swatches.
            <VariantSelector
              variants={product.variants}
              selection={selection}
              onSelect={(variant, nextSelection) => {
                setSelectedVariant(variant);
                setSelection(nextSelection);
              }}
            />
          )
        )}

        <PurchaseActions product={product} selectedVariant={selectedVariant} stock={stock} />
      </div>
    </div>
  );
}
