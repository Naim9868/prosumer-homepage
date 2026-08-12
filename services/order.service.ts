import type { OrderInput, OrderResponse } from "@/types/checkout";

export const createOrder = async (orderInput: OrderInput): Promise<OrderResponse> => {
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderInput),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create order");
    }

    return data;
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  }
};
