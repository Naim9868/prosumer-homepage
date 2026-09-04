// components/product/sections/ShotOnGallery.tsx
import type { Product } from "@/types/product";
import { getResultGroups } from "@/lib/section-config";

export function ShotOnGallery({ product }: { product: Product }) {
  const groups = getResultGroups(product);
  if (!groups.length) return null;

  const images = groups.flatMap((g) => g.images);
  const heading = groups.length === 1 ? groups[0].title : "Shot on";

  return (
    <section id="shot-on" aria-labelledby="section-shot-on" className="flex flex-col gap-4">
      <h2 id="section-shot-on" className="text-2xl font-medium text-[color:var(--titanium-100)]">
        {heading}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((img, i) => (
          <div key={img.url + i} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[color:var(--surface-800)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt || `${product.name} sample photo ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
