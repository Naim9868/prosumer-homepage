// components/product/sections/ComparisonSection.tsx
import type { Product } from "@/types/product";
import { buildComparisonRows, getSortedSpecGroups } from "@/lib/product-helpers";

export function ComparisonSection({ product }: { product: Product }) {
  const groups = getSortedSpecGroups(product).filter((g) =>
    g.specifications.some((s) => s.unit === "comparison")
  );
  if (groups.length < 2) return null;

  const rows = buildComparisonRows(product);
  if (!rows.length) return null;

  return (
    <section id="comparison" aria-labelledby="section-comparison" className="flex flex-col gap-4">
      <h2 id="section-comparison" className="text-xl font-medium text-[color:var(--titanium-100)]">
        Comparison
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-t border-[color:var(--titanium-800)] py-3 pr-4 font-medium text-[color:var(--titanium-500)]" />
              {groups.map((g) => (
                <th
                  key={g.groupName}
                  className="border-b border-t border-[color:var(--titanium-800)] py-3 pr-4 font-medium text-[color:var(--titanium-100)]"
                >
                  {g.groupName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th
                  scope="row"
                  className="whitespace-nowrap border-b border-[color:var(--titanium-800)]/60 py-3 pr-4 font-normal text-[color:var(--titanium-500)]"
                >
                  {row.label}
                </th>
                {row.values.map((spec, i) => (
                  <td
                    key={i}
                    className="border-b border-[color:var(--titanium-800)]/60 py-3 pr-4 text-[color:var(--titanium-200)]"
                  >
                    {spec ? spec.value : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
