// components/product/sections/ImageGroupSection.tsx
import type { ProductImageGroup } from "@/types/product";

/**
 * Renders one image group as a titled section. Used for every content type
 * that doesn't need bespoke layout (detail, features, diagram, package,
 * contents, lifestyle, usage, scale, dimensions, infographic, result,
 * installation, instruction, gallery). Comparison has its own component.
 *
 * `layout` lets the registry give a couple of types a slightly different
 * grid without needing a whole new component per type.
 */
export function ImageGroupSection({
  group,
  productName,
  layout = "grid",
}: {
  group: ProductImageGroup;
  productName: string;
  layout?: "grid" | "stacked" | "wide";
}) {
  if (!group.images?.length) return null;

  return (
    <section aria-labelledby={sectionId(group.title)} className="flex flex-col gap-4">
      <div>
        <h2 id={sectionId(group.title)} className="text-xl font-medium text-[color:var(--titanium-100)]">
          {group.title}
        </h2>
        {group.description && (
          <p className="mt-1 max-w-prose text-[15px] leading-relaxed text-[color:var(--titanium-400)]">
            {group.description}
          </p>
        )}
      </div>

      <div
        className={
          layout === "stacked"
            ? "flex flex-col gap-3"
            : layout === "wide"
              ? "grid grid-cols-1 gap-3"
              : "grid grid-cols-2 gap-3 md:grid-cols-3"
        }
      >
        {group.images.map((img, i) => (
          <div
            key={`${group.title}-${i}`}
            className="relative aspect-square overflow-hidden rounded-xl bg-[color:var(--surface-800)]"
          >
            {img.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.url}
                alt={img.alt || `${productName} – ${group.title}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function sectionId(title: string) {
  return `section-${title.toLowerCase().replace(/\s+/g, "-")}`;
}
