import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { CouponModel } from "@/models/Coupon";

interface CouponLeanDoc {
  _id: unknown;
  code?: string;
  type?: string;
  value?: number;
  description?: string;
  usageLimit?: number;
  usedCount?: number;
  minOrder?: number;
  maxDiscount?: number;
  allowedUsers?: Array<{ toString(): string } | string>;
  allowedProducts?: Array<{ toString(): string } | string>;
  allowedCategories?: string[];
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId") || undefined;
    const subtotal = parseFloat(searchParams.get("subtotal") || "0");
    const productIds = searchParams.getAll("productIds[]") || [];
    const categories = searchParams.getAll("categories[]") || [];

    const now = new Date();
    const query: Record<string, unknown> = {
      active: true,
      $or: [{ startDate: { $lte: now } }, { startDate: { $exists: false } }],
      $and: [{ $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }] }],
    };

    if (subtotal > 0) {
      query.$and = [
        ...(query.$and as unknown[]),
        { $or: [{ minOrder: { $lte: subtotal } }, { minOrder: { $exists: false } }] },
      ];
    }

    const coupons = await CouponModel.find(query).sort({ createdAt: -1 }).limit(20).lean().exec();
    const couponDocs = coupons as unknown as CouponLeanDoc[];

    const filtered = couponDocs
      .filter((c) => {
        if (!c.usageLimit) return true;
        return (c.usedCount || 0) < c.usageLimit;
      })
      .filter((c) => {
        if (userId && c.allowedUsers && c.allowedUsers.length > 0) {
          if (Types.ObjectId.isValid(userId)) {
            return c.allowedUsers.some((u) => u.toString() === userId);
          }
          return false;
        }
        return true;
      })
      .filter((c) => {
        if (c.allowedProducts && c.allowedProducts.length > 0 && productIds.length > 0) {
          return productIds.some((pid) => c.allowedProducts?.some((ap) => ap.toString() === pid) ?? false);
        }
        return true;
      })
      .filter((c) => {
        if (c.allowedCategories && c.allowedCategories.length > 0 && categories.length > 0) {
          return categories.some((cat) => c.allowedCategories?.includes(cat) ?? false);
        }
        return true;
      });

    return NextResponse.json({
      success: true,
      coupons: filtered.map((c) => ({
        code: c.code,
        type: c.type,
        value: Number(c.value) || 0,
        description: c.description,
        minOrder: c.minOrder,
        maxDiscount: c.maxDiscount,
      })),
    });
  } catch (error) {
    console.error("Get available coupons error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch available coupons" },
      { status: 500 }
    );
  }
}
