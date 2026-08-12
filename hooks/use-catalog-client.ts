"use client";

import { useEffect, useMemo, useState } from "react";
import type { CatalogData, CatalogProduct } from "@/types/catalog";

const EMPTY: CatalogData = { products: [], categories: [], reviews: [] };

let catalogPromise: Promise<CatalogData> | null = null;

function fetchCatalog(): Promise<CatalogData> {
  if (!catalogPromise) {
    catalogPromise = fetch("/api/catalog")
      .then((res) => {
        if (!res.ok) throw new Error("Catalog request failed");
        return res.json() as Promise<CatalogData>;
      })
      .catch((err) => {
        catalogPromise = null;
        throw err;
      });
  }
  return catalogPromise;
}

export interface ClientCatalog {
  catalog: CatalogData;
  productsById: Record<string, CatalogProduct>;
  loading: boolean;
}

/**
 * Client-side catalog access for components that live outside the
 * server-rendered homepage tree (search ribbon, wishlist sidebar, …).
 * The `/api/catalog` payload is fetched once and shared across callers.
 */
export function useCatalogData(): ClientCatalog {
  const [catalog, setCatalog] = useState<CatalogData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then((data) => {
        if (active) setCatalog(data);
      })
      .catch(() => {
        if (active) setCatalog(EMPTY);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const productsById = useMemo(
    () => Object.fromEntries(catalog.products.map((p) => [p.id, p])),
    [catalog]
  );

  return { catalog, productsById, loading };
}
