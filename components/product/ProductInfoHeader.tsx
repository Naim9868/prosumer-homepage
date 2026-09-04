// components/product/ProductInfoHeader.tsx
import type { Product } from "@/types/product";
import { RatingStars } from "./ui/RatingStars";
import { BadgeRow } from "./ui/BadgesAndStock";

export function ProductInfoHeader({ product }: { product: Product }) {
  const brandName =
    typeof product.brandId === "object" ? product.brandId?.name : undefined;

  return (
    <div className="flex flex-col gap-3">
      {brandName && (
        <span className="text-sm font-medium text-[color:var(--titanium-500)]">{brandName}</span>
      )}

      <h1 className="text-3xl font-medium tracking-tight text-[color:var(--titanium-100)] lg:text-4xl">
        {product.name}
      </h1>

      <BadgeRow badges={product.badges} />

      <RatingStars average={product.ratingAverage} count={product.ratingCount} />

      {product.shortDescription && (
        <p className="max-w-prose text-[15px] leading-relaxed text-[color:var(--titanium-400)]">
          {product.shortDescription}
        </p>
      )}
    </div>
  );
}
