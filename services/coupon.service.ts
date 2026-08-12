import type { Coupon } from "@/types/checkout";

interface ApplyCouponContext {
  subtotal: number;
  userId?: string;
  productIds?: string[];
  categories?: string[];
  lines?: Array<{ productId: string; lineTotal: number }>;
}

interface ApplyCouponResponse {
  success: boolean;
  coupon?: Coupon;
  message?: string;
  error?: string;
  discountAmount?: number;
  freeShipping?: boolean;
}

export const applyCoupon = async (code: string, context?: ApplyCouponContext): Promise<ApplyCouponResponse> => {
  try {
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        subtotal: context?.subtotal || 0,
        userId: context?.userId,
        productIds: context?.productIds,
        categories: context?.categories,
        lines: context?.lines,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || data.data?.message || "Failed to apply coupon",
      };
    }

    if (data.success && data.data) {
      return {
        success: true,
        coupon: data.data.coupon || null,
        message: data.data.message || "Coupon applied successfully!",
        discountAmount: data.data.discountAmount || 0,
        freeShipping: data.data.freeShipping || false,
      };
    }

    return {
      success: false,
      message: "Failed to apply coupon",
    };
  } catch (error) {
    console.error("Apply coupon error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to apply coupon",
    };
  }
};

export const removeCoupon = async (code: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch("/api/coupons/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || "Failed to remove coupon",
      };
    }

    return {
      success: true,
      message: data.message || "Coupon removed successfully",
    };
  } catch (error) {
    console.error("Remove coupon error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to remove coupon",
    };
  }
};

export const getAvailableCoupons = async (params?: {
  userId?: string;
  subtotal?: number;
  productIds?: string[];
  categories?: string[];
}): Promise<Coupon[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append("userId", params.userId);
    if (params?.subtotal) queryParams.append("subtotal", params.subtotal.toString());
    if (params?.productIds) {
      params.productIds.forEach((id) => queryParams.append("productIds[]", id));
    }
    if (params?.categories) {
      params.categories.forEach((cat) => queryParams.append("categories[]", cat));
    }

    const response = await fetch(`/api/coupons/available?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch available coupons");
    }

    const data = await response.json();
    return data.coupons || [];
  } catch (error) {
    console.error("Get available coupons error:", error);
    return [];
  }
};
