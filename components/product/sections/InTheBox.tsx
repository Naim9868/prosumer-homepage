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
      <div className="flex flex-wrap gap-6">
        {items.map((img, i) => (
          <div key={img.url + i} className="flex w-20 flex-col items-center gap-2 text-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-[color:var(--surface-800)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" loading="lazy" className="h-full w-full object-contain" />
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
