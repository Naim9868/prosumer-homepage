"use client";

import React, { useState, memo } from "react";
import { Package, Trash2, AlertCircle } from "lucide-react";
import type { OrderItem } from "@/types/checkout";
import { QuantitySelector } from "./QuantitySelector";
import { VariantSelector } from "./VariantSelector";
import { formatCurrency, getItemImage, getInventoryStatus, getTotalPrice, getMaxQuantity } from "@/utils/checkout-utils";
import { cn } from "@/lib/utils";

interface CartItemProps {
  item: OrderItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onVariantChange: (itemId: string, variantKey: string) => void;
  onRemove: (itemId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = memo(
  ({ item, onQuantityChange, onVariantChange, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const itemImage = getItemImage(item);
    const itemTotal = getTotalPrice(item);
    const maxQuantity = getMaxQuantity(item);
    const inventoryStatus = getInventoryStatus(item);

    const isLowStock = inventoryStatus === "low-stock";
    const isOutOfStock = inventoryStatus === "out-of-stock";

    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-background-elevated transition",
          isOutOfStock
            ? "border-destructive/40 bg-destructive/5"
            : isLowStock
              ? "border-warning/40 bg-warning/5"
              : "border-border hover:border-primary/30"
        )}
      >
        <div className="flex gap-2.5 p-2.5">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {itemImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={itemImage} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package size={20} className="text-foreground-muted" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-2 text-xs font-medium text-foreground sm:text-sm">{item.name}</h4>
            {item.brand && <p className="text-[11px] text-foreground-muted">{item.brand}</p>}
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-xs font-bold text-primary sm:text-sm">{formatCurrency(itemTotal)}</span>
              <span className="text-[10px] text-foreground-muted sm:text-xs">৳{item.price.sale} × {item.quantity}</span>
            </div>
          </div>
        </div>

        {isLowStock && !isOutOfStock && (
          <div className="px-3 pb-1">
            <span className="flex items-center gap-1 text-xs text-warning">
              ⚠️ Only {item.inventory} left in stock
            </span>
          </div>
        )}

        {isOutOfStock && (
          <div className="px-3 pb-1">
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle size={12} />
              Not enough stock available (Available: {item.inventory})
            </span>
          </div>
        )}

        {item.variants && item.variants.length > 0 && (
          <VariantSelector
            variants={item.variants}
            selectedVariantKey={item.selectedVariantKey || item.variantKey}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
            onVariantSelect={(variantKey) => onVariantChange(item.id, variantKey)}
          />
        )}

        <div className="mt-0.5 flex items-center justify-between gap-2 border-t border-border px-2.5 pb-2 pt-1.5">
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="rounded-md p-1 text-destructive transition hover:bg-destructive/10"
            aria-label="Remove item"
          >
            <Trash2 size={12} />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-foreground-muted sm:text-xs">Qty:</span>
            <QuantitySelector
              quantity={item.quantity}
              maxQuantity={maxQuantity}
              onChange={(newQuantity) => onQuantityChange(item.id, newQuantity)}
              size="small"
            />
          </div>
        </div>
      </div>
    );
  }
);

CartItem.displayName = "CartItem";
