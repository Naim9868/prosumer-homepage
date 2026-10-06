"use client";

import React from "react";
import { Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CheckoutTotals } from "@/types/checkout";

interface PriceBreakdownProps {
  totals: CheckoutTotals;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ totals }) => {
  return (
    <div className="space-y-1.5 text-xs sm:text-sm">
      <div className="flex justify-between">
        <span className="text-foreground-muted">Original Price</span>
        <span className="text-foreground">{formatCurrency(totals.originalTotal)}</span>
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
        <span className="text-foreground-muted">Subtotal</span>
        <span className="text-foreground">{formatCurrency(totals.subtotal)}</span>
      </div>

      <div className="flex justify-between">
        <span className="flex items-center gap-1 text-foreground-muted">
          <Truck className="h-3 w-3 text-primary" />
          Delivery
        </span>
        <span className="text-foreground">{formatCurrency(totals.deliveryCharge)}</span>
      </div>

      <hr className="border-border" />

      <div className="flex justify-between text-base font-bold">
        <span className="text-foreground">Total</span>
        <span className="text-primary">{formatCurrency(totals.total)}</span>
      </div>
    </div>
  );
};
