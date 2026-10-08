import { NextRequest, NextResponse } from "next/server";
import { dispatchPurchaseCapi, MAX_CAPI_ATTEMPTS } from "@/lib/meta/purchase-capi";

/**
 * Safe server-side retry for the Meta Conversions API Purchase event.
 *
 * - Re-uses the deterministic `purchase_${orderId}` event id (idempotent).
 * - Never re-sends a Purchase that already succeeded.
 * - Bounded by MAX_CAPI_ATTEMPTS, so it cannot loop forever.
 * - Runs entirely server-side; the CAPI access token is never exposed.
 *
 * Body: { "orderId": "PL251007-ABCDEFG" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { orderId?: unknown } | null;
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
    }

    const result = await dispatchPurchaseCapi(orderId);

    if (result.skippedReason === "order_not_found") {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (result.skippedReason === "already_sent_or_max_attempts") {
      return NextResponse.json({
        success: true,
        data: {
          dispatched: false,
          skippedReason: result.skippedReason,
          maxAttempts: MAX_CAPI_ATTEMPTS,
        },
      });
    }

    if (!result.dispatched) {
      return NextResponse.json({
        success: false,
        error: result.error ?? result.skippedReason ?? "Meta CAPI dispatch failed",
        data: result,
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.warn(
      `[meta-capi] retry endpoint error: ${error instanceof Error ? error.message : "unknown error"}`
    );
    return NextResponse.json({ success: false, error: "Failed to retry Meta CAPI event" }, {
      status: 500,
    });
  }
}
