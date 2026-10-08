import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { OrderModel } from "@/models/Order";
import { CouponModel } from "@/models/Coupon";
import { ProductModel } from "@/models/Product";
import { Types } from "mongoose";
import type { OrderInput } from "@/types/checkout";
import { buildPurchaseEventId } from "@/lib/meta/capi";
import { dispatchPurchaseCapi } from "@/lib/meta/purchase-capi";

interface VariantDoc {
  sku?: string;
  variantKey?: string;
  price?: number;
  compareAtPrice?: number;
  inventory?: number;
  reserved?: number;
  isDefault?: boolean;
}

interface ProductLeanDoc {
  _id: unknown;
  name?: string;
  totalInventory?: number;
  lowestPrice?: number;
  highestPrice?: number;
  variants?: VariantDoc[];
}

interface CouponLeanDoc {
  _id: unknown;
  code?: string;
  type?: string;
  value?: number;
  maxDiscount?: number;
}

function generateOrderId(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PL${y}${m}${d}-${rand}`;
}

const MAX_ATTRIBUTION_LENGTH = 1024;

/** Rejects anything that is not a short printable-ASCII Meta attribution value. */
function sanitizeAttribution(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_ATTRIBUTION_LENGTH) return undefined;
  for (let i = 0; i < trimmed.length; i += 1) {
    const code = trimmed.charCodeAt(i);
    if (code < 0x20 || code > 0x7e) return undefined;
  }
  return trimmed;
}

/** Best-effort client IP for Conversions API matching. */
function resolveClientIp(req: NextRequest): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return sanitizeAttribution(first);
  }
  return sanitizeAttribution(req.headers.get("x-real-ip"));
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body: OrderInput = await req.json();

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: "No items in order" }, { status: 400 });
    }

    if (!body.shipping?.name || !body.shipping?.phone || !body.shipping?.address) {
      return NextResponse.json({ success: false, error: "Shipping information is required" }, { status: 400 });
    }

    if (!["INSIDE_DHAKA", "OUTSIDE_DHAKA"].includes(body.deliveryType)) {
      return NextResponse.json({ success: false, error: "Invalid delivery type" }, { status: 400 });
    }

    // Re-validate products & inventory before placing the order
    const processedItems: unknown[] = [];
    let subtotal = 0;
    let itemDiscount = 0;

    for (const item of body.items) {
      if (!Types.ObjectId.isValid(item.productId)) {
        return NextResponse.json({ success: false, error: `Invalid product ID: ${item.productId}` }, { status: 400 });
      }

      const productRaw = await ProductModel.findOne({
        _id: new Types.ObjectId(item.productId),
        deletedAt: null,
        status: "active",
      })
        .lean()
        .exec();

      if (!productRaw) {
        return NextResponse.json(
          { success: false, error: `Product "${item.snapshot.name}" is no longer available` },
          { status: 404 }
        );
      }

      const product = productRaw as unknown as ProductLeanDoc;
      const variants = product.variants || [];
      let variant: VariantDoc | null = null;
      if (item.variantKey && variants.length > 0) {
        variant = variants.find((v) => v.variantKey === item.variantKey) || null;
      }
      if (!variant && variants.length > 0) {
        variant = variants.find((v) => v.isDefault) || variants[0];
      }

      const availableStock = variant?.inventory ?? product.totalInventory ?? 0;
      const reserved = variant?.reserved || 0;
      const available = Math.max(0, availableStock - reserved);

      if (available < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${item.snapshot.name}. Only ${available} available.` },
          { status: 400 }
        );
      }

      const salePrice = variant?.price ?? product.lowestPrice ?? 0;
      const originalPrice = variant?.compareAtPrice ?? product.highestPrice ?? salePrice;
      const lineTotal = salePrice * item.quantity;

      subtotal += lineTotal;
      itemDiscount += Math.max(0, (originalPrice - salePrice) * item.quantity);

      processedItems.push({
        productId: new Types.ObjectId(item.productId),
        variantKey: item.variantKey || "default",
        snapshot: {
          name: item.snapshot.name,
          slug: item.snapshot.slug,
          image: item.snapshot.image,
          sku: item.snapshot.sku || variant?.sku,
          brand: item.snapshot.brand,
          category: item.snapshot.category,
          attributes: item.snapshot.attributes,
        },
        price: { original: originalPrice, sale: salePrice },
        quantity: item.quantity,
        total: lineTotal,
      });
    }

    // Validate coupon if provided
    let coupon: { couponId: unknown; code?: string; type?: string; value?: number; discountAmount: number } | undefined;
    if (body.couponCode) {
      const foundCoupon = await CouponModel.findOne({ code: body.couponCode.toUpperCase(), active: true })
        .lean()
        .exec();
      if (!foundCoupon) {
        return NextResponse.json({ success: false, error: "Invalid coupon code" }, { status: 400 });
      }

      const couponDoc = foundCoupon as unknown as CouponLeanDoc;
      let discountAmount = 0;
      if (couponDoc.type === "FIXED") {
        discountAmount = Math.min(Number(couponDoc.value) || 0, subtotal);
      } else if (couponDoc.type === "PERCENTAGE") {
        discountAmount = (subtotal * Number(couponDoc.value)) / 100;
        if (couponDoc.maxDiscount) {
          discountAmount = Math.min(discountAmount, Number(couponDoc.maxDiscount));
        }
      }

      coupon = {
        couponId: couponDoc._id,
        code: couponDoc.code,
        type: couponDoc.type,
        value: Number(couponDoc.value) || 0,
        discountAmount: Math.round(discountAmount * 100) / 100,
      };

      // Increment usage count
      await CouponModel.updateOne({ _id: couponDoc._id }, { $inc: { usedCount: 1 } }).exec();
    }

    const deliveryCharge = body.deliveryType === "INSIDE_DHAKA" ? 60 : 120;
    const couponDiscount = body.coupon?.discountAmount ?? coupon?.discountAmount ?? body.pricing?.couponDiscount ?? 0;
    const total = Math.max(0, subtotal - couponDiscount + deliveryCharge);

    const orderId = generateOrderId();

    const clientIp = resolveClientIp(req);
    const userAgent = sanitizeAttribution(req.headers.get("user-agent"));
    const attributionFbc = sanitizeAttribution(body.analytics?.fbc);
    const attributionFbp = sanitizeAttribution(body.analytics?.fbp);

    const requestMeta: Record<string, unknown> = {};
    if (clientIp) requestMeta.ip = clientIp;
    if (userAgent) requestMeta.userAgent = userAgent;

    const analyticsMeta: Record<string, unknown> = {
      eventId: buildPurchaseEventId(orderId),
      capiStatus: "pending",
      capiAttempts: 0,
    };
    if (attributionFbc) analyticsMeta.fbc = attributionFbc;
    if (attributionFbp) analyticsMeta.fbp = attributionFbp;

    const order = await OrderModel.create({
      orderId,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      userId: body.userId ? new Types.ObjectId(body.userId) : undefined,
      items: processedItems,
      pricing: {
        subtotal,
        itemDiscount,
        couponDiscount,
        campaignDiscount: 0,
        deliveryCharge,
        tax: 0,
        total,
        currency: "BDT",
      },
      coupon,
      status: "PENDING",
      shipping: {
        name: body.shipping.name,
        phone: body.shipping.phone,
        email: body.shipping.email,
        address: body.shipping.address,
        area: body.shipping.area,
        city: body.shipping.city,
        division: body.shipping.division,
      },
      delivery: { type: body.deliveryType },
      notes: body.notes?.map((n) => ({ text: n.text })) || [],
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "PENDING",
      meta: requestMeta,
      analytics: { meta: analyticsMeta },
    });

    // Meta Conversions API is scheduled AFTER the order is committed and runs
    // outside the response path, so a CAPI failure can never fail the order.
    after(() => dispatchPurchaseCapi(orderId));

    return NextResponse.json({
      success: true,
      data: { order: { orderId: order.orderId, _id: String(order._id) } },
      orderId: order.orderId,
      _id: String(order._id),
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
}
