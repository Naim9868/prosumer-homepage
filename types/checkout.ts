export type DeliveryType = "INSIDE_DHAKA" | "OUTSIDE_DHAKA";
export type PaymentMethod = "COD" | "ONLINE";

export interface ProductVariant {
  variantKey: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  attributes: Record<string, string>;
  images?: string[];
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image?: string;
  sku?: string;
  brand?: string;
  category?: string;
  price: { original: number; sale: number };
  variantKey?: string;
  variantName?: string;
  attributes?: Record<string, string>;
  quantity: number;
  maxQuantity?: number;
  inventory?: number;
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  selectedVariantKey?: string;
  gradient?: string;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  city: string;
  division: string;
  notes: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
}

export interface CheckoutTotals {
  subtotal: number;
  totalDiscount: number;
  couponDiscount: number;
  deliveryCharge: number;
  total: number;
}

export interface Promotion {
  freeDelivery: boolean;
  freeShipping: boolean;
  availableCoupons: Coupon[];
  appliedCoupon: Coupon | null;
  couponMessage: string | null;
}

export interface Coupon {
  code: string;
  description?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  minimumOrder?: number;
  validUntil?: string;
  type?: 'FIXED' | 'PERCENTAGE' | 'FREE_SHIPPING';
  value?: number;
  minOrder?: number;
  maxDiscount?: number;
}

export interface ValidationResult {
  success: boolean;
  data: {
    items: OrderItem[];
    summary: CheckoutTotals;
    promotions?: Promotion;
  };
  error?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  city: string;
  division: string;
}

export interface OrderInput {
  guestEmail: string;
  guestPhone: string;
  userId?: string;
  couponCode?: string;
  coupon?: {
    couponId?: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
    value: number;
    discountAmount: number;
  };
  items: Array<{
    productId: string;
    variantKey: string;
    snapshot: {
      name: string;
      slug: string;
      image?: string;
      sku?: string;
      brand?: string;
      category?: string;
      attributes?: Record<string, string>;
    };
    price: { original: number; sale: number };
    quantity: number;
    total: number;
  }>;
  pricing: {
    subtotal: number;
    itemDiscount: number;
    couponDiscount: number;
    campaignDiscount: number;
    deliveryCharge: number;
    tax: number;
    total: number;
    currency: string;
  };
  shipping: ShippingAddress;
  delivery: { type: DeliveryType };
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  notes: Array<{ text: string }>;
}

export interface OrderResponse {
  success: boolean;
  data?: {
    order: {
      orderId: string;
    };
  };
  orderId?: string;
  _id?: string;
  error?: string;
}

export interface GuestInfoType {
  phone?: string;
  email?: string;
}

export interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  area?: string;
  city?: string;
  division?: string;
}
