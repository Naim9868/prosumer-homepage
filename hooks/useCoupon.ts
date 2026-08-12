"use client";
import { useState, useCallback } from "react";
import type { Coupon } from "@/types/checkout";
import { applyCoupon as applyCouponService, removeCoupon as removeCouponService } from "@/services/coupon.service";

interface CouponContext {
  subtotal: number;
  userId?: string;
  productIds?: string[];
  categories?: string[];
  lines?: Array<{ productId: string; lineTotal: number }>;
}

interface UseCouponReturn {
  couponCode: string;
  couponInput: string;
  isApplyingCoupon: boolean;
  couponMessage: string | null;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  freeShipping: boolean;
  setCouponInput: (value: string) => void;
  applyCoupon: (context?: CouponContext) => Promise<void>;
  removeCoupon: () => Promise<void>;
  clearCouponMessage: () => void;
}

export const useCoupon = (): UseCouponReturn => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponInput, setCouponInput] = useState<string>("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [freeShipping, setFreeShipping] = useState<boolean>(false);

  const applyCoupon = useCallback(
    async (context?: CouponContext) => {
      if (!couponInput.trim()) {
        setCouponMessage("Please enter a coupon code");
        return;
      }

      setIsApplyingCoupon(true);
      setCouponMessage(null);

      try {
        const result = await applyCouponService(couponInput.toUpperCase(), context);

        if (result.success) {
          setCouponCode(couponInput.toUpperCase());
          setAppliedCoupon(result.coupon || null);
          setDiscountAmount(result.discountAmount || 0);
          setFreeShipping(result.freeShipping || false);
          setCouponMessage(result.message || "Coupon applied successfully!");
        } else {
          setCouponCode("");
          setDiscountAmount(0);
          setFreeShipping(false);
          setCouponMessage(result.message || "Invalid coupon code");
        }
      } catch (error) {
        setCouponMessage(error instanceof Error ? error.message : "Failed to apply coupon");
        setDiscountAmount(0);
        setFreeShipping(false);
      } finally {
        setIsApplyingCoupon(false);
      }
    },
    [couponInput]
  );

  const removeCoupon = useCallback(async () => {
    setIsApplyingCoupon(true);
    try {
      const result = await removeCouponService(couponCode);
      if (result.success) {
        setCouponCode("");
        setCouponInput("");
        setCouponMessage(null);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setFreeShipping(false);
      } else {
        setCouponMessage(result.message || "Failed to remove coupon");
      }
    } catch (error) {
      console.error("Error removing coupon:", error);
      setCouponMessage("Failed to remove coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponCode]);

  const clearCouponMessage = useCallback(() => {
    setCouponMessage(null);
  }, []);

  return {
    couponCode,
    couponInput,
    isApplyingCoupon,
    couponMessage,
    appliedCoupon,
    discountAmount,
    freeShipping,
    setCouponInput,
    applyCoupon,
    removeCoupon,
    clearCouponMessage,
  };
};
