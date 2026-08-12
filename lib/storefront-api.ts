import type { IProduct, IProductFilters, IProductListResponse } from "@/types/product";

export async function getProducts(filters: Partial<IProductFilters> = {}): Promise<IProductListResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, String(value));
      }
    }
  });

  const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    return { products: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
  const data = await res.json();
  return {
    products: data.products || [],
    pagination: data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  try {
    const res = await fetch(`/api/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || null;
  } catch {
    return null;
  }
}
