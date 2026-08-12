import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/shared/layout-primitives";
import { getProducts } from "@/lib/products";
import type { IProduct } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoryId?: string }>;
}) {
  const params = await searchParams;
  const query = params.q;

  let products: IProduct[] = [];
  try {
    const result = await getProducts({ limit: 50, status: "active", query: query || undefined });
    products = result.products || [];
  } catch {
    products = [];
  }

  return (
    <div className="pt-[120px] pb-20">
      <Container>
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {query ? `Results for "${query}"` : "All Products"}
          </h1>
          <p className="mt-2 text-foreground-muted">
            {query ? "Products matching your search" : "Browse our complete collection"}
          </p>
        </div>
        <ProductGrid initialProducts={products} initialQuery={query} />
      </Container>
    </div>
  );
}
