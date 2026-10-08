/**
 * Central analytics event module.
 *
 * Every storefront analytics event goes through this file — components never
 * call `dataLayer.push` directly. All events are PII-free and use the GTM
 * contract documented in `docs/meta-gtm-setup.md`:
 *
 *   view_item | add_to_cart | begin_checkout | purchase
 */

import {
  ECOMMERCE_CURRENCY,
  pushDataLayer,
  roundAmount,
  type EcommerceItem,
  type MetaContent,
} from "./data-layer";
import type { OrderItem } from "@/types/checkout";
import type { Product, ProductVariant } from "@/types/product";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

/** Returns the first usable identifier — never `undefined`. */
export function pickItemId(...candidates: Array<string | undefined | null>): string | undefined {
  for (const candidate of candidates) {
    const value = typeof candidate === "string" ? candidate.trim() : "";
    if (value.length > 0) return value;
  }
  return undefined;
}

function resolveBrandName(product: Product): string | undefined {
  if (product.brand && typeof product.brand === "object" && product.brand.name) {
    return product.brand.name;
  }
  if (product.brandId && typeof product.brandId === "object" && product.brandId.name) {
    return product.brandId.name;
  }
  return undefined;
}

function resolveCategoryName(product: Product): string | undefined {
  if (product.category && typeof product.category === "object" && product.category.name) {
    return product.category.name;
  }
  if (product.categoryId && typeof product.categoryId === "object" && product.categoryId.name) {
    return product.categoryId.name;
  }
  return undefined;
}

function cartItemToEcommerceItem(item: OrderItem): EcommerceItem | null {
  const itemId = pickItemId(item.sku, item.productId, item.id);
  if (!itemId) return null;

  const entry: EcommerceItem = {
    item_id: itemId,
    item_name: item.name,
    price: roundAmount(item.price.sale),
    quantity: item.quantity,
  };
  if (item.brand) entry.item_brand = item.brand;
  if (item.category) entry.item_category = item.category;
  return entry;
}

function toEcommerceItems(items: OrderItem[]): EcommerceItem[] {
  return items.map(cartItemToEcommerceItem).filter((entry): entry is EcommerceItem => entry !== null);
}

function toContents(items: OrderItem[]): MetaContent[] {
  const contents: MetaContent[] = [];
  for (const item of items) {
    const itemId = pickItemId(item.sku, item.productId, item.id);
    if (!itemId) continue;
    contents.push({
      id: itemId,
      quantity: item.quantity,
      item_price: roundAmount(item.price.sale),
    });
  }
  return contents;
}

function toContentIds(items: OrderItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    const itemId = pickItemId(item.sku, item.productId, item.id);
    if (itemId && !ids.includes(itemId)) ids.push(itemId);
  }
  return ids;
}

function lineValue(items: OrderItem[]): number {
  return roundAmount(items.reduce((sum, item) => sum + item.price.sale * item.quantity, 0));
}

/* ------------------------------------------------------------------ */
/* Duplicate protection                                                */
/* ------------------------------------------------------------------ */

/** One ViewContent per product per full page load (blocks StrictMode double effects). */
const viewedProductIds = new Set<string>();

/** In-memory fallback for the sessionStorage Purchase guard. */
const firedPurchaseIds = new Set<string>();

export const PURCHASE_FIRED_STORAGE_PREFIX = "meta_purchase_fired_";

function purchaseAlreadyFired(orderId: string): boolean {
  if (firedPurchaseIds.has(orderId)) return true;
  try {
    if (typeof sessionStorage !== "undefined") {
      return sessionStorage.getItem(`${PURCHASE_FIRED_STORAGE_PREFIX}${orderId}`) === "1";
    }
  } catch {
    // Storage unavailable (private mode) — fall back to the in-memory set.
  }
  return false;
}

function markPurchaseFired(orderId: string): void {
  firedPurchaseIds.add(orderId);
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(`${PURCHASE_FIRED_STORAGE_PREFIX}${orderId}`, "1");
    }
  } catch {
    // Ignore — the in-memory set already guards this session.
  }
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export interface TrackPageViewInput {
  pathname: string;
  search: string;
  title: string;
}

/**
 * SPA page view. Fires only on App Router navigations — the initial document
 * load is handled by GTM's own "All Pages" trigger (see docs/meta-gtm-setup.md),
 * which keeps Meta/GA4 PageView counts at exactly one per page view.
 */
export function trackPageView({ pathname, search, title }: TrackPageViewInput): void {
  if (!pathname) return;
  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  const pagePath = `${pathname}${query}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  pushDataLayer({
    event: "page_view",
    page_location: `${origin}${pagePath}`,
    page_path: pagePath,
    page_title: title,
  });
}

export interface ViewContentInput {
  product: Product;
  variant?: ProductVariant;
}

/**
 * Meta ViewContent / GA4 view_item — fired once per product per page load.
 * SKUs are preferred as the content id, falling back to the product id.
 */
export function trackViewContent({ product, variant }: ViewContentInput): void {
  if (!product) return;

  const itemId = pickItemId(variant?.sku, product._id);
  if (!itemId) return;

  const price = variant?.price ?? product.lowestPrice ?? product.variants?.[0]?.price;
  if (typeof price !== "number" || !Number.isFinite(price)) return;

  const dedupeKey = product._id || itemId;
  if (viewedProductIds.has(dedupeKey)) return;
  viewedProductIds.add(dedupeKey);

  const value = roundAmount(price);
  const item: EcommerceItem = {
    item_id: itemId,
    item_name: product.name,
    price: value,
    quantity: 1,
  };
  const brand = resolveBrandName(product);
  const category = resolveCategoryName(product);
  if (brand) item.item_brand = brand;
  if (category) item.item_category = category;

  pushDataLayer({
    event: "view_item",
    ecommerce: {
      currency: ECOMMERCE_CURRENCY,
      value,
      items: [item],
    },
    meta: {
      content_ids: [itemId],
      content_type: "product",
      content_name: product.name,
      value,
      currency: ECOMMERCE_CURRENCY,
    },
  });
}

/**
 * Meta AddToCart / GA4 add_to_cart.
 * `items` must contain exactly the units that were just added to the cart,
 * with the sale price the cart itself uses.
 */
export function trackAddToCart(items: OrderItem[]): void {
  const validItems = toEcommerceItems(items);
  if (validItems.length === 0) return;

  const contentIds = toContentIds(items);
  if (contentIds.length === 0) return;

  const value = lineValue(items);

  pushDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: ECOMMERCE_CURRENCY,
      value,
      items: validItems,
    },
    meta: {
      content_ids: contentIds,
      content_type: "product",
      contents: toContents(items),
      value,
      currency: ECOMMERCE_CURRENCY,
    },
  });
}

/**
 * Meta InitiateCheckout / GA4 begin_checkout.
 * `total` must be the real calculated checkout total (items + delivery − discounts).
 */
export function trackInitiateCheckout(items: OrderItem[], total: number): void {
  const validItems = toEcommerceItems(items);
  if (validItems.length === 0) return;

  const contentIds = toContentIds(items);
  if (contentIds.length === 0) return;

  const value = roundAmount(total);

  pushDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency: ECOMMERCE_CURRENCY,
      value,
      items: validItems,
    },
    meta: {
      content_ids: contentIds,
      content_type: "product",
      contents: toContents(items),
      value,
      currency: ECOMMERCE_CURRENCY,
    },
  });
}

export interface TrackPurchaseInput {
  orderId: string;
  items: OrderItem[];
  total: number;
}

/** Deterministic event id shared with the server-side Conversions API event. */
export function buildPurchaseEventId(orderId: string): string {
  return `purchase_${orderId}`;
}

/**
 * Meta Purchase / GA4 purchase.
 *
 * MUST only be called after the server confirmed order creation.
 * Guarded by sessionStorage (`meta_purchase_fired_${orderId}`) so reloading
 * the success state never produces a second Purchase event.
 * The emitted `event_id` is identical to the CAPI `event_id` for deduplication.
 */
export function trackPurchase({ orderId, items, total }: TrackPurchaseInput): void {
  const cleanOrderId = typeof orderId === "string" ? orderId.trim() : "";
  if (!cleanOrderId || cleanOrderId === "N/A") return;

  const validItems = toEcommerceItems(items);
  if (validItems.length === 0) return;

  const contentIds = toContentIds(items);
  if (contentIds.length === 0) return;

  if (purchaseAlreadyFired(cleanOrderId)) return;
  markPurchaseFired(cleanOrderId);

  const value = roundAmount(total);
  const eventId = buildPurchaseEventId(cleanOrderId);

  pushDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: cleanOrderId,
      currency: ECOMMERCE_CURRENCY,
      value,
      items: validItems,
    },
    meta: {
      event_id: eventId,
      content_ids: contentIds,
      content_type: "product",
      contents: toContents(items),
      value,
      currency: ECOMMERCE_CURRENCY,
    },
  });
}
