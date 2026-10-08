/**
 * Server-side Purchase dispatch for the Meta Conversions API.
 *
 * Responsibilities:
 *  - keep the browser/server `event_id` identical (`purchase_${orderId}`)
 *  - stay idempotent: an order can never produce two independent Purchase
 *    events, and retries always reuse the SAME event id
 *  - never throw — a CAPI failure must not affect the customer order
 *  - record every attempt on the order document for later inspection/retry
 *
 * Server-only. No secret ever leaves the process.
 */

import { connectDB } from "@/lib/dbConnect";
import { OrderModel } from "@/models/Order";
import { buildPurchaseEventId, sendMetaPurchase, type MetaCustomContent } from "./capi";

/** Hard cap — CAPI is never retried forever. */
export const MAX_CAPI_ATTEMPTS = 5;

const MAX_STORED_ERROR_LENGTH = 500;
const CURRENCY_FALLBACK = "BDT";

export interface PurchaseCapiDispatchResult {
  dispatched: boolean;
  ok?: boolean;
  skippedReason?: string;
  error?: string;
}

interface OrderSnapshot {
  sku?: string;
  name?: string;
  brand?: string;
  category?: string;
}

interface OrderLine {
  productId?: unknown;
  quantity?: unknown;
  price?: { sale?: unknown };
  snapshot?: OrderSnapshot;
}

interface PurchaseOrderDoc {
  _id: unknown;
  orderId?: unknown;
  guestEmail?: unknown;
  guestPhone?: unknown;
  items?: OrderLine[];
  pricing?: { total?: unknown; currency?: unknown };
  shipping?: { email?: unknown; phone?: unknown };
  meta?: { ip?: unknown; userAgent?: unknown };
  analytics?: { meta?: { capiStatus?: unknown; capiAttempts?: unknown; fbc?: unknown; fbp?: unknown } };
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function truncateError(message: string | undefined): string | undefined {
  if (!message) return undefined;
  return message.length > MAX_STORED_ERROR_LENGTH
    ? `${message.slice(0, MAX_STORED_ERROR_LENGTH)}…`
    : message;
}

function buildOrderSummary(order: PurchaseOrderDoc): {
  contentIds: string[];
  contents: MetaCustomContent[];
  value: number;
  currency: string;
  email?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
} | null {
  const lines = Array.isArray(order.items) ? order.items : [];
  if (lines.length === 0) return null;

  const contentIds: string[] = [];
  const contents: MetaCustomContent[] = [];

  for (const line of lines) {
    const productId = asString(line.productId);
    const sku = asString(line.snapshot?.sku);
    const contentId = sku || productId;
    if (!contentId) continue;

    const quantity = asNumber(line.quantity) ?? 1;
    const itemPrice = asNumber(line.price?.sale);

    if (!contentIds.includes(contentId)) contentIds.push(contentId);

    const content: MetaCustomContent = { id: contentId, quantity };
    if (itemPrice !== undefined) content.item_price = itemPrice;
    contents.push(content);
  }

  if (contentIds.length === 0) return null;

  const value = asNumber(order.pricing?.total);
  if (value === undefined) return null;

  return {
    contentIds,
    contents,
    value,
    currency: asString(order.pricing?.currency) ?? CURRENCY_FALLBACK,
    email: asString(order.shipping?.email) ?? asString(order.guestEmail),
    phone: asString(order.shipping?.phone) ?? asString(order.guestPhone),
    ip: asString(order.meta?.ip),
    userAgent: asString(order.meta?.userAgent),
    fbc: asString(order.analytics?.meta?.fbc),
    fbp: asString(order.analytics?.meta?.fbp),
  };
}

/**
 * Claims the next CAPI attempt atomically so concurrent callers cannot both
 * decide to send for the same state. Returns the order document when the
 * attempt was claimed, otherwise `null`.
 */
async function claimAttempt(orderId: string, eventId: string): Promise<PurchaseOrderDoc | null> {
  const raw = await OrderModel.findOneAndUpdate(
    {
      orderId,
      "analytics.meta.capiStatus": { $ne: "success" },
      $or: [
        { "analytics.meta.capiAttempts": { $lt: MAX_CAPI_ATTEMPTS } },
        { "analytics.meta.capiAttempts": { $exists: false } },
      ],
    },
    {
      $set: {
        "analytics.meta.eventId": eventId,
        "analytics.meta.capiStatus": "pending",
        "analytics.meta.lastCapiAttemptAt": new Date(),
      },
      $inc: { "analytics.meta.capiAttempts": 1 },
    },
    { new: true }
  )
    .lean()
    .exec();

  if (!raw) return null;
  return raw as unknown as PurchaseOrderDoc;
}

async function persistResult(orderId: string, ok: boolean, error?: string): Promise<void> {
  const now = new Date();

  if (ok) {
    await OrderModel.updateOne(
      { orderId },
      {
        $set: { "analytics.meta.capiStatus": "success", "analytics.meta.lastCapiAttemptAt": now },
        $unset: { "analytics.meta.capiError": "" },
      }
    ).exec();
    return;
  }

  await OrderModel.updateOne(
    { orderId },
    {
      $set: {
        "analytics.meta.capiStatus": "failed",
        "analytics.meta.lastCapiAttemptAt": now,
        "analytics.meta.capiError": truncateError(error) ?? "Unknown Meta CAPI error",
      },
    }
  ).exec();
}

/**
 * Sends (or retries) the Conversions API Purchase event for an order.
 *
 * Safe to call multiple times:
 *  - successful events are never re-sent
 *  - failed events are retried with the SAME `event_id`
 *  - attempts stop after {@link MAX_CAPI_ATTEMPTS}
 */
export async function dispatchPurchaseCapi(orderId: string): Promise<PurchaseCapiDispatchResult> {
  const cleanOrderId = typeof orderId === "string" ? orderId.trim() : "";
  if (!cleanOrderId) {
    return { dispatched: false, skippedReason: "missing_order_id" };
  }

  try {
    await connectDB();

    const eventId = buildPurchaseEventId(cleanOrderId);
    const claimed = await claimAttempt(cleanOrderId, eventId);

    if (!claimed) {
      const exists = await OrderModel.exists({ orderId: cleanOrderId });
      return {
        dispatched: false,
        skippedReason: exists ? "already_sent_or_max_attempts" : "order_not_found",
      };
    }

    const summary = buildOrderSummary(claimed);
    if (!summary) {
      await persistResult(cleanOrderId, false, "Order has no trackable line items");
      return { dispatched: false, skippedReason: "invalid_order_payload" };
    }

    const result = await sendMetaPurchase({
      eventId,
      currency: summary.currency,
      value: summary.value,
      contentIds: summary.contentIds,
      contentType: "product",
      contents: summary.contents,
      email: summary.email,
      phone: summary.phone,
      clientIpAddress: summary.ip,
      clientUserAgent: summary.userAgent,
      fbc: summary.fbc,
      fbp: summary.fbp,
    });

    await persistResult(cleanOrderId, result.ok, result.error);

    if (result.ok) {
      console.log(`[meta-capi] Purchase accepted for order ${cleanOrderId} (${eventId})`);
    } else {
      console.warn(
        `[meta-capi] Purchase failed for order ${cleanOrderId} (${eventId}): ${result.error ?? "unknown error"}`
      );
    }

    return { dispatched: true, ok: result.ok, error: result.error };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unexpected Meta CAPI failure";
    console.warn(`[meta-capi] Purchase dispatch error for order ${cleanOrderId}: ${message}`);

    // Recording the failure must never break the caller.
    try {
      await persistResult(cleanOrderId, false, message);
    } catch {
      // Ignore — the next retry will record it.
    }

    return { dispatched: false, ok: false, error: message };
  }
}
