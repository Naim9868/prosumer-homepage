// app/product/[slug]/page.tsx
// Example route wiring. Replace the fetch/query with whatever your project
// already uses (e.g. a lib/products.ts helper hitting Mongoose directly, or
// an internal API route) — the important part is that `product` ends up
// matching the Product type and gets serialized (JSON.parse(JSON.stringify))
// before being handed to a client component, per your project's existing
// Mongoose-serialization convention.

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { getProductBySlug } from "@/lib/queries/products";
import { getReviewsByProductId } from "@/lib/queries/reviews";
import type { Product } from "@/types/product";
import { Navbar } from "@/components/home/navbar/navbar";
import { Footer } from "@/components/home/footer/footer";
import { Container } from "@/components/shared/layout-primitives";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) as Product | null;
  if (!product) return {};

  const title = product.seo?.metaTitle || product.name;
  const description =
    product.seo?.metaDescription || product.shortDescription || undefined;

  return {
    title,
    description,
    keywords: product.seo?.metaKeywords,
    alternates: product.seo?.canonicalUrl ? { canonical: product.seo.canonicalUrl } : undefined,
    robots: product.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      images: product.seo?.ogImage ? [product.seo.ogImage] : product.thumbnail ? [product.thumbnail] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) as Product | null;

  if (!product || product.status === "archived") notFound();

  const reviews = await getReviewsByProductId(product._id);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar settings={{ ...DEFAULT_PAGE_SETTINGS.navbar, fixed: false }} />
      <main className="flex-1 pt-8">
        <Container className="py-10 lg:py-16">
          <nav aria-label="Breadcrumb" className="-mb-10 flex items-center gap-2 text-sm text-[color:var(--titanium-400)]">
            <Link href="/" className="transition hover:text-[color:var(--brass-500)]">Home</Link>
            <span>/</span>
            <Link href="/products" className="transition hover:text-[color:var(--brass-500)]">Products</Link>
            <span>/</span>
            <span className="text-[color:var(--titanium-200)]">{product.name}</span>
          </nav>
          <ProductPage product={product} reviews={reviews} />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
