"use client";

import React, { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartContext } from "@/app/context/CartContext";
import { useGuestInfo } from "@/app/context/GuestInfoContext";
import { useCheckout } from "@/hooks/useCheckout";
import { CustomerForm } from "./CustomerForm";
import { DeliveryForm } from "./DeliveryForm";
import { PaymentForm } from "./PaymentForm";
import { OrderSummary } from "./OrderSummary";
import { SubmitButton } from "./SubmitButton";
import { EmptyCart } from "./EmptyCart";
import { SuccessScreen } from "./SuccessScreen";
import { TrustBadges } from "./TrustBadges";
import { ValidationAlert } from "./ValidationAlert";
import { getAvailableCoupons } from "@/services/coupon.service";
import type { Coupon, OrderItem } from "@/types/checkout";
import { trackInitiateCheckout } from "@/lib/analytics/events";

interface OrderFormProps {
  items?: OrderItem[];
  userId?: string;
  onSuccess?: (orderId: string) => void;
  onClose?: () => void;
  isModal?: boolean;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
  onUpdateVariant?: (itemId: string, variantKey: string) => void;
  onRemoveItem?: (itemId: string) => void;
}

export const Checkout: React.FC<OrderFormProps> = ({
  items: propItems,
  userId,
  onSuccess,
  onClose,
  isModal = false,
  onUpdateQuantity: externalUpdateQuantity,
  onUpdateVariant: externalUpdateVariant,
  onRemoveItem: externalRemoveItem,
}) => {
  // Safely use contexts
  let cartContext: {
    cartItems: OrderItem[];
    cartTotal: number;
    clearCart: () => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
  } | null = null;
  let guestInfo: { phone: string; email: string } = { phone: "", email: "" };

  try {
    const context = useCartContext();
    if (context) {
      cartContext = {
        cartItems: context.cartItems || [],
        cartTotal: context.cartTotal || 0,
        clearCart: context.clearCart || (() => {}),
        updateQuantity: context.updateQuantity || (() => {}),
        removeFromCart: context.removeFromCart || (() => {}),
      };
    }
  } catch {
    // Cart context not available, using props
  }

  try {
    const context = useGuestInfo();
    if (context) {
      guestInfo = {
        phone: context.guestInfo?.phone || "",
        email: context.guestInfo?.email || "",
      };
    }
  } catch {
    // Guest info context not available
  }

  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  const items = propItems || cartContext?.cartItems || [];
  const isUsingPropItems = !!propItems;

  const {
    formData,
    items: checkoutItems,
    totals,
    loading,
    orderComplete,
    orderId,
    orderError,
    errors,
    validatedItems,
    validationError,
    isValidating,
    couponCode,
    couponInput,
    isApplyingCoupon,
    couponMessage,
    appliedCoupon,
    updateField,
    updateQuantity,
    updateVariant,
    removeItem,
    setCouponInput,
    applyCoupon: applyCouponBase,
    removeCoupon,
    submitOrder,
  } = useCheckout({
    items,
    userId,
    guestInfo,
    onSuccess: (orderIdValue) => {
      // Clear cart if not using props
      if (!isUsingPropItems && cartContext) {
        cartContext.clearCart();
      }
      if (onSuccess) {
        onSuccess(orderIdValue);
      }
    },
  });

  useEffect(() => {
    getAvailableCoupons({ subtotal: totals.subtotal, userId })
      .then((coupons) => setAvailableCoupons(coupons))
      .catch(() => setAvailableCoupons([]));
  }, [totals.subtotal, userId]);

  // Meta InitiateCheckout / GA4 begin_checkout.
  // Fires at most once per checkout visit, and only with real cart lines,
  // so re-renders, coupon updates and quantity edits never repeat it.
  const beginCheckoutFiredRef = useRef(false);
  useEffect(() => {
    if (beginCheckoutFiredRef.current || orderComplete) return;
    if (checkoutItems.length === 0) return;
    beginCheckoutFiredRef.current = true;
    trackInitiateCheckout(checkoutItems, totals.total);
  }, [orderComplete, checkoutItems, totals.total]);

  const applyCoupon = async () => {
    const productIds: string[] = [];
    const categories: string[] = [];
    const lines: Array<{ productId: string; lineTotal: number }> = [];
    checkoutItems.forEach((item) => {
      const pid = item.productId || item.id;
      productIds.push(pid);
      lines.push({ productId: pid, lineTotal: item.price.sale * item.quantity });
      if (item.category) categories.push(item.category);
    });
    await applyCouponBase({
      subtotal: totals.subtotal,
      userId,
      productIds,
      categories,
      lines,
    });
  };

  // Handle external callbacks with sync back to global cart
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (externalUpdateQuantity) {
      externalUpdateQuantity(itemId, quantity);
    } else {
      updateQuantity(itemId, quantity);
    }
    // Sync back to global cart context
    if (!isUsingPropItems && cartContext) {
      cartContext.updateQuantity(itemId, quantity);
    }
  };

  const handleVariantChange = (itemId: string, variantKey: string) => {
    if (externalUpdateVariant) {
      externalUpdateVariant(itemId, variantKey);
    } else {
      updateVariant(itemId, variantKey);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (externalRemoveItem) {
      externalRemoveItem(itemId);
    } else {
      removeItem(itemId);
    }
    // Sync back to global cart context
    if (!isUsingPropItems && cartContext) {
      cartContext.removeFromCart(itemId);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.href = "/";
    }
  };

  if (items.length === 0 && !orderComplete) {
    return <EmptyCart />;
  }

  if (orderComplete) {
    return <SuccessScreen orderId={orderId} onClose={handleClose} isModal={isModal} />;
  }

  const SubmitSection = (
    <div className="rounded-[var(--radius-lg)] bg-card p-3 shadow-lg sm:p-4">
      <ValidationAlert error={validationError} type="error" />
      {orderError && <ValidationAlert error={orderError} type="error" />}

      <SubmitButton
        loading={loading}
        isValidating={isValidating}
        disabled={checkoutItems.length === 0 || !!validationError}
        total={totals.total}
        onClick={submitOrder}
      />

      <TrustBadges />
    </div>
  );

  return (
    <form
      id="checkout-form"
      onSubmit={(e) => {
        e.preventDefault();
        submitOrder();
      }}
      className="flex flex-col lg:flex-row gap-4 lg:gap-6"
    >
      {/* Left column: Form fields + Submit (desktop) */}
      <div className="flex-1 flex flex-col gap-4 order-1">
        <div className="rounded-[var(--radius-lg)] bg-card p-3 shadow-lg sm:p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl mb-4">
            <ShoppingBag className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Place Your Order
            </span>
          </h2>

          <CustomerForm
            name={formData.name}
            phone={formData.phone}
            email={formData.email}
            errors={errors}
            onNameChange={(value) => updateField("name", value)}
            onPhoneChange={(value) => updateField("phone", value)}
            onEmailChange={(value) => updateField("email", value)}
          />

          <hr className="border-border my-3" />

          <DeliveryForm
            deliveryType={formData.deliveryType}
            address={formData.address}
            city={formData.city}
            division={formData.division}
            notes={formData.notes}
            errors={errors}
            onDeliveryTypeChange={(type) => updateField("deliveryType", type)}
            onAddressChange={(value) => updateField("address", value)}
            onCityChange={(value) => updateField("city", value)}
            onDivisionChange={(value) => updateField("division", value)}
            onNotesChange={(value) => updateField("notes", value)}
          />

          <hr className="border-border my-3" />

          <PaymentForm
            paymentMethod={formData.paymentMethod}
            onPaymentMethodChange={(method) => updateField("paymentMethod", method)}
          />
        </div>

        {/* Submit section - shown on desktop */}
        <div className="hidden lg:block">
          {SubmitSection}
        </div>
      </div>

      {/* Right column: Order Summary */}
      <div className="lg:w-96 xl:w-[400px] flex-shrink-0 order-2">
        <OrderSummary
          items={checkoutItems}
          totals={totals}
          validatedItems={validatedItems}
          isValidating={isValidating}
          couponCode={couponCode}
          couponInput={couponInput}
          isApplyingCoupon={isApplyingCoupon}
          couponMessage={couponMessage}
          appliedCoupon={appliedCoupon}
          availableCoupons={availableCoupons}
          onQuantityChange={handleQuantityChange}
          onVariantChange={handleVariantChange}
          onRemove={handleRemoveItem}
          onCouponInputChange={setCouponInput}
          onApplyCoupon={applyCoupon}
          onRemoveCoupon={removeCoupon}
        />
      </div>

      {/* Submit section - shown on mobile (after OrderSummary) */}
      <div className="w-full lg:hidden order-3">
        {SubmitSection}
      </div>
    </form>
  );
};