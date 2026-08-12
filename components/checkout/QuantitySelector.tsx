"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  maxQuantity,
  onChange,
  disabled = false,
  size = "small",
}) => {
  const sizeClasses = {
    small: { container: "gap-2", button: "w-6 h-6", icon: "h-3 w-3", text: "w-6 text-center text-sm font-medium" },
    medium: { container: "gap-3", button: "w-8 h-8", icon: "h-4 w-4", text: "w-8 text-center text-base font-medium" },
    large: { container: "gap-4", button: "w-10 h-10", icon: "h-5 w-5", text: "w-10 text-center text-lg font-medium" },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn("flex items-center", classes.container)}>
      <button
        type="button"
        onClick={() => quantity > 1 && onChange(quantity - 1)}
        className={cn(classes.button, "flex items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/70 disabled:opacity-50")}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className={classes.icon} />
      </button>

      <span className={cn(classes.text, "text-foreground")}>{quantity}</span>

      <button
        type="button"
        onClick={() => quantity < maxQuantity && onChange(quantity + 1)}
        className={cn(classes.button, "flex items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/70 disabled:opacity-50")}
        disabled={disabled || quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus className={classes.icon} />
      </button>
    </div>
  );
};
