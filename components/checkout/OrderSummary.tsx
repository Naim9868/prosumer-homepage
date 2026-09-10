"use client";

import React, { useMemo } from "react";
import { Package, CheckCircle } from "lucide-react";
import type { CheckoutTotals, OrderItem, Coupon } from "@/types/checkout";
import { CartItems } from "./CartItems";
import { CouponSection } from "./CouponSection";
import { PriceBreakdown } from "./PriceBreakdown";
import { MIN_ORDER_FOR_FREE_DELIVERY } from "@/constants/checkout-constant";

interface OrderSummaryProps {
  items: OrderItem[];
  totals: CheckoutTotals;
  validatedItems: OrderItem[];
  isValidating: boolean;
  couponCode: string;
  couponInput: string;
  isApplyingCoupon: boolean;
  couponMessage: string | null;
  appliedCoupon: Coupon | null;
  couponFreeShipping: boolean;
  availableCoupons?: Coupon[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onVariantChange: (itemId: string, variantKey: string) => void;
  onRemove: (itemId: string) => void;
  onCouponInputChange: (value: string) => void;
  onApplyCoupon: () => Promise<void>;
  onRemoveCoupon: () => Promise<void>;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  totals,
  validatedItems,
  isValidating,
  couponCode,
  couponInput,
  isApplyingCoupon,
  couponMessage,
  appliedCoupon,
  couponFreeShipping,
  availableCoupons,
  onQuantityChange,
  onVariantChange,
  onRemove,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const displayItems = useMemo(() => {
    if (validatedItems.length === 0) return items;
    const validatedMap = new Map<string, OrderItem>();
    validatedItems.forEach((v: OrderItem) => {
      const key = `${v.productId || v.id}-${v.variantKey || "default"}`;
      validatedMap.set(key, v);
    });
    return items.map((item) => {
      const key = `${item.productId || item.id}-${item.variantKey || "default"}`;
      const validated = validatedMap.get(key);
      if (validated) {
        return {
          ...item,
          price: validated.price,
          maxQuantity: validated.maxQuantity,
          inventory: validated.inventory,
          variants: validated.variants,
          sku: validated.sku,
          variantName: validated.variantName,
          image: validated.image || item.image,
          name: validated.name || item.name,
          brand: validated.brand || item.brand,
          category: validated.category || item.category,
          slug: validated.slug || item.slug,
          selectedVariantKey: item.selectedVariantKey || validated.selectedVariantKey,
        };
      }
      return item;
    });
  }, [items, validatedItems]);

  const showFreeDelivery = totals.subtotal >= MIN_ORDER_FOR_FREE_DELIVERY;

  return (
    <div className="sticky top-6 rounded-[var(--radius-lg)] bg-card p-3 shadow-lg sm:p-4">
      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
        <Package className="h-4 w-4 text-primary" />
        Order Summary ({displayItems.length})
      </h3>

      {isValidating && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-primary/10 p-2 text-primary">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs">Validating cart...</span>
        </div>
      )}

      <CartItems
        items={displayItems}
        onQuantityChange={onQuantityChange}
        onVariantChange={onVariantChange}
        onRemove={onRemove}
      />

      <hr className="my-4 border-border" />

      <CouponSection
        couponCode={couponCode}
        couponInput={couponInput}
        isApplyingCoupon={isApplyingCoupon}
        couponMessage={couponMessage}
        appliedCoupon={appliedCoupon}
        availableCoupons={availableCoupons}
        onCouponInputChange={onCouponInputChange}
        onApplyCoupon={onApplyCoupon}
        onRemoveCoupon={onRemoveCoupon}
      />

      <hr className="my-4 border-border" />

      <PriceBreakdown
        totals={totals}
        showFreeDelivery={showFreeDelivery}
        freeShipping={couponFreeShipping}
        freeDelivery={couponFreeShipping}
      />

      {showFreeDelivery && !couponFreeShipping && (
        <div className="mt-3 rounded-xl border border-success/40 bg-success/10 p-3">
          <p className="flex items-center gap-2 text-xs text-success">
            <CheckCircle size={14} />
            Free delivery on orders above ৳5,000
          </p>
        </div>
      )}
    </div>
  );
};
