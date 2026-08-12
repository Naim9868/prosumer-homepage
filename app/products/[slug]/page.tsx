import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { Container } from "@/components/shared/layout-primitives";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product = null;
  try {
    product = await getProductBySlug(slug);
  } catch {
    product = null;
  }
  if (!product) notFound();

  return (
    <div className="pt-[120px] pb-20">
      <Container>
        <ProductDetailClient product={product} />
      </Container>
    </div>
  );
}
