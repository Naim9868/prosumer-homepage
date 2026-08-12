import type { DeliveryType, ValidationResult } from "@/types/checkout";

interface ValidateCartRequest {
  items: Array<{
    productId: string;
    variantKey: string;
    quantity: number;
  }>;
  deliveryType: DeliveryType;
  userId?: string;
}

export const validateCart = async (data: ValidateCartRequest): Promise<ValidationResult> => {
  try {
    const response = await fetch("/api/cart/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      let errorMessage = result.error || "Validation failed";

      if (result.data?.productName) {
        errorMessage = `Product "${result.data.productName}" is not available`;
      } else if (result.data?.available !== undefined) {
        errorMessage = `Insufficient stock: only ${result.data.available} available`;
      } else if (result.data?.productId) {
        errorMessage = `Product with ID ${result.data.productId} is not available. Please remove it from your cart.`;
      }

      throw new Error(errorMessage);
    }

    if (!result.success) {
      throw new Error(result.error || "Validation failed");
    }

    return result;
  } catch (error) {
    console.error("Cart validation error:", error);
    throw error;
  }
};

export const getCheckout = async (userId?: string) => {
  try {
    const url = userId ? `/api/checkout?userId=${userId}` : "/api/checkout";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch checkout data");
    }

    return await response.json();
  } catch (error) {
    console.error("Get checkout error:", error);
    throw error;
  }
};

export const updateCheckout = async (data: Record<string, unknown>) => {
  try {
    const response = await fetch("/api/checkout", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update checkout");
    }

    return await response.json();
  } catch (error) {
    console.error("Update checkout error:", error);
    throw error;
  }
};
