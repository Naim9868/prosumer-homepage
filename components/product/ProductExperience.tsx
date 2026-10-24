"use client";

// components/product/ProductExperience.tsx
// This is the one piece of client-side state in the page: which variant is
// selected. Everything that needs to react to it (gallery, price, SKU,
// inventory, purchase actions) lives below this component so a variant
// change never triggers a full page reload or refetch.

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { ShareButton } from "./ui/ShareButton";
import { useCartContext } from "@/app/context/CartContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useGuestInfo } from "@/app/context/GuestInfoContext";
import GuestInfoModal from "@/components/GuestInfoModal";
import { trackViewContent } from "@/lib/analytics/events";

export function ProductExperience({ product }: { product: Product }) {
  const mode = getVariantMode(product);
  const [selectedVariant, setSelectedVariant] = useState(() => getDefaultVariant(product));
  const [selection, setSelection] = useState(() =>
    selectedVariant ? variantToSelection(selectedVariant, product.variants) : {}
  );
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(null);

  const { addToCart } = useCartContext();
  const { openCartModal } = useCartModalContext();
  const { hasGuestInfo } = useGuestInfo();

  const images = useMemo(
    () => resolveGalleryImages(product, selectedVariant),
    [product, selectedVariant]
  );
  const price = resolvePriceDisplay(product, selectedVariant);
  const stock = resolveStockStatus(product, selectedVariant);

  // Meta ViewContent / GA4 view_item — deduplicated inside trackViewContent so
  // StrictMode re-renders and variant changes can never produce duplicates.
  useEffect(() => {
    trackViewContent({ product, variant: selectedVariant });
  }, [product, selectedVariant]);

  const findVariant = useCallback(
    (sku?: string) => {
      if (!sku) return selectedVariant;
      return product.variants.find((v) => v.sku === sku) || selectedVariant;
    },
    [product.variants, selectedVariant]
  );

  const doAddToCart = useCallback(
    async (sku?: string, quantity = 1) => {
      const variant = findVariant(sku);
      const success = await addToCart(product, variant, quantity);
      if (success) openCartModal();
    },
    [findVariant, addToCart, product, openCartModal]
  );

  const doBuyNow = useCallback(
    async (sku?: string, quantity = 1) => {
      const variant = findVariant(sku);
      const success = await addToCart(product, variant, quantity);
      if (success) {
        window.location.href = "/checkout";
      }
    },
    [findVariant, addToCart, product]
  );

  const handleAddToCart = useCallback(
    (payload: { productId: string; sku?: string; quantity: number }) => {
      if (!hasGuestInfo) {
        setPendingAction("cart");
        setShowGuestModal(true);
        return;
      }
      doAddToCart(payload.sku, payload.quantity);
    },
    [hasGuestInfo, doAddToCart]
  );

  const handleBuyNow = useCallback(
    (payload: { productId: string; sku?: string; quantity: number }) => {
      doBuyNow(payload.sku, payload.quantity);
    },
    [doBuyNow]
  );

  const handleGuestConfirm = useCallback(async () => {
    setShowGuestModal(false);
    if (pendingAction === "cart") {
      await doAddToCart();
    }
    setPendingAction(null);
  }, [pendingAction, doAddToCart]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <ProductGallery images={images} productName={product.name} />

      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <ProductInfoHeader product={product} />
          </div>
          <ShareButton slug={product.slug} productName={product.name} className="mt-1 flex-shrink-0" />
        </div>

        <PriceDisplay data={price} />

        <StockPill status={stock} />

        {mode === "multiple" && (
          getVariantDimensionCount(product.variants) === 1 ? (
            <VariantCardSelector
              product={product}
              variants={product.variants}
              selectedSku={selectedVariant?.sku}
              onSelect={(variant) => {
                setSelectedVariant(variant);
                setSelection(variantToSelection(variant, product.variants));
              }}
            />
          ) : (
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

        <PurchaseActions
          product={product}
          selectedVariant={selectedVariant}
          stock={stock}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      </div>

      {showGuestModal && (
        <GuestInfoModal
          onClose={() => {
            setShowGuestModal(false);
            setPendingAction(null);
          }}
          onConfirm={handleGuestConfirm}
        />
      )}
    </div>
  );
}
