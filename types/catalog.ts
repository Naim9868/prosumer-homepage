/**
 * Catalog types — the read-only shape of real MongoDB catalog data
 * (products + categories) as served by `lib/catalog.ts` and the
 * `/api/catalog` route. These are the types every product/category
 * homepage section, builder picker, search ribbon, and cart/wishlist
 * consumer works with.
 */

export type CatalogStock = "in-stock" | "low-stock" | "preorder";

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  categoryId: string;
  brand?: string;
  brandSlug?: string;
  brandId?: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  stock: CatalogStock;
  badge?: string;
  image: string;
  images: string[];
  gradient: string;
  featured: boolean;
  createdAt: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  gradient: string;
  parentId: string | null;
}

export interface CatalogReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  product: string;
  productId: string;
  image: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface CatalogData {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  reviews: CatalogReview[];
}
