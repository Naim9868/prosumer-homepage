"use client";

import React from "react";
import { Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CheckoutTotals } from "@/types/checkout";
import { MIN_ORDER_FOR_FREE_DELIVERY } from "@/constants/checkout-constant";

interface PriceBreakdownProps {
  totals: CheckoutTotals;
  showFreeDelivery?: boolean;
  freeShipping?: boolean;
  freeDelivery?: boolean;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  totals,
  showFreeDelivery = false,
  freeShipping = false,
  freeDelivery = false,
}) => {
  const isFreeDelivery = freeShipping || freeDelivery || (showFreeDelivery && totals.subtotal >= MIN_ORDER_FOR_FREE_DELIVERY);

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-foreground-muted">Subtotal</span>
        <span className="text-foreground">{formatCurrency(totals.subtotal)}</span>
      </div>

      {totals.totalDiscount > 0 && (
        <div className="flex justify-between text-success">
          <span>Product Discount</span>
          <span>-{formatCurrency(totals.totalDiscount)}</span>
        </div>
      )}

      {totals.couponDiscount > 0 && (
        <div className="flex justify-between text-secondary">
          <span>Coupon Discount</span>
          <span>-{formatCurrency(totals.couponDiscount)}</span>
        </div>
      )}

      <div className="flex justify-between">
        <span className="flex items-center gap-1 text-foreground-muted">
          <Truck className="h-3 w-3 text-primary" />
          Delivery
        </span>
        <span className="text-foreground">
          {isFreeDelivery ? <span className="text-success">Free</span> : formatCurrency(totals.deliveryCharge)}
        </span>
      </div>

      {freeDelivery && !freeShipping && (
        <div className="rounded-lg border border-success/40 bg-success/10 p-2">
          <p className="flex items-center gap-2 text-xs text-success">
            <Truck size={12} />
            Free delivery applied!
          </p>
        </div>
      )}

      {freeShipping && (
        <div className="rounded-lg border border-success/40 bg-success/10 p-2">
          <p className="flex items-center gap-2 text-xs text-success">
            <Truck size={12} />
            Free shipping via coupon!
          </p>
        </div>
      )}

      <hr className="border-border" />

      <div className="flex justify-between text-lg font-bold">
        <span className="text-foreground">Total</span>
        <span className="text-primary">{formatCurrency(totals.total)}</span>
      </div>
    </div>
  );
};
