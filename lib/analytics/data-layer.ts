/**
 * Central dataLayer utility for Google Tag Manager.
 *
 * Guarantees:
 *  - browser only (never runs during SSR)
 *  - never throws (analytics must never break the storefront)
 *  - never pushes PII, credentials or tokens
 *  - does not require GTM to be loaded yet (GTM drains the queue on boot)
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const ECOMMERCE_CURRENCY = "BDT";

export type AnalyticsEventName =
  | "page_view"
  | "view_item"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase";

/** GA4/GTM ecommerce line item. */
export interface EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_brand?: string;
  item_category?: string;
}

/** Meta `contents` entry. */
export interface MetaContent {
  id: string;
  quantity: number;
  item_price?: number;
}

/** Meta-specific fields consumed by GTM Data Layer Variables. */
export interface MetaEcommercePayload {
  event_id?: string;
  content_ids: string[];
  content_type: "product";
  contents?: MetaContent[];
  value: number;
  currency: string;
  content_name?: string;
}

export interface EcommercePayload {
  currency: string;
  value: number;
  items: EcommerceItem[];
  transaction_id?: string;
}

export interface DataLayerPayload {
  event: string;
  [key: string]: unknown;
}

export interface PageViewPayload {
  event: "page_view";
  page_location: string;
  page_path: string;
  page_title: string;
}

/**
 * Keys that must never reach the dataLayer (GTM container, GA4, Meta, ...).
 * Checked recursively in development so mistakes are caught before release.
 */
const FORBIDDEN_KEYS = new Set([
  "email",
  "phone",
  "password",
  "token",
  "accesstoken",
  "access_token",
  "apikey",
  "api_key",
  "authorization",
  "cookie",
  "address",
  "shippingaddress",
  "shipping_address",
  "guestemail",
  "guestphone",
  "customeraddress",
  "firstname",
  "lastname",
  "fullname",
  "fbclid",
  "fbc",
  "fbp",
  "_fbc",
  "_fbp",
]);

function findForbiddenKey(value: unknown, depth = 0): string | null {
  if (depth > 5 || value === null || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findForbiddenKey(entry, depth + 1);
      if (found) return found;
    }
    return null;
  }

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) return key;
    const found = findForbiddenKey(nested, depth + 1);
    if (found) return found;
  }
  return null;
}

/** Rounds monetary values so GTM/Meta never receive float noise. */
export function roundAmount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

/**
 * Pushes a payload onto `window.dataLayer`.
 * Safe to call before GTM boots, during hydration, and in any route.
 */
export function pushDataLayer(payload: DataLayerPayload): void {
  if (typeof window === "undefined") return;

  try {
    if (process.env.NODE_ENV !== "production") {
      const offendingKey = findForbiddenKey(payload);
      if (offendingKey) {
        console.warn(
          `[analytics] dataLayer push blocked: sensitive key "${offendingKey}" found in "${payload.event}".`
        );
        return;
      }
    }

    if (!Array.isArray(window.dataLayer)) {
      window.dataLayer = [];
    }

    window.dataLayer.push(payload as unknown as Record<string, unknown>);
  } catch {
    // Analytics must never break the storefront.
  }
}

/** Introspection helper (used by GTM preview / debugging). */
export function getDataLayerSnapshot(): ReadonlyArray<Record<string, unknown>> {
  if (typeof window === "undefined" || !Array.isArray(window.dataLayer)) return [];
  return window.dataLayer.slice();
}
