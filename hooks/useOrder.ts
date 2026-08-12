"use client";
import { useState, useCallback } from "react";
import type { OrderInput } from "@/types/checkout";
import { createOrder } from "@/services/order.service";

interface UseOrderReturn {
  loading: boolean;
  orderComplete: boolean;
  orderId: string;
  error: string | null;
  submitOrder: (orderInput: OrderInput) => Promise<string>;
  resetOrder: () => void;
}

export const useOrder = (): UseOrderReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const submitOrder = useCallback(async (orderInput: OrderInput): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await createOrder(orderInput);

      if (!response.success) {
        throw new Error(response.error || "Failed to create order");
      }

      const orderIdValue = response?.data?.order?.orderId || response?.orderId || response?._id || "N/A";

      setOrderId(orderIdValue);
      setOrderComplete(true);

      return orderIdValue;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetOrder = useCallback(() => {
    setOrderComplete(false);
    setOrderId("");
    setError(null);
  }, []);

  return {
    loading,
    orderComplete,
    orderId,
    error,
    submitOrder,
    resetOrder,
  };
};
