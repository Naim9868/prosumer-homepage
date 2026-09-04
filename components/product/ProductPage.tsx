// components/product/ProductPage.tsx
// Server component. Fetch the product once in the route (see
// app-example/product/[slug]/page.tsx) and pass it in here.

import type { Product } from "@/types/product";
import { getPresentSections } from "@/lib/section-config";
import { ProductExperience } from "./ProductExperience";
import { QuickFactsStrip } from "./QuickFactsStrip";
import { AnchorNav } from "./AnchorNav";
import { AlternatingBlocks } from "./sections/AlternatingBlocks";
import { ProductImageSections } from "./sections/ProductImageSections";
import { HowToUse } from "./sections/HowToUse";
import { ShotOnGallery } from "./sections/ShotOnGallery";
import { ProductDescription, ProductTags, ProductVideos, RelatedProducts } from "./sections/MiscSections";
import { ProductSpecifications } from "./sections/ProductSpecifications";
import { ComparisonSection } from "./sections/ComparisonSection";
import { InTheBox } from "./sections/InTheBox";

export function ProductPage({ product }: { product: Product }) {
  const sections = getPresentSections(product);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10 lg:px-8 lg:py-16">
      <ProductExperience product={product} />

      <QuickFactsStrip product={product} />

      <AnchorNav sections={sections} />

      <AlternatingBlocks product={product} />
      <ProductImageSections product={product} />

      <HowToUse product={product} />

      <ShotOnGallery product={product} />

      <ProductDescription product={product} />

      <ComparisonSection product={product} />
      <ProductSpecifications product={product} />

      <InTheBox product={product} />

      <ProductVideos product={product} />

      <RelatedProducts product={product} />

      <ProductTags product={product} />
    </main>
  );
}
