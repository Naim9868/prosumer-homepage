import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { ProductCard } from "@/components/shared/product-card";
import { getFeaturedProducts, getProductsByIds } from "@/lib/catalog-utils";
import type { CatalogData } from "@/types/catalog";
import type { Section } from "@/types/homepage";

export function FeaturedProductsSection({
  section,
  catalog,
}: {
  section: Extract<Section, { type: "featuredProducts" }>;
  catalog?: CatalogData;
}) {
  const { title, subtitle, productIds, columns, limit } = section.settings;
  const products = productIds.length
    ? getProductsByIds(catalog, productIds, limit || 8)
    : getFeaturedProducts(catalog, limit || 8);
  const colsClass = columns === 2 ? "lg:grid-cols-2" : columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  if (products.length === 0) return null;

  return (
    <SectionWrapper id="featured-products" style={section.style}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Featured" title={title} description={subtitle} />
        <a href="#best-sellers" className="mb-1 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-primary transition-colors hover:text-foreground">
          View all products
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      <div className={`mt-12 grid grid-cols-2 gap-4 sm:gap-5 ${colsClass}`}>
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}
