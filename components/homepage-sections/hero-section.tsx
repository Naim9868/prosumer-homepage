"use client";

import { normalizeHeroSettings } from "@/lib/hero";
import { HeroRenderer } from "@/components/homepage-sections/hero/hero-renderer";
import type { CatalogData, CatalogProduct } from "@/types/catalog";
import type { Section } from "@/types/homepage";

export function HeroSection({
  section,
  catalog,
}: {
  section: Extract<Section, { type: "hero" }>;
  catalog?: CatalogData;
}) {
  const settings = normalizeHeroSettings(section.settings);
  const products: Record<string, CatalogProduct> = Object.fromEntries(
    (catalog?.products ?? []).map((p) => [p.id, p])
  );
  return <HeroRenderer slides={settings.slides} settings={settings.slider} products={products} />;
}
