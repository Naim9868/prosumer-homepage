"use client";

import React from "react";
import { User } from "lucide-react";
import type { CheckoutFormData } from "@/types/checkout";
import { cn } from "@/lib/utils";

interface CustomerFormProps {
  name: string;
  phone: string;
  email: string;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  name,
  phone,
  email,
  errors,
  onNameChange,
  onPhoneChange,
  onEmailChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-semibold text-foreground">
        <User className="h-4 w-4 text-primary" /> Customer Information
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={cn(
              "w-full rounded-xl border bg-background-elevated px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent sm:py-3",
              errors.name ? "border-destructive" : "border-border"
            )}
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={cn(
              "w-full rounded-xl border bg-background-elevated px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent sm:py-3",
              errors.phone ? "border-destructive" : "border-border"
            )}
            placeholder="017XXXXXXXX"
          />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={cn(
            "w-full rounded-xl border bg-background-elevated px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent sm:py-3",
            errors.email ? "border-destructive" : "border-border"
          )}
          placeholder="john@example.com"
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
      </div>
    </div>
  );
};
