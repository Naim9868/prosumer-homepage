import type { CheckoutFormData, DeliveryType } from "@/types/checkout";

export const DELIVERY_CHARGES: Record<DeliveryType, number> = {
  INSIDE_DHAKA: 60,
  OUTSIDE_DHAKA: 120,
};

export const DELIVERY_LABELS: Record<DeliveryType, string> = {
  INSIDE_DHAKA: "Inside Dhaka (৳60)",
  OUTSIDE_DHAKA: "Outside Dhaka (৳120)",
};

export const PHONE_REGEX = /^01[3-9]\d{8}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_FORM_DATA: CheckoutFormData = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  division: "",
  notes: "",
  deliveryType: "INSIDE_DHAKA",
  paymentMethod: "COD",
};

export const TRUST_BADGES = [
  { icon: "Shield", label: "Secure" },
  { icon: "Clock", label: "Fast Delivery" },
  { icon: "Package", label: "Quality Guarantee" },
] as const;

export const VALIDATION_DEBOUNCE_MS = 500;
export const VALIDATION_THROTTLE_MS = 2000;
export const QUANTITY_MAX_DEFAULT = 99;
export const QUANTITY_MIN = 1;

export const STOCK_WARNING_THRESHOLD = 5;
