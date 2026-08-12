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
      <div className="mt-4 space-y-2">
        {appliedCoupon && (
          <div className="rounded-lg border border-success/40 bg-success/10 p-2">
            <p className="flex items-center gap-2 text-xs text-success">
              <CheckCircle size={14} />
              Coupon applied: <strong>{appliedCoupon.code}</strong>
              {appliedCoupon.description && ` - ${appliedCoupon.description}`}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onRemoveCoupon}
          className="flex items-center gap-1 text-xs text-destructive transition hover:text-destructive/80"
        >
          <XCircle size={12} /> Remove coupon
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {!showInput ? (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="flex w-full items-center justify-between px-1 py-1.5 text-sm text-foreground-muted transition hover:text-primary"
        >
          <span className="flex items-center gap-2">
            <Tag size={14} />
            Have a coupon? Click to apply
          </span>
          <ChevronDown size={14} />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="mb-1 flex items-center gap-1 text-xs text-foreground-muted transition hover:text-foreground"
          >
            <ChevronUp size={12} /> Hide coupon
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => onCouponInputChange(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              autoFocus
              className="w-full flex-1 rounded-xl border border-border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={isApplyingCoupon || !couponInput.trim()}
              className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag size={14} />}
              Apply
            </button>
          </div>

          {couponMessage && (
            <p className={isErrorMessage ? "text-xs text-destructive" : "text-xs text-success"}>
              {isErrorMessage ? <XCircle size={14} className="mr-1 inline" /> : <CheckCircle size={14} className="mr-1 inline" />}
              {couponMessage}
            </p>
          )}

          {availableCoupons.length > 0 && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-2">
              <p className="flex flex-wrap items-center gap-2 text-xs text-primary">
                <Tag size={12} />
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
