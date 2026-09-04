// components/product/ui/PriceDisplay.tsx
import { formatPrice, type PriceDisplay as PriceDisplayData } from "@/lib/product-helpers";

export function PriceDisplay({ data }: { data?: PriceDisplayData }) {
  if (!data) return null;

  return (
    <div className="flex items-baseline gap-3">
      {data.isRange ? (
        <span className="text-2xl font-medium tracking-tight text-[color:var(--titanium-100)]">
          {formatPrice(data.rangeLow!)} – {formatPrice(data.rangeHigh!)}
        </span>
      ) : (
        <span className="text-2xl font-medium tracking-tight text-[color:var(--titanium-100)]">
          {formatPrice(data.price)}
        </span>
      )}
      {!data.isRange && data.compareAtPrice && data.compareAtPrice > data.price && (
        <span className="text-base text-[color:var(--titanium-500)] line-through">
          {formatPrice(data.compareAtPrice)}
        </span>
      )}
    </div>
  );
}
