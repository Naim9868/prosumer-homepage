// components/product/sections/HowToUse.tsx
import type { Product } from "@/types/product";
import { getHowToUseGroups } from "@/lib/section-config";

export function HowToUse({ product }: { product: Product }) {
  const entries = getHowToUseGroups(product);
  if (!entries.length) return null;

  return (
    <section id="how-to-use" aria-labelledby="section-how-to-use" className="flex flex-col gap-8">
      <h2 id="section-how-to-use" className="text-2xl font-medium text-[color:var(--titanium-100)]">
        How to use
      </h2>

      {entries.map(({ group }, groupIndex) => (
        <div key={`${group.title}-${groupIndex}`} className="flex flex-col gap-6">
          {group.description && (
            <p className="max-w-prose text-[15px] leading-relaxed text-[color:var(--titanium-400)]">
              {group.description}
            </p>
          )}
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {group.images.map((img, i) => (
              <li key={`${groupIndex}-${i}`} className="flex flex-col gap-2">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[color:var(--surface-800)]">
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={img.alt || `${product.name} – step ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--brass-500)] text-xs font-semibold text-black">
                    {i + 1}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
