"use client";

import React, { useState } from "react";
import { Tag, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { Coupon } from "@/types/checkout";

interface CouponSectionProps {
  couponCode: string;
  couponInput: string;
  isApplyingCoupon: boolean;
  couponMessage: string | null;
  appliedCoupon: Coupon | null;
  availableCoupons?: Coupon[];
  onCouponInputChange: (value: string) => void;
  onApplyCoupon: () => Promise<void>;
  onRemoveCoupon: () => Promise<void>;
}

export const CouponSection: React.FC<CouponSectionProps> = ({
  couponCode,
  couponInput,
  isApplyingCoupon,
  couponMessage,
  appliedCoupon,
  availableCoupons = [],
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [showInput, setShowInput] = useState(false);
  const isCouponActive = !!couponCode;
  const isErrorMessage =
    couponMessage?.includes("Invalid") ||
    couponMessage?.includes("Error") ||
    couponMessage?.includes("not");

  if (isCouponActive || appliedCoupon) {
    return (
      <div className="mt-2 space-y-1.5">
        {appliedCoupon && (
          <div className="rounded-md border border-success/40 bg-success/10 p-1.5">
            <p className="flex items-center gap-1.5 text-[11px] text-success">
              <CheckCircle size={12} />
              Coupon applied: <strong>{appliedCoupon.code}</strong>
              {appliedCoupon.description && ` - ${appliedCoupon.description}`}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onRemoveCoupon}
          className="flex items-center gap-1 text-[11px] text-destructive transition hover:text-destructive/80"
        >
          <XCircle size={10} /> Remove coupon
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      {!showInput ? (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="flex w-full items-center justify-between px-1 py-1 text-xs text-foreground-muted transition hover:text-primary"
        >
          <span className="flex items-center gap-1.5">
            <Tag size={12} />
            Have a coupon? Click to apply
          </span>
          <ChevronDown size={12} />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="mb-0.5 flex items-center gap-1 text-[11px] text-foreground-muted transition hover:text-foreground"
          >
            <ChevronUp size={10} /> Hide coupon
          </button>

          <div className="flex gap-1.5">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => onCouponInputChange(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              autoFocus
              className="w-full flex-1 rounded-lg border border-border bg-background-elevated px-2.5 py-1.5 text-xs text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={isApplyingCoupon || !couponInput.trim()}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {isApplyingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : <Tag size={10} />}
              Apply
            </button>
          </div>

          {couponMessage && (
            <p className={isErrorMessage ? "text-[11px] text-destructive" : "text-[11px] text-success"}>
              {isErrorMessage ? <XCircle size={10} className="mr-0.5 inline" /> : <CheckCircle size={10} className="mr-0.5 inline" />}
              {couponMessage}
            </p>
          )}

          {availableCoupons.length > 0 && (
            <div className="rounded-md border border-primary/30 bg-primary/10 p-1.5">
              <p className="flex flex-wrap items-center gap-1 text-[11px] text-primary">
                <Tag size={10} />
                Available:{" "}
                {availableCoupons.map((c, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    <button
                      type="button"
                      onClick={() => {
                        onCouponInputChange(c.code);
                        setTimeout(() => onApplyCoupon(), 100);
                      }}
                      className="font-medium underline hover:no-underline"
                    >
                      {c.code}
                    </button>
                    ({c.description})
                  </span>
                ))}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
