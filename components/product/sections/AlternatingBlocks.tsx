// components/product/sections/AlternatingBlocks.tsx
import type { Product } from "@/types/product";
import { getAlternatingGroups, ALTERNATING_HEADINGS } from "@/lib/section-config";

export function AlternatingBlocks({ product }: { product: Product }) {
  const entries = getAlternatingGroups(product);
  if (!entries.length) return null;

  const sectionHeading =
    entries.find((e) => e.type === "features")?.type
      ? ALTERNATING_HEADINGS.features
      : ALTERNATING_HEADINGS[entries[0].type];

  return (
    <section id="features" aria-labelledby="section-features-heading" className="flex flex-col gap-16">
      <h2 id="section-features-heading" className="text-2xl font-medium text-[color:var(--titanium-100)]">
        {sectionHeading}
      </h2>
      {entries.map(({ group }, i) => {
        const image = group.images[0];
        if (!image) return null;
        const reversed = i % 2 === 1;

        return (
          <div
            key={`${group.title}-${i}`}
            className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 ${
              reversed ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[color:var(--surface-800)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || `${product.name} – ${group.title}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-medium text-[color:var(--titanium-100)]">{group.title}</h3>
              {group.description && (
                <p className="max-w-prose text-[15px] leading-relaxed text-[color:var(--titanium-400)]">
                  {group.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
