"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CatalogData } from "@/types/catalog";

const EMPTY: CatalogData = { products: [], categories: [], reviews: [] };

const CatalogContext = createContext<CatalogData>(EMPTY);

/**
 * Supplies the catalog to client-only trees (e.g. the homepage builder,
 * which receives its catalog from the admin page). Server-rendered homepage
 * sections receive the catalog as a prop instead of via this context.
 */
export function CatalogProvider({ value, children }: { value?: CatalogData | null; children: ReactNode }) {
  return <CatalogContext.Provider value={value ?? EMPTY}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogData {
  return useContext(CatalogContext);
}
