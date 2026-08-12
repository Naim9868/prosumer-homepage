import type { OrderItem } from "@/types/checkout";

export type CartItem = OrderItem;

export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  sku?: string;
  variantKey?: string;
  category?: string;
  gradient?: string;
  compareAtPrice?: number;
}

export type { OrderItem };
