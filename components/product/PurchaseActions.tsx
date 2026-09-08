"use client";

// components/product/PurchaseActions.tsx
import { useState } from "react";
import type { ProductVariant, Product } from "@/types/product";
import type { StockStatus } from "@/lib/product-helpers";

export function PurchaseActions({
  product,
  selectedVariant,
  stock,
  onAddToCart,
  onBuyNow,
}: {
  product: Product;
  selectedVariant?: ProductVariant;
  stock: StockStatus;
  /** Wire these to your existing cart mutation / checkout redirect. */
  onAddToCart?: (payload: { productId: string; sku?: string; quantity: number }) => void;
  onBuyNow?: (payload: { productId: string; sku?: string; quantity: number }) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const disabled = stock.state === "out-of-stock";
  const max = stock.quantity ?? 99;

  const payload = { productId: product._id, sku: selectedVariant?.sku, quantity };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-[color:var(--titanium-700)]">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="px-3 py-2 text-[color:var(--titanium-300)] disabled:opacity-30"
            disabled={disabled || quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium text-[color:var(--titanium-100)]" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="px-3 py-2 text-[color:var(--titanium-300)] disabled:opacity-30"
            disabled={disabled || quantity >= max}
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAddToCart?.(payload)}
          className="hover-fill-btn hover-fill-btn--primary flex-1 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="btn-fill" />
          <span className="btn-text">Add to cart</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onBuyNow?.(payload)}
          className="hover-fill-btn hover-fill-btn--secondary flex-1 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="btn-fill" />
          <span className="btn-text">Buy now</span>
        </button>
      </div>
    </div>
  );
}
