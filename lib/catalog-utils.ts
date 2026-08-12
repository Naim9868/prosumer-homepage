import type { CatalogCategory, CatalogData, CatalogProduct, CatalogReview } from "@/types/catalog";

/**
 * Pure, client-safe resolvers over a `CatalogData` payload. Used by both the
 * server-rendered homepage sections and the client builder preview so product
 * / category selection behaves identically everywhere.
 */

export function getProductsByIds(catalog: CatalogData | undefined, ids: string[], limit?: number): CatalogProduct[] {
  if (!catalog || ids.length === 0) return [];
  const map = new Map(catalog.products.map((p) => [p.id, p]));
  return ids
    .map((id) => map.get(id))
    .filter((p): p is CatalogProduct => !!p)
    .slice(0, limit ?? ids.length);
}

export function getCategoriesByIds(catalog: CatalogData | undefined, ids: string[], limit?: number): CatalogCategory[] {
  if (!catalog || ids.length === 0) return [];
  const map = new Map(catalog.categories.map((c) => [c.id, c]));
  return ids
    .map((id) => map.get(id))
    .filter((c): c is CatalogCategory => !!c)
    .slice(0, limit ?? ids.length);
}

export function getFeaturedProducts(catalog: CatalogData | undefined, limit?: number): CatalogProduct[] {
  if (!catalog) return [];
  const featured = catalog.products.filter((p) => p.featured);
  const source = featured.length > 0 ? featured : catalog.products;
  return source.slice(0, limit ?? source.length);
}

export function getNewArrivals(catalog: CatalogData | undefined, limit?: number): CatalogProduct[] {
  if (!catalog) return [];
  const sorted = [...catalog.products].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return sorted.slice(0, limit ?? sorted.length);
}

export function getDiscountedProducts(catalog: CatalogData | undefined, limit?: number): CatalogProduct[] {
  if (!catalog) return [];
  const discounted = catalog.products.filter((p) => typeof p.compareAtPrice === "number" && p.compareAtPrice > p.price);
  const source = discounted.length > 0 ? discounted : catalog.products;
  return source.slice(0, limit ?? source.length);
}

export function getReviewsByIds(catalog: CatalogData | undefined, ids: string[], limit?: number): CatalogReview[] {
  if (!catalog || ids.length === 0) return [];
  const map = new Map(catalog.reviews.map((r) => [r.id, r]));
  return ids
    .map((id) => map.get(id))
    .filter((r): r is CatalogReview => !!r)
    .slice(0, limit ?? ids.length);
}
