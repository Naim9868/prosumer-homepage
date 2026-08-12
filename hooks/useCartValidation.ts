"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import type { OrderItem, CheckoutTotals, Promotion, ValidationResult } from "@/types/checkout";
import { validateCart } from "@/services/checkout.service";
import { VALIDATION_THROTTLE_MS, VALIDATION_DEBOUNCE_MS } from "@/constants/checkout-constant";

interface UseCartValidationProps {
  items: OrderItem[];
  deliveryType: "INSIDE_DHAKA" | "OUTSIDE_DHAKA";
  userId?: string;
  enabled?: boolean;
}

interface UseCartValidationReturn {
  validatedItems: OrderItem[];
  validatedTotals: CheckoutTotals | null;
  promotions: Promotion | null;
  validationError: string | null;
  isValidating: boolean;
  validate: (showLoading?: boolean) => Promise<void>;
  lastValidationTime: number;
}

export const useCartValidation = ({
  items,
  deliveryType,
  userId,
  enabled = true,
}: UseCartValidationProps): UseCartValidationReturn => {
  const [validatedItems, setValidatedItems] = useState<OrderItem[]>([]);
  const [validatedTotals, setValidatedTotals] = useState<CheckoutTotals | null>(null);
  const [promotions, setPromotions] = useState<Promotion | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validate = useCallback(
    async (showLoading: boolean = true) => {
      if (!enabled || items.length === 0) {
        setValidatedItems([]);
        setValidatedTotals(null);
        setPromotions(null);
        setValidationError(null);
        return;
      }

      const now = Date.now();
      if (now - lastValidationTime < VALIDATION_THROTTLE_MS) {
        return;
      }
      setLastValidationTime(now);

      if (showLoading) {
        setIsValidating(true);
      }
      setValidationError(null);

      try {
        const validationItems = items.map((item) => ({
          productId: item.productId || item.id,
          variantKey: item.variantKey || "default",
          quantity: item.quantity,
        }));

        const result: ValidationResult = await validateCart({
          items: validationItems,
          deliveryType,
          userId,
        });

        if (result.success && result.data) {
          setValidatedTotals(result.data.summary);
          if (result.data.promotions) {
            setPromotions(result.data.promotions);
          }

          const validatedMap = new Map<string, OrderItem>();
          result.data.items.forEach((v: OrderItem) => {
            const mapKey = `${v.productId || v.id}-${v.variantKey || "default"}`;
            validatedMap.set(mapKey, v);
          });

          const mergedItems = items.map((item) => {
            const mapKey = `${item.productId || item.id}-${item.variantKey || "default"}`;
            const validated = validatedMap.get(mapKey);
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

          setValidatedItems(mergedItems);
        } else {
          setValidationError(result.error || "Failed to validate cart");
        }
      } catch (error) {
        console.error("Validation error:", error);

        let errorMessage = "Failed to validate cart";
        if (error instanceof Error) {
          errorMessage = error.message;

          if (errorMessage.includes("not found") || errorMessage.includes("not available")) {
            const match = errorMessage.match(/Product with ID ([a-f0-9]{24})/i);
            if (match) {
              errorMessage = `Product with ID ${match[1]} is not available. Please remove it from your cart.`;
            } else if (errorMessage.includes("Product")) {
              errorMessage = "Some products in your cart are no longer available. Please review your cart.";
            }
          }
        }

        setValidationError(errorMessage);
      } finally {
        if (showLoading) {
          setIsValidating(false);
        }
      }
    },
    [items, deliveryType, userId, enabled, lastValidationTime]
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (items.length > 0 && enabled) {
      debounceTimerRef.current = setTimeout(() => {
        validate(false);
      }, VALIDATION_DEBOUNCE_MS);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [items, deliveryType, userId, enabled, validate]);

  return {
    validatedItems,
    validatedTotals,
    promotions,
    validationError,
    isValidating,
    validate,
    lastValidationTime,
  };
};
