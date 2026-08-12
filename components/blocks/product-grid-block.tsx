import type { Block } from "@/types/homepage";
import type { CatalogData } from "@/types/catalog";
import { ProductCard } from "@/components/shared/product-card";
import { getFeaturedProducts, getProductsByIds } from "@/lib/catalog-utils";

export function ProductGridBlock({
  block,
  catalog,
}: {
  block: Block<"productGrid">;
  catalog?: CatalogData;
}) {
  const { title, productIds, columns } = block.settings;
  const products = productIds.length
    ? getProductsByIds(catalog, productIds)
    : getFeaturedProducts(catalog, columns);

  const colsClass = columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4";

  return (
    <div>
      {title && <h3 className="mb-5 font-heading text-xl font-semibold text-foreground">{title}</h3>}
      <div className={`grid grid-cols-2 gap-4 ${colsClass}`}>
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
