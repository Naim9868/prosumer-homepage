import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/shared/layout-primitives";
import { getProducts } from "@/lib/products";
import { getCatalogData } from "@/lib/catalog";
import { readHomepageConfig } from "@/lib/homepage-store";
import type { IProduct } from "@/types/product";
import { Navbar } from "@/components/home/navbar/navbar";
import { Footer } from "@/components/home/footer/footer";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoryId?: string; brandId?: string; minPrice?: string; maxPrice?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const categoryId = params.categoryId || "";
  const brandId = params.brandId || "";
  const minPrice = params.minPrice || "";
  const maxPrice = params.maxPrice || "";
  const sort = params.sort || "newest";
  const page = Math.max(1, Number(params.page) || 1);

  let perPage = DEFAULT_PAGE_SETTINGS.productsPerPage;
  try {
    const config = await readHomepageConfig();
    perPage = config.page?.productsPerPage || perPage;
  } catch {}

  let products: IProduct[] = [];
  let totalCount = 0;
  let totalPages = 1;
  try {
    const result = await getProducts({
      page,
      limit: perPage,
      status: "active",
      query: query || undefined,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
    });
    products = result.products || [];
    totalCount = result.pagination.total;
    totalPages = result.pagination.totalPages || 1;
  } catch {
    products = [];
  }

  let categories: { id: string; name: string; slug: string }[] = [];
  let brands: { id: string; name: string; slug: string }[] = [];
  try {
    const catalog = await getCatalogData();
    categories = (catalog.categories || []).map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
    brands = (catalog.products || [])
      .reduce<{ id: string; name: string; slug: string }[]>((acc, p) => {
        if (p.brand && p.brandId && !acc.some((b) => b.id === p.brandId)) {
          acc.push({ id: p.brandId, name: p.brand, slug: p.brandSlug || "" });
        }
        return acc;
      }, []);
  } catch {
    categories = [];
    brands = [];
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar settings={{ ...DEFAULT_PAGE_SETTINGS.navbar, fixed: false }} />
      <main className="flex-1 pt-32">
        <Container className="-mt-2">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {query ? `Results for "${query}"` : "All Products"}
            </h1>
            <p className="mt-2 text-foreground-muted">
              {query ? "Products matching your search" : "Browse our complete collection"}
            </p>
          </div>
          <ProductGrid
            initialProducts={products}
            initialQuery={query}
            initialCategoryId={categoryId}
            initialBrandId={brandId}
            initialMinPrice={minPrice}
            initialMaxPrice={maxPrice}
            initialSort={sort}
            categories={categories}
            brands={brands}
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            perPage={perPage}
          />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
