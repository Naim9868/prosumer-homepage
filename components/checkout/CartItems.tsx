"use client";

import React from "react";
import type { OrderItem } from "@/types/checkout";
import { CartItem } from "./CartItem";

interface CartItemsProps {
  items: OrderItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onVariantChange: (itemId: string, variantKey: string) => void;
  onRemove: (itemId: string) => void;
  maxHeight?: string;
}

export const CartItems: React.FC<CartItemsProps> = ({
  items,
  onQuantityChange,
  onVariantChange,
  onRemove,
  maxHeight = "max-h-[300px] sm:max-h-[400px]",
}) => {
  return (
    <div className={`space-y-2 ${maxHeight} overflow-y-auto pr-1`}>
      {items.map((item, index) => (
        <CartItem
          key={`${item.id}-${index}`}
          item={item}
          onQuantityChange={onQuantityChange}
          onVariantChange={onVariantChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
