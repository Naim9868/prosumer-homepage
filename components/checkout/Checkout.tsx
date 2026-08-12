"use client";

import React, { useEffect, useState } from "react";
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
    couponFreeShipping,
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

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="order-2 flex-1 lg:order-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitOrder();
          }}
          className="space-y-6 rounded-[var(--radius-lg)] bg-card p-4 shadow-lg sm:p-6"
        >
          <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <ShoppingBag className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
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

          <hr className="border-border" />

          <DeliveryForm
            deliveryType={formData.deliveryType}
            address={formData.address}
            area={formData.area}
            city={formData.city}
            division={formData.division}
            notes={formData.notes}
            errors={errors}
            onDeliveryTypeChange={(type) => updateField("deliveryType", type)}
            onAddressChange={(value) => updateField("address", value)}
            onAreaChange={(value) => updateField("area", value)}
            onCityChange={(value) => updateField("city", value)}
            onDivisionChange={(value) => updateField("division", value)}
            onNotesChange={(value) => updateField("notes", value)}
          />

          <hr className="border-border" />

          <PaymentForm
            paymentMethod={formData.paymentMethod}
            onPaymentMethodChange={(method) => updateField("paymentMethod", method)}
          />

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
        </form>
      </div>

      <div className="order-1 lg:order-2 lg:w-96 xl:w-[400px]">
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
          couponFreeShipping={couponFreeShipping}
          availableCoupons={availableCoupons}
          onQuantityChange={handleQuantityChange}
          onVariantChange={handleVariantChange}
          onRemove={handleRemoveItem}
          onCouponInputChange={setCouponInput}
          onApplyCoupon={applyCoupon}
          onRemoveCoupon={removeCoupon}
        />
      </div>
    </div>
  );
};