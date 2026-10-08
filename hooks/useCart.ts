"use client";

import { useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { OrderItem } from "@/types/checkout";
import type { IProductVariant } from "@/types/product";
import type { CartProductInput } from "@/lib/cart-item";
import { buildCartItem } from "@/lib/cart-item";
import { trackAddToCart } from "@/lib/analytics/events";

export function useCart() {
  const { storedValue: cartItems, setValue: setCartItems, isLoaded } = useLocalStorage<OrderItem[]>("plbd-cart", []);

  const addToCart = useCallback(
    (product: CartProductInput, variant?: IProductVariant, quantity: number = 1): Promise<boolean> => {
      const newItem = buildCartItem(product, variant, quantity);

      const existingItemIndex = cartItems.findIndex(
        (item) => item.productId === newItem.productId && item.variantKey === newItem.variantKey
      );

      if (existingItemIndex > -1) {
        setCartItems((prevItems) => {
          const updated = [...prevItems];
          updated[existingItemIndex] = {
            ...updated[existingItemIndex],
            quantity: updated[existingItemIndex].quantity + quantity,
          };
          return updated;
        });
      } else {
        setCartItems((prev) => [...prev, newItem]);
      }

      // Fire only after the cart mutation succeeded, and only for the units
      // that were actually added (quantity is preserved by buildCartItem).
      if (quantity > 0) {
        trackAddToCart([newItem]);
      }

      return Promise.resolve(true);
    },
    [cartItems, setCartItems]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setCartItems((items) => items.filter((item) => item.id !== id));
    },
    [setCartItems]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity } : item)));
    },
    [setCartItems, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, [setCartItems]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price.sale * item.quantity, 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => getCartTotal(), [getCartTotal]);
  const cartCount = useMemo(() => getCartCount(), [getCartCount]);

  return {
    cartItems,
    cartTotal,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    isLoaded,
  };
}
