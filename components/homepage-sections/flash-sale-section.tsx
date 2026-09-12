"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { ProductCard } from "@/components/shared/product-card";
import { getDiscountedProducts, getProductsByIds } from "@/lib/catalog-utils";
import type { CatalogData } from "@/types/catalog";
import type { Section } from "@/types/homepage";

function useCountdown(endsAt: string) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const compute = () => setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  return { days, hours, minutes, seconds, isOver: remaining <= 0 };
}

export function FlashSaleSection({
  section,
  catalog,
}: {
  section: Extract<Section, { type: "flashSale" }>;
  catalog?: CatalogData;
}) {
  const { title, subtitle, endsAt, productIds, buttonLabel, buttonUrl } = section.settings;
  const { days, hours, minutes, seconds, isOver } = useCountdown(endsAt);
  const products = productIds.length
    ? getProductsByIds(catalog, productIds, 4)
    : getDiscountedProducts(catalog, 4);

  if (products.length === 0) return null;

  return (
    <SectionWrapper style={section.style}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Limited Time" title={title} description={subtitle} />
        {!isOver && (
          <div className="mb-1 flex items-center gap-4">
            <div className="flex gap-2">
              {[
                { value: days, label: "d" },
                { value: hours, label: "h" },
                { value: minutes, label: "m" },
                { value: seconds, label: "s" },
              ].map((unit) => (
                <div key={unit.label} className="flex h-14 w-14 flex-col items-center justify-center rounded-[var(--radius-md)] border border-border bg-card">
                  <span className="text-price font-heading text-lg text-foreground">{String(unit.value).padStart(2, "0")}</span>
                  <span className="text-[10px] uppercase text-foreground-muted">{unit.label}</span>
                </div>
              ))}
            </div>
            {buttonLabel && (
              <a
                href={buttonUrl || "#"}
                className="text-btn inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[13.5px] text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                {buttonLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}
