import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { CouponModel } from "@/models/Coupon";
import { Types } from "mongoose";

interface ApplyCouponParams {
  code: string;
  subtotal: number;
  userId?: string;
  productIds?: string[];
  categories?: string[];
  lines?: Array<{ productId: string; lineTotal: number }>;
}

interface CouponLeanDoc {
  _id: unknown;
  code?: string;
  type?: string;
  value?: number;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number;
  usedCount?: number;
  minOrder?: number;
  maxDiscount?: number;
  allowedUsers?: Array<{ toString(): string } | string>;
  allowedProducts?: Array<{ toString(): string } | string>;
  allowedCategories?: string[];
  active?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { code, subtotal, userId, productIds, categories, lines }: ApplyCouponParams = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    if (subtotal === undefined || subtotal < 0) {
      return NextResponse.json({ success: false, error: "Valid subtotal is required" }, { status: 400 });
    }

    const couponRaw = await CouponModel.findOne({ code: code.toUpperCase(), active: true }).lean().exec();

    if (!couponRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coupon code",
          data: { valid: false, message: "Coupon not found or inactive" },
        },
        { status: 404 }
      );
    }

    const coupon: CouponLeanDoc = couponRaw as unknown as CouponLeanDoc;

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json(
        { success: false, error: "Coupon is not yet active", data: { valid: false, message: "Coupon is not yet active" } },
        { status: 400 }
      );
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json(
        { success: false, error: "Coupon has expired", data: { valid: false, message: "Coupon has expired" } },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return NextResponse.json(
        {
          success: false,
          error: "Coupon usage limit reached",
          data: { valid: false, message: "Coupon usage limit reached" },
        },
        { status: 400 }
      );
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount of ${coupon.minOrder} required`,
          data: { valid: false, message: `Minimum order amount of ${coupon.minOrder} required`, minOrder: coupon.minOrder },
        },
        { status: 400 }
      );
    }

    if (userId && coupon.allowedUsers && coupon.allowedUsers.length > 0 && Types.ObjectId.isValid(userId)) {
      const userObjectId = new Types.ObjectId(userId);
      const isAllowed = coupon.allowedUsers.some((allowedUser) => allowedUser.toString() === userObjectId.toString());
      if (!isAllowed) {
        return NextResponse.json(
          {
            success: false,
            error: "Coupon not available for this user",
            data: { valid: false, message: "Coupon not available for this user" },
          },
          { status: 400 }
        );
      }
    }

    if (coupon.allowedProducts && coupon.allowedProducts.length > 0 && productIds) {
      const hasAllowedProduct = productIds.some((pid: string) =>
        coupon.allowedProducts?.some((allowedProduct) => allowedProduct.toString() === pid) ?? false
      );
      if (!hasAllowedProduct) {
        return NextResponse.json(
          {
            success: false,
            error: "Coupon not applicable to these products",
            data: { valid: false, message: "Coupon not applicable to these products" },
          },
          { status: 400 }
        );
      }
    }

    if (coupon.allowedCategories && coupon.allowedCategories.length > 0 && categories) {
      const hasAllowedCategory = categories.some((cat: string) => coupon.allowedCategories!.includes(cat));
      if (!hasAllowedCategory) {
        return NextResponse.json(
          {
            success: false,
            error: "Coupon not applicable to these categories",
            data: { valid: false, message: "Coupon not applicable to these categories" },
          },
          { status: 400 }
        );
      }
    }

    let discountAmount = 0;
    let freeShipping = false;

    if (coupon.type === "FREE_SHIPPING") {
      freeShipping = true;
    } else if (coupon.type === "FIXED") {
      discountAmount = Math.min(Number(coupon.value) || 0, subtotal);
    } else if (coupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
      }
    }

    if (coupon.allowedProducts && coupon.allowedProducts.length > 0 && lines) {
      let applicableTotal = 0;
      lines.forEach((line: { productId: string; lineTotal: number }) => {
        const isProductAllowed = coupon.allowedProducts!.some(
          (allowedProduct) => allowedProduct.toString() === line.productId
        );
        if (isProductAllowed) {
          applicableTotal += line.lineTotal;
        }
      });

      if (applicableTotal > 0) {
        if (coupon.type === "FIXED") {
          discountAmount = Math.min(Number(coupon.value) || 0, applicableTotal);
        } else if (coupon.type === "PERCENTAGE") {
          discountAmount = (applicableTotal * Number(coupon.value)) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
          }
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Coupon not applicable to any items in cart",
            data: { valid: false, message: "Coupon not applicable to any items in cart" },
          },
          { status: 400 }
        );
      }
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        discountAmount,
        freeShipping,
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value) || 0,
          description: coupon.description,
          minOrder: coupon.minOrder,
          maxDiscount: coupon.maxDiscount,
        },
        message: "Coupon applied successfully",
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
