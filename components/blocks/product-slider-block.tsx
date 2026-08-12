import type { Block } from "@/types/homepage";
import type { CatalogData } from "@/types/catalog";
import { ProductCard } from "@/components/shared/product-card";
import { getFeaturedProducts, getProductsByIds } from "@/lib/catalog-utils";

export function ProductSliderBlock({
  block,
  catalog,
}: {
  block: Block<"productSlider">;
  catalog?: CatalogData;
}) {
  const { title, productIds } = block.settings;
  const products = productIds.length
    ? getProductsByIds(catalog, productIds)
    : getFeaturedProducts(catalog, 6);

  return (
    <div>
      {title && <h3 className="mb-5 font-heading text-xl font-semibold text-foreground">{title}</h3>}
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product, i) => (
          <div key={product.id} className="w-[240px] shrink-0">
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
