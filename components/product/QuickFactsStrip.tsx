// components/product/QuickFactsStrip.tsx
import type { Product } from "@/types/product";

// specsFlat has no icon field in the schema, so this reads as small
// label/value stat tiles rather than icon badges (the reference site's
// icons are hand-illustrated assets outside the data model). Swap the
// wrapper below for an icon-mapped version if you add an icon field later.
export function QuickFactsStrip({ product }: { product: Product }) {
  const facts = (product.specsFlat ?? []).slice(0, 4);
  if (!facts.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 border-y border-[color:var(--titanium-800)] py-6 sm:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.key} className="flex flex-col items-center gap-1 text-center">
          <span className="text-lg font-medium text-[color:var(--titanium-100)]">
            {fact.value}
            {fact.unit ? ` ${fact.unit}` : ""}
          </span>
          <span className="text-xs text-[color:var(--titanium-500)]">{fact.label}</span>
        </div>
      ))}
    </div>
  );
}
