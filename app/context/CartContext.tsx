"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useCart } from "@/hooks/useCart";
import type { OrderItem } from "@/types/checkout";
import type { IProductVariant } from "@/types/product";
import type { CartProductInput } from "@/lib/cart-item";

interface CartContextType {
  cartItems: OrderItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (product: CartProductInput, variant?: IProductVariant, quantity?: number) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();

  return (
    <CartContext.Provider
      value={{
        cartItems: cart.cartItems,
        cartTotal: cart.cartTotal,
        cartCount: cart.cartCount,
        addToCart: cart.addToCart,
        updateQuantity: cart.updateQuantity,
        removeFromCart: cart.removeFromCart,
        clearCart: cart.clearCart,
        getCartTotal: cart.getCartTotal,
        getCartCount: cart.getCartCount,
        isLoaded: cart.isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
