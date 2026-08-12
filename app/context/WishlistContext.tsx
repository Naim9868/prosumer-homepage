"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import type { WishlistItem } from "@/types/cart";
import type { IProductVariant } from "@/types/product";
import type { CartProductInput } from "@/lib/cart-item";

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (product: CartProductInput, selectedVariant?: IProductVariant) => boolean;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (productId: string) => boolean;
  isLoaded: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const wishlist = useWishlist();

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: wishlist.wishlistItems,
        wishlistCount: wishlist.wishlistCount,
        addToWishlist: wishlist.addToWishlist,
        removeFromWishlist: wishlist.removeFromWishlist,
        isInWishlist: wishlist.isInWishlist,
        isLoaded: wishlist.isLoaded,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlistContext must be used within a WishlistProvider");
  }
  return context;
}
