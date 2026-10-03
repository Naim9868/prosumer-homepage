// components/product/sections/InTheBox.tsx
import type { Product } from "@/types/product";
import { getContentsGroups } from "@/lib/section-config";

export function InTheBox({ product }: { product: Product }) {
  const groups = getContentsGroups(product);
  if (!groups.length) return null;

  const items = groups.flatMap((g) => g.images);

  return (
    <section id="in-the-box" aria-labelledby="section-in-the-box" className="flex flex-col gap-4">
      <h2 id="section-in-the-box" className="text-2xl font-medium text-[color:var(--titanium-100)]">
        In the box
      </h2>
      <div className="flex flex-wrap gap-3">
        {items.map((img, i) => (
          <div key={`${i}`} className="flex w-42 flex-col items-center gap-1 text-center">
            <div className="relative h-42 w-42 overflow-hidden rounded-lg bg-[color:var(--surface-800)]">
              {img.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.url} alt="" loading="lazy" className="h-full w-full object-contain" />
              ) : null}
            </div>
            {img.alt && (
              <span className="text-xs leading-tight text-[color:var(--titanium-400)]">{img.alt}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
