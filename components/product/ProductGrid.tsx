"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ProductCard } from "@/components/shared/product-card";
import type { IProduct } from "@/types/product";
import { getProducts } from "@/lib/storefront-api";

interface ProductGridProps {
  initialProducts?: IProduct[];
  categoryId?: string;
  initialQuery?: string;
}

export function ProductGrid({ initialProducts = [], categoryId, initialQuery }: ProductGridProps) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [sortBy, setSortBy] = useState("newest");
  const [totalCount, setTotalCount] = useState(initialProducts.length);
  const didMountRef = useRef(false);
  const skipInitialRef = useRef(initialProducts.length > 0);

  const fetchProducts = useCallback(async () => {
    try {
      const result = await getProducts({ sort: sortBy, categoryId, query: initialQuery });
      setProducts(result.products || []);
      setTotalCount(result.pagination.total);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [sortBy, categoryId, initialQuery]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      if (!skipInitialRef.current) {
        fetchProducts();
      }
      return;
    }
    fetchProducts();
  }, [fetchProducts]);

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setLoading(true);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-foreground-muted">
          Showing <span className="font-semibold text-foreground">{totalCount}</span> products
        </p>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-lg border border-border bg-background-elevated px-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {products.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] bg-muted py-20 text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No products found</h3>
          <p className="text-foreground-muted">Try adjusting your filters or search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
