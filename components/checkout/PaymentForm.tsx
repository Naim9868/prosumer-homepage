"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import type { PaymentMethod } from "@/types/checkout";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ paymentMethod, onPaymentMethodChange }) => {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <CreditCard className="h-3.5 w-3.5 text-primary" /> Payment Method
      </h3>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label
          className={cn(
            "flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 px-3 py-2.5 transition",
            paymentMethod === "COD"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          )}
        >
          <input
            type="radio"
            name="payment"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
            className="text-primary"
          />
          <div>
            <div className="text-sm font-medium text-foreground">Cash on Delivery</div>
            <div className="text-xs text-foreground-muted">Pay when you receive</div>
          </div>
        </label>

        <label className="flex flex-1 cursor-not-allowed items-center gap-3 rounded-lg border-2 border-border px-3 py-2.5 opacity-50">
          <input type="radio" disabled className="text-primary" />
          <div>
            <div className="text-sm font-medium text-foreground">Online Payment</div>
            <div className="text-xs text-foreground-muted">Coming Soon</div>
          </div>
        </label>
      </div>
    </div>
  );
};
