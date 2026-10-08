"use client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { CheckoutFormData, OrderItem, CheckoutTotals, GuestInfoType, Coupon } from "@/types/checkout";
import { DEFAULT_FORM_DATA, QUANTITY_MAX_DEFAULT } from "@/constants/checkout-constant";
import { calculateDeliveryCharge, normalizeOrderInput, clampQuantity, computeCheckoutTotals } from "@/utils/checkout-utils";
import { useCartValidation } from "./useCartValidation";
import { useCoupon } from "./useCoupon";
import { useOrder } from "./useOrder";
import { validateCart } from "@/services/checkout.service";
import { trackPurchase } from "@/lib/analytics/events";
import { readMetaBrowserAttribution } from "@/lib/analytics/meta-attribution";

interface UseCheckoutProps {
  items: OrderItem[];
  userId?: string;
  guestInfo?: GuestInfoType;
  onSuccess?: (orderId: string) => void;
}

interface UseCheckoutReturn {
  formData: CheckoutFormData;
  items: OrderItem[];
  totals: CheckoutTotals;
  loading: boolean;
  orderComplete: boolean;
  orderId: string;
  orderError: string | null;
  errors: Partial<Record<keyof CheckoutFormData, string>>;

  validatedItems: OrderItem[];
  validatedTotals: CheckoutTotals | null;
  validationError: string | null;
  isValidating: boolean;

  couponCode: string;
  couponInput: string;
  isApplyingCoupon: boolean;
  couponMessage: string | null;
  appliedCoupon: Coupon | null;
  couponDiscountAmount: number;
  couponFreeShipping: boolean;

  updateField: <K extends keyof CheckoutFormData>(field: K, value: CheckoutFormData[K]) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateVariant: (itemId: string, variantKey: string) => void;
  removeItem: (itemId: string) => void;
  setCouponInput: (value: string) => void;
  applyCoupon: (context?: { subtotal: number; userId?: string; productIds?: string[]; categories?: string[]; lines?: Array<{ productId: string; lineTotal: number }> }) => Promise<void>;
  removeCoupon: () => Promise<void>;
  validateForm: () => boolean;
  submitOrder: () => Promise<void>;
  resetCheckout: () => void;
}

export const useCheckout = ({ items: propItems, userId, guestInfo, onSuccess }: UseCheckoutProps): UseCheckoutReturn => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    ...DEFAULT_FORM_DATA,
    phone: guestInfo?.phone || "",
    email: guestInfo?.email || "",
  });
  const [localItems, setLocalItems] = useState<OrderItem[]>(propItems);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const {
    couponCode,
    couponInput,
    isApplyingCoupon,
    couponMessage,
    appliedCoupon,
    discountAmount: couponDiscountAmount,
    freeShipping: couponFreeShipping,
    setCouponInput,
    applyCoupon: applyCouponHook,
    removeCoupon: removeCouponHook,
  } = useCoupon();

  const { validatedItems, validatedTotals, validationError, isValidating } = useCartValidation({
    items: localItems,
    deliveryType: formData.deliveryType,
    userId,
  });

  const { loading, orderComplete, orderId, error: orderError, submitOrder: submitOrderHook, resetOrder } = useOrder();

  const validatedItemsRef = useRef(validatedItems);
  useEffect(() => {
    validatedItemsRef.current = validatedItems;
  }, [validatedItems]);

  const hasSyncedRef = useRef(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (validatedItems.length > 0 && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      setLocalItems((prev) => {
        const validatedMap = new Map<string, OrderItem>();
        validatedItems.forEach((v) => {
          const key = `${v.productId || v.id}-${v.variantKey || "default"}`;
          validatedMap.set(key, v);
        });
        return prev.map((item) => {
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
      });
    }
  }, [validatedItems]);

  const [prevPropItems, setPrevPropItems] = useState<OrderItem[]>(propItems);
  if (prevPropItems !== propItems) {
    setPrevPropItems(propItems);
    setLocalItems((prev) => {
      const localIds = new Set(prev.map((i) => i.id));
      const newItems = propItems.filter((i) => !localIds.has(i.id));
      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });
  }

  const [prevGuestInfo, setPrevGuestInfo] = useState<GuestInfoType | undefined>(guestInfo);
  if (
    prevGuestInfo?.phone !== guestInfo?.phone ||
    prevGuestInfo?.email !== guestInfo?.email
  ) {
    setPrevGuestInfo(guestInfo);
    if (guestInfo?.phone && !formData.phone) {
      setFormData((prev) => ({ ...prev, phone: guestInfo.phone || "" }));
    }
    if (guestInfo?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: guestInfo.email || "" }));
    }
  }

  const totals = useMemo((): CheckoutTotals => {
    const localOriginalTotal = localItems.reduce((sum, item) => sum + item.price.original * item.quantity, 0);
    const localTotalDiscount = localItems.reduce(
      (sum, item) => sum + Math.max(0, item.price.original - item.price.sale) * item.quantity,
      0
    );

    const originalTotal = validatedTotals
      ? (validatedTotals.originalTotal ?? validatedTotals.subtotal + (validatedTotals.totalDiscount || 0))
      : localOriginalTotal;

    const totalDiscount = validatedTotals ? validatedTotals.totalDiscount || 0 : localTotalDiscount;

    return computeCheckoutTotals({
      originalTotal,
      totalDiscount,
      couponDiscount: couponDiscountAmount,
      deliveryCharge: calculateDeliveryCharge(formData.deliveryType),
    });
  }, [localItems, formData.deliveryType, validatedTotals, couponDiscountAmount]);

  const updateField = useCallback(
    <K extends keyof CheckoutFormData>(field: K, value: CheckoutFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setLocalItems((prevItems) => {
      const item = prevItems.find((i) => i.id === itemId);
      if (!item) return prevItems;

      const maxQty = item.maxQuantity || QUANTITY_MAX_DEFAULT;
      const finalQuantity = clampQuantity(quantity, maxQty);

      return prevItems.map((i) => (i.id === itemId ? { ...i, quantity: finalQuantity } : i));
    });
  }, []);

  const updateVariant = useCallback((itemId: string, variantKey: string) => {
    setLocalItems((prevItems) => {
      const item = prevItems.find((i) => i.id === itemId);
      if (!item) return prevItems;

      const variants = item.variants?.length ? item.variants : validatedItemsRef.current?.find((v) => v.id === itemId)?.variants;
      if (!variants || variants.length === 0) return prevItems;

      const selectedVariant = variants.find((v) => v.variantKey === variantKey);
      if (!selectedVariant) return prevItems;

      return prevItems.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            selectedVariantKey: variantKey,
            price: {
              ...i.price,
              sale: selectedVariant.price,
              original: selectedVariant.compareAtPrice || selectedVariant.price,
            },
            sku: selectedVariant.sku,
            variantKey: variantKey,
            variantName: Object.values(selectedVariant.attributes).join(" - ") || variantKey,
            maxQuantity: selectedVariant.inventory,
          };
        }
        return i;
      });
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setLocalItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  }, []);

  const validateForm = useCallback((): boolean => {
    const e: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.phone.trim()) e.phone = "Phone is required";
    if (formData.phone && !/^01[3-9]\d{8}$/.test(formData.phone)) {
      e.phone = "Invalid phone number";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Invalid email";
    }
    if (!formData.address.trim()) e.address = "Address is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  const submitOrder = useCallback(async () => {
    if (submittingRef.current) {
      return;
    }

    if (!validateForm() || localItems.length === 0) {
      return;
    }

    if (validationError) {
      alert("Please resolve the validation issues before placing your order.");
      return;
    }

    submittingRef.current = true;

    try {
      const validationItems = localItems.map((item) => ({
        productId: item.productId || item.id,
        variantKey: item.variantKey || "default",
        quantity: item.quantity,
      }));

      const validationResult = await validateCart({
        items: validationItems,
        deliveryType: formData.deliveryType,
        userId,
      });

      if (!validationResult.success || !validationResult.data) {
        alert(validationResult.error || "Order validation failed. Please try again.");
        return;
      }

      const orderItems = validationResult.data.items.length > 0 ? validationResult.data.items : localItems;

      const freshSummary = validationResult.data.summary;
      const orderTotals = computeCheckoutTotals({
        originalTotal:
          freshSummary?.originalTotal ??
          (freshSummary?.subtotal ?? totals.subtotal) + (freshSummary?.totalDiscount || 0),
        totalDiscount: freshSummary?.totalDiscount ?? totals.totalDiscount,
        couponDiscount: couponDiscountAmount,
        deliveryCharge: calculateDeliveryCharge(formData.deliveryType),
      });

      const orderCoupon = couponCode
        ? {
            code: appliedCoupon?.code || couponCode,
            type: (appliedCoupon?.type || "FIXED") as "PERCENTAGE" | "FIXED" | "FREE_SHIPPING",
            value: (appliedCoupon?.value as number) || 0,
            discountAmount: couponDiscountAmount,
          }
        : undefined;

      const orderInput = normalizeOrderInput(orderItems, formData, orderTotals, userId, couponCode, orderCoupon);

      const attribution = readMetaBrowserAttribution();
      if (attribution) {
        orderInput.analytics = attribution;
      }

      const newOrderId = await submitOrderHook(orderInput);

      // Fires only after the server returned a confirmed order id, and is
      // guarded per orderId (sessionStorage) so reloads cannot repeat it.
      // `event_id` here matches the server-side Conversions API event id.
      trackPurchase({ orderId: newOrderId, items: orderItems, total: orderTotals.total });

      if (onSuccess) {
        onSuccess(newOrderId);
      }
    } catch (error) {
      console.error("Order submission error:", error);
    } finally {
      submittingRef.current = false;
    }
  }, [
    validateForm,
    localItems,
    validationError,
    formData,
    totals,
    userId,
    couponCode,
    appliedCoupon,
    couponDiscountAmount,
    submitOrderHook,
    onSuccess,
  ]);

  const resetCheckout = useCallback(() => {
    resetOrder();
    setErrors({});
  }, [resetOrder]);

  return {
    formData,
    items: localItems,
    totals,
    loading,
    orderComplete,
    orderId,
    orderError,
    errors,

    validatedItems,
    validatedTotals,
    validationError,
    isValidating,

    couponCode,
    couponInput,
    isApplyingCoupon,
    couponMessage,
    appliedCoupon,
    couponDiscountAmount,
    couponFreeShipping,

    updateField,
    updateQuantity,
    updateVariant,
    removeItem,
    setCouponInput,
    applyCoupon: applyCouponHook,
    removeCoupon: removeCouponHook,
    validateForm,
    submitOrder,
    resetCheckout,
  };
};
