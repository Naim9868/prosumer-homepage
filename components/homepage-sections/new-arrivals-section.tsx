import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { ProductCard } from "@/components/shared/product-card";
import { getNewArrivals } from "@/lib/catalog-utils";
import type { CatalogData } from "@/types/catalog";
import type { Section } from "@/types/homepage";

export function NewArrivalsSection({
  section,
  catalog,
}: {
  section: Extract<Section, { type: "newArrivals" }>;
  catalog?: CatalogData;
}) {
  const { title, subtitle, limit } = section.settings;
  const products = getNewArrivals(catalog, limit || 8);

  if (products.length === 0) return null;

  return (
    <SectionWrapper style={section.style}>
      <SectionHeading eyebrow="Just In" title={title} description={subtitle} />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}
