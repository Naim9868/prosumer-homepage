import type { OrderItem, OrderInput, ShippingAddress, DeliveryType, ProductVariant, CheckoutFormData, CheckoutTotals } from "@/types/checkout";
import { DELIVERY_CHARGES, QUANTITY_MAX_DEFAULT } from "@/constants/checkout-constant";

export const calculateSubtotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.price.sale * item.quantity, 0);
};

export const calculateDeliveryCharge = (deliveryType: DeliveryType): number => {
  return DELIVERY_CHARGES[deliveryType] || 0;
};

export const calculateTotal = (
  subtotal: number,
  deliveryCharge: number,
  couponDiscount: number = 0,
  itemDiscount: number = 0
): number => {
  return subtotal - itemDiscount - couponDiscount + deliveryCharge;
};

export const getItemImage = (item: OrderItem): string | undefined => {
  return item.image || undefined;
};

export const formatVariantName = (variant?: ProductVariant | undefined): string => {
  if (!variant) return "";
  return Object.values(variant.attributes).join(" - ") || variant.variantKey;
};

export const normalizeOrderInput = (
  items: OrderItem[],
  formData: CheckoutFormData,
  totals: CheckoutTotals,
  userId?: string,
  couponCode?: string,
  coupon?: OrderInput["coupon"]
): OrderInput => {
  const shipping: ShippingAddress = {
    name: formData.name,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
    area: formData.area,
    city: formData.city,
    division: formData.division,
  };

  return {
    guestEmail: formData.email,
    guestPhone: formData.phone,
    userId,
    couponCode,
    coupon,
    items: items.map((item) => ({
      productId: item.productId || item.id,
      variantKey: item.variantKey || "default",
      snapshot: {
        name: item.name,
        slug: item.slug,
        image: item.image,
        sku: item.sku,
        brand: item.brand,
        category: item.category,
        attributes: item.attributes,
      },
      price: { original: item.price.original, sale: item.price.sale },
      quantity: item.quantity,
      total: item.price.sale * item.quantity,
    })),
    pricing: {
      subtotal: totals.subtotal,
      itemDiscount: totals.totalDiscount || 0,
      couponDiscount: totals.couponDiscount || 0,
      campaignDiscount: 0,
      deliveryCharge: totals.deliveryCharge,
      tax: 0,
      total: totals.total,
      currency: "BDT",
    },
    shipping,
    delivery: { type: formData.deliveryType },
    deliveryType: formData.deliveryType,
    paymentMethod: formData.paymentMethod,
    notes: formData.notes ? [{ text: formData.notes }] : [],
  };
};

export const getMaxQuantity = (item: OrderItem): number => {
  return item.maxQuantity || QUANTITY_MAX_DEFAULT;
};

export const clampQuantity = (quantity: number, max: number): number => {
  return Math.max(1, Math.min(quantity, max));
};

export const isLowStock = (item: OrderItem): boolean => {
  return item.inventory !== undefined && item.inventory <= 5 && item.inventory > 0;
};

export const isOutOfStock = (item: OrderItem): boolean => {
  return item.inventory !== undefined && item.inventory < item.quantity;
};

export const getInventoryStatus = (item: OrderItem): "in-stock" | "low-stock" | "out-of-stock" => {
  if (isOutOfStock(item)) return "out-of-stock";
  if (isLowStock(item)) return "low-stock";
  return "in-stock";
};

export const getTotalPrice = (item: OrderItem): number => {
  return item.price.sale * item.quantity;
};

export const formatCurrency = (
  amount: number,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  const { showSymbol = true, minimumFractionDigits = 0, maximumFractionDigits = 0 } = options ?? {};

  const formatted = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  return showSymbol ? `৳${formatted}` : formatted;
};
