"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { ProductCard } from "@/components/shared/product-card";
import { getProductsByIds } from "@/lib/catalog-utils";
import type { CatalogData } from "@/types/catalog";
import type { Section } from "@/types/homepage";

export function BestSellersSection({
  section,
  catalog,
  preview = false,
}: {
  section: Extract<Section, { type: "bestSellers" }>;
  catalog?: CatalogData;
  preview?: boolean;
}) {
  const { title, subtitle, productIds, limit } = section.settings;
  const products = getProductsByIds(catalog, productIds, limit || 6);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  if (products.length === 0) {
    if (!preview) return null;
    return (
      <SectionWrapper id="best-sellers" style={section.style}>
        <SectionHeading eyebrow="Ranked by Shooters" title={title} description={subtitle} />
        <div className="mt-10 rounded-[var(--radius-md)] border border-dashed border-border p-8 text-center text-[13px] text-foreground-muted">
          No products selected. Pick best sellers from the catalog in the editor — this section only shows manually
          chosen products.
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id="best-sellers" style={section.style}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Ranked by Shooters" title={title} description={subtitle} />
        <div className="mb-1 flex gap-2">
          <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground-muted transition-colors hover:bg-muted hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Scroll right" onClick={() => scroll(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground-muted transition-colors hover:bg-muted hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={scrollerRef} className="mt-10 flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product, i) => (
          <div key={product.id} className="w-[76vw] shrink-0 sm:w-[300px]">
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
