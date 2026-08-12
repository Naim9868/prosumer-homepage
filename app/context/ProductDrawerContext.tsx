"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { IProduct } from "@/types/product";

interface ProductDrawerState {
  product: IProduct | null;
  isOpen: boolean;
  openDrawer: (product: IProduct) => void;
  closeDrawer: () => void;
}

const ProductDrawerContext = createContext<ProductDrawerState | undefined>(undefined);

export function ProductDrawerProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback((p: IProduct) => {
    setProduct(p);
    setIsOpen(true);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("product", p.slug);
      url.searchParams.set("drawer", "true");
      window.history.pushState({ productSlug: p.slug }, "", url.toString());
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setProduct(null);
    setIsOpen(false);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("product");
      url.searchParams.delete("drawer");
      window.history.pushState({}, "", url.toString());
    }
  }, []);

  return (
    <ProductDrawerContext.Provider value={{ product, isOpen, openDrawer, closeDrawer }}>{children}</ProductDrawerContext.Provider>
  );
}

export function useProductDrawer() {
  const context = useContext(ProductDrawerContext);
  if (!context) {
    throw new Error("useProductDrawer must be used within a ProductDrawerProvider");
  }
  return context;
}
