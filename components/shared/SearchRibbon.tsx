"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import type { IProduct } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ApertureMark } from "@/components/shared/layout-primitives";

interface SearchRibbonProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function SearchRibbon({ isOpen, onClose, className }: SearchRibbonProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const delayDebounce = setTimeout(async () => {
      const q = searchQuery.trim();
      if (!q) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/products?query=${encodeURIComponent(q)}&limit=6`, { cache: "no-store" });
        const data = await res.json();
        setSearchResults(data.products || []);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        setSearchQuery("");
      }
    };
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const goToProduct = (slug: string) => {
    onClose();
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/product/${slug}`);
  };

  const goToShop = () => {
    onClose();
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      goToShop();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className={cn(
            "fixed inset-x-0 top-[72px] z-50 px-4 sm:px-6",
            "lg:absolute lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:top-full lg:mt-2 lg:w-[540px] lg:px-0",
            className
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background-elevated/95 shadow-2xl shadow-black/5 backdrop-blur-xl">
              <form onSubmit={handleSearchSubmit} className="relative flex w-full items-center">
                <span className="flex-shrink-0 pl-5 text-foreground-muted">
                  <Search className="h-[18px] w-[18px]" />
                </span>
                <input
                  ref={inputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="I am shopping for..."
                  className="w-full bg-transparent px-3 py-3.5 text-sm text-foreground outline-none focus:outline-none focus-visible:outline-none focus:shadow-none placeholder:text-foreground-muted [&::-webkit-search-cancel-button]:hidden"
                />

                {searchLoading && <Loader2 className="absolute right-10 h-4 w-4 animate-spin text-primary" />}

                {searchQuery && !searchLoading && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-10 rounded-full p-1 text-foreground-muted transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setSearchQuery("");
                  }}
                  aria-label="Close search"
                  className="m-1.5 flex-shrink-0 rounded-full p-2 text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>

              {searchQuery.trim() && (
                <div className="max-h-[60vh] overflow-y-auto border-t border-border lg:max-h-[380px]">
                  {searchLoading ? (
                    <div className="py-8 text-center text-sm text-foreground-muted">
                      Searching for &quot;{searchQuery}&quot;...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => goToProduct(product.slug)}
                          className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted"
                        >
                          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                            {product.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.thumbnail} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                              <ApertureMark className="h-4 w-4 text-foreground-muted" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-foreground-muted">
                              {product.category && typeof product.category === "object" ? product.category.name : ""}
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-primary">{formatCurrency(product.lowestPrice || 0)}</p>
                        </button>
                      ))}
                      <button
                        onClick={goToShop}
                        className="flex w-full items-center justify-center gap-1.5 border-t border-border py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-muted"
                      >
                        View all results for &quot;{searchQuery}&quot;
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="py-8 text-center text-sm text-foreground-muted">
                      No products found for &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
