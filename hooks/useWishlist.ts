"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { WishlistItem } from "@/types/cart";
import type { IProduct, IProductVariant } from "@/types/product";
import type { CartProductInput } from "@/lib/cart-item";
import { getProductId, getProductSlug, getProductImage, getProductCategory, getProductGradient } from "@/lib/cart-item";
import type { CatalogProduct } from "@/types/catalog";

export function useWishlist() {
  const { storedValue: wishlistItems, setValue: setWishlistItems, isLoaded } = useLocalStorage<WishlistItem[]>("plbd-wishlist", []);

  const addToWishlist = useCallback(
    (product: CartProductInput, selectedVariant?: IProductVariant): boolean => {
      const productId = getProductId(product);
      if (wishlistItems.some((item) => item.productId === productId)) return false;

      const variant = selectedVariant || (product as IProduct).variants?.find((v) => v.isDefault) || (product as IProduct).variants?.[0];
      const productImage = getProductImage(product);

      const newItem: WishlistItem = {
        id: productId,
        productId,
        name: product.name,
        slug: getProductSlug(product),
        price: variant?.price || (product as CatalogProduct).price || (product as IProduct).lowestPrice || 0,
        compareAtPrice: variant?.compareAtPrice || (product as CatalogProduct).compareAtPrice,
        category: getProductCategory(product),
        gradient: getProductGradient(product),
        image: productImage,
        sku: variant?.sku,
        variantKey: variant?.variantKey,
      };

      setWishlistItems([...wishlistItems, newItem]);
      return true;
    },
    [wishlistItems, setWishlistItems]
  );

  const removeFromWishlist = useCallback(
    (id: string) => {
      setWishlistItems((items) => items.filter((item) => item.id !== id));
    },
    [setWishlistItems]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlistItems.some((item) => item.productId === productId);
    },
    [wishlistItems]
  );

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  return {
    wishlistItems,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isLoaded,
  };
}
