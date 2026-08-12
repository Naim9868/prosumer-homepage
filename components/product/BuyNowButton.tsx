"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartContext } from "@/app/context/CartContext";
import { useModal } from "@/app/context/OrderModalContext";
import type { IProduct, IProductVariant } from "@/types/product";
import { buildCartItem } from "@/lib/cart-item";
import { cn } from "@/lib/utils";

interface BuyNowButtonProps {
  product: IProduct;
  variant?: IProductVariant;
  quantity?: number;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showModal?: boolean;
  onSuccess?: () => void;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export default function BuyNowButton({
  product,
  variant,
  quantity = 1,
  buttonVariant = "default",
  buttonSize = "default",
  className = "",
  showModal = true,
  onSuccess,
  children,
  onClick,
  disabled = false,
}: BuyNowButtonProps) {
  const { addToCart } = useCartContext();
  const { openOrderModal } = useModal();
  const [isAdding, setIsAdding] = useState(false);

  const getVariantStyles = () => {
    switch (buttonVariant) {
      case "destructive":
        return "bg-destructive hover:bg-destructive/90 text-white";
      case "outline":
        return "border-2 border-border hover:bg-muted text-foreground";
      case "secondary":
        return "bg-secondary hover:bg-secondary/90 text-secondary-foreground";
      case "ghost":
        return "hover:bg-muted text-foreground";
      case "link":
        return "text-primary underline-offset-4 hover:underline hover:bg-transparent";
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
    }
  };

  const getSizeStyles = () => {
    switch (buttonSize) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "lg":
        return "px-6 py-3 text-lg";
      case "icon":
        return "h-10 w-10 p-2";
      default:
        return "px-4 py-2 text-base";
    }
  };

  const handleBuyNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    if (onClick) {
      onClick(e);
      return;
    }

    setIsAdding(true);
    try {
      const item = buildCartItem(product, variant, quantity);
      const success = await addToCart(product, variant, quantity);

      if (success) {
        if (showModal) {
          openOrderModal([item]);
          if (onSuccess) onSuccess();
        } else {
          window.location.href = "/checkout";
        }
      }
    } catch (error) {
      console.error("Error buying now:", error);
      alert("Failed to process buy now. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = isAdding || disabled;

  return (
    <>
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          getVariantStyles(),
          getSizeStyles(),
          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className
        )}
        onClick={handleBuyNow}
        disabled={isDisabled}
        aria-label={typeof children === "string" ? children : "Buy Now"}
      >
        {isAdding ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-4 w-4 flex-shrink-0" />
{children || "Buy Now"}
        </>
      )}
      </button>
    </>
  );
}