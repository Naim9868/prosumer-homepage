"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  query: string;
  categoryId: string;
  brandId: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

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

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalCount: number;
}

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_low" },
  { label: "Price: High to Low", value: "price_high" },
  { label: "Most Popular", value: "popular" },
  { label: "Top Rated", value: "rating" },
];

export function ProductFilters({
  categories,
  brands,
  filters,
  onFilterChange,
  totalCount,
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: false,
    brand: false,
    price: false,
  });

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange]
  );

  const clearAll = useCallback(() => {
    onFilterChange({
      query: "",
      categoryId: "",
      brandId: "",
      minPrice: "",
      maxPrice: "",
      sort: filters.sort,
    });
  }, [filters.sort, onFilterChange]);

  const hasActiveFilters = filters.query || filters.categoryId || filters.brandId || filters.minPrice || filters.maxPrice;

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCategoryName = categories.find((c) => c.id === filters.categoryId)?.name;
  const selectedBrandName = brands.find((b) => b.id === filters.brandId)?.name;

  return (
    <div className="space-y-4">
      {/* Back to Home (mobile: above search, desktop: inline) */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground lg:hidden"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground lg:inline-flex"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="relative mx-auto w-full max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => updateFilter("query", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground lg:hidden"
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-foreground-muted">Active:</span>
          {filters.query && (
            <Chip label={`"${filters.query}"`} onRemove={() => updateFilter("query", "")} />
          )}
          {filters.categoryId && selectedCategoryName && (
            <Chip label={selectedCategoryName} onRemove={() => updateFilter("categoryId", "")} />
          )}
          {filters.brandId && selectedBrandName && (
            <Chip label={selectedBrandName} onRemove={() => updateFilter("brandId", "")} />
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Chip
              label={`${filters.minPrice || "0"} - ${filters.maxPrice || "∞"}`}
              onRemove={() => { updateFilter("minPrice", ""); updateFilter("maxPrice", ""); }}
            />
          )}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter panel */}
      <div className={cn(
        "flex flex-col gap-4 lg:flex-row",
        mobileOpen ? "block" : "hidden lg:flex"
      )}>
        {/* Desktop: inline filters */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Category */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleSection("category")}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                filters.categoryId ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary/50"
              )}
            >
              {selectedCategoryName || "Category"}
              {expandedSections.category ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {expandedSections.category && (
              <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-card p-2 shadow-lg">
                <button
                  type="button"
                  onClick={() => { updateFilter("categoryId", ""); setExpandedSections((p) => ({ ...p, category: false })); }}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                    !filters.categoryId ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { updateFilter("categoryId", cat.id); setExpandedSections((p) => ({ ...p, category: false })); }}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                      filters.categoryId === cat.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleSection("brand")}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                filters.brandId ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary/50"
              )}
            >
              {selectedBrandName || "Brand"}
              {expandedSections.brand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {expandedSections.brand && (
              <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-card p-2 shadow-lg">
                <button
                  type="button"
                  onClick={() => { updateFilter("brandId", ""); setExpandedSections((p) => ({ ...p, brand: false })); }}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                    !filters.brandId ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => { updateFilter("brandId", brand.id); setExpandedSections((p) => ({ ...p, brand: false })); }}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                      filters.brandId === brand.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                    )}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleSection("price")}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                (filters.minPrice || filters.maxPrice) ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary/50"
              )}
            >
              {(filters.minPrice || filters.maxPrice) ? `${filters.minPrice || "0"} - ${filters.maxPrice || "∞"}` : "Price"}
              {expandedSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {expandedSections.price && (
              <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-border bg-card p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    placeholder="Min"
                    min={0}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
                  />
                  <span className="text-foreground-muted">—</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    placeholder="Max"
                    min={0}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedSections((p) => ({ ...p, price: false }))}
                  className="mt-2 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sort (right side) */}
        <div className="flex items-center gap-3">
          <p className="text-sm text-foreground-muted">
            <span className="font-semibold text-foreground">{totalCount}</span> products
          </p>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-primary/70">
        <X size={12} />
      </button>
    </span>
  );
}
