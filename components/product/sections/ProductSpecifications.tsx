// components/product/sections/ProductSpecifications.tsx
import type { Product } from "@/types/product";
import { getSortedSpecGroups, isComparisonData } from "@/lib/product-helpers";

export function ProductSpecifications({ product }: { product: Product }) {
  // Comparison-shaped data is rendered by ComparisonSection instead.
  if (isComparisonData(product)) return null;

  const groups = getSortedSpecGroups(product);
  if (!groups.length) return null;

  return (
    <section id="specifications" aria-labelledby="section-specifications" className="flex flex-col gap-6">
      <h2 id="section-specifications" className="text-xl font-medium text-[color:var(--titanium-100)]">
        Specifications
      </h2>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.groupName}>
            <h3 className="mt-2 pt-2 pl-4 bg-blue-500 text-sm font-bold uppercase tracking-wide text-white rounded-sm border-b border-[color:var(--titanium-700)] pb-2">
              {group.groupName}
            </h3>
            <dl className="divide-y divide-[color:var(--titanium-800)]/60">
              {group.specifications.map((spec, index) => (
                <div key={`${group.groupName}-${spec.key}-${index}`} className="flex justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-[color:var(--titanium-400)]">{spec.label}</dt>
                  <dd className="text-right font-medium text-[color:var(--titanium-100)]">
                    {spec.value}
                    {spec.unit ? ` ${spec.unit}` : ""}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
