// app/product/[slug]/page.tsx
// Example route wiring. Replace the fetch/query with whatever your project
// already uses (e.g. a lib/products.ts helper hitting Mongoose directly, or
// an internal API route) — the important part is that `product` ends up
// matching the Product type and gets serialized (JSON.parse(JSON.stringify))
// before being handed to a client component, per your project's existing
// Mongoose-serialization convention.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { getProductBySlug } from "@/lib/queries/products"; // <- your existing data layer
import type { Product } from "@/types/product";

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

  return <ProductPage product={product} />;
}
