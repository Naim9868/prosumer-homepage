"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ProductCard } from "@/components/shared/product-card";
import type { IProduct } from "@/types/product";
import { getProducts } from "@/lib/storefront-api";
import { ProductFilters, type FilterState } from "./ProductFilters";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface ProductGridProps {
  initialProducts?: IProduct[];
  initialQuery?: string;
  initialCategoryId?: string;
  initialBrandId?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialSort?: string;
  categories?: Category[];
  brands?: Brand[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  perPage?: number;
}

export function ProductGrid({
  initialProducts = [],
  initialQuery = "",
  initialCategoryId = "",
  initialBrandId = "",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialSort = "newest",
  categories = [],
  brands = [],
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  perPage = 20,
}: ProductGridProps) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [page, setPage] = useState(currentPage);
  const [totalPagesState, setTotalPagesState] = useState(totalPages);
  const [totalCountState, setTotalCountState] = useState(totalCount);
  const [filters, setFilters] = useState<FilterState>({
    query: initialQuery || "",
    categoryId: initialCategoryId || "",
    brandId: initialBrandId || "",
    minPrice: initialMinPrice || "",
    maxPrice: initialMaxPrice || "",
    sort: initialSort || "newest",
  });
  const didMountRef = useRef(false);
  const skipInitialRef = useRef(initialProducts.length > 0);

  const fetchProducts = useCallback(async (pageNum: number) => {
    try {
      const params: Record<string, string> = { sort: filters.sort, page: String(pageNum), limit: String(perPage) };
      if (filters.query) params.query = filters.query;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.brandId) params.brandId = filters.brandId;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const result = await getProducts(params);
      setProducts(result.products || []);
      setTotalCountState(result.pagination.total);
      setTotalPagesState(result.pagination.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setTotalCountState(0);
      setTotalPagesState(1);
    } finally {
      setLoading(false);
    }
  }, [filters, perPage]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      if (!skipInitialRef.current) {
        fetchProducts(page);
      }
      return;
    }
    fetchProducts(page);
  }, [fetchProducts, page]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
    setLoading(true);

    const params = new URLSearchParams();
    if (newFilters.query) params.set("q", newFilters.query);
    if (newFilters.categoryId) params.set("categoryId", newFilters.categoryId);
    if (newFilters.brandId) params.set("brandId", newFilters.brandId);
    if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
    if (newFilters.sort && newFilters.sort !== "newest") params.set("sort", newFilters.sort);

    const url = params.toString() ? `/products?${params.toString()}` : "/products";
    window.history.pushState({}, "", url);
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.brandId) params.set("brandId", filters.brandId);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
    if (p > 1) params.set("page", String(p));

    const url = params.toString() ? `/products?${params.toString()}` : "/products";
    window.history.pushState({}, "", url);
  }, [filters]);

  const pageNumbers: (number | "...")[] = [];
  if (totalPagesState <= 7) {
    for (let i = 1; i <= totalPagesState; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (page > 3) pageNumbers.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPagesState - 1, page + 1); i++) {
      pageNumbers.push(i);
    }
    if (page < totalPagesState - 2) pageNumbers.push("...");
    pageNumbers.push(totalPagesState);
  }

  return (
    <div>
      <ProductFilters
        categories={categories}
        brands={brands}
        filters={filters}
        onFilterChange={handleFilterChange}
        totalCount={totalCountState}
      />

      <div className="mt-6">
        {loading && products.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] bg-muted py-20 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No products found</h3>
            <p className="text-foreground-muted">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <>
            <div className="-mx-2 grid grid-cols-2 gap-2 sm:mx-0 sm:grid-cols-3 sm:gap-5 sm:px-0 lg:grid-cols-4 lg:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>

            {totalPagesState > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers.map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-sm text-foreground-muted">...</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPagesState}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
