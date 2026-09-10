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
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <User className="h-3.5 w-3.5 text-primary" /> Customer Information
      </h3>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        <div>
          <label className="text-xs font-medium text-foreground">Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={cn(
              "w-full rounded-lg border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent",
              errors.name ? "border-destructive" : "border-border"
            )}
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-0.5 text-xs text-destructive">{errors.name}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={cn(
              "w-full rounded-lg border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent",
              errors.phone ? "border-destructive" : "border-border"
            )}
            placeholder="017XXXXXXXX"
          />
          {errors.phone && <p className="mt-0.5 text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={cn(
            "w-full rounded-lg border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent",
            errors.email ? "border-destructive" : "border-border"
          )}
          placeholder="john@example.com"
        />
        {errors.email && <p className="mt-0.5 text-xs text-destructive">{errors.email}</p>}
      </div>
    </div>
  );
};
