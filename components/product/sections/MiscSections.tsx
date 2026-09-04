// components/product/sections/MiscSections.tsx
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/product-helpers";

export function ProductDescription({ product }: { product: Product }) {
  if (!product.description?.trim()) return null;

  return (
    <section id="description" aria-labelledby="section-description" className="flex flex-col gap-3">
      <h2 id="section-description" className="text-xl font-medium text-[color:var(--titanium-100)]">
        Description
      </h2>
      <div className="max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-[color:var(--titanium-300)]">
        {product.description}
      </div>
    </section>
  );
}

export function ProductTags({ product }: { product: Product }) {
  if (!product.tags?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {product.tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-[color:var(--surface-800)] px-3 py-1 text-xs text-[color:var(--titanium-400)]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function embedUrl(video: NonNullable<Product["videos"]>[number]) {
  if (video.provider === "youtube") {
    const id = video.url.match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : video.url;
  }
  if (video.provider === "vimeo") {
    const id = video.url.match(/vimeo\.com\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : video.url;
  }
  return video.url;
}

export function ProductVideos({ product }: { product: Product }) {
  if (!product.videos?.length) return null;

  return (
    <section id="videos" aria-labelledby="section-videos" className="flex flex-col gap-4">
      <h2 id="section-videos" className="text-xl font-medium text-[color:var(--titanium-100)]">
        Videos
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {product.videos.map((video, i) => (
          <div key={i} className="aspect-video overflow-hidden rounded-xl bg-[color:var(--surface-800)]">
            {video.provider === "youtube" || video.provider === "vimeo" ? (
              <iframe
                src={embedUrl(video)}
                title={video.title || `${product.name} video ${i + 1}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <video src={video.url} controls className="h-full w-full" poster={video.thumbnail} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function RelatedProducts({ product }: { product: Product }) {
  if (!product.relatedProducts?.length) return null;

  return (
    <section id="related" aria-labelledby="section-related" className="flex flex-col gap-4">
      <h2 id="section-related" className="text-xl font-medium text-[color:var(--titanium-100)]">
        You may also like
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {product.relatedProducts.map((rp) => (
          <Link
            key={rp._id}
            href={`/product/${rp.slug}`}
            className="group flex flex-col gap-2"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[color:var(--surface-800)]">
              {rp.thumbnail && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={rp.thumbnail}
                  alt={rp.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <span className="text-sm font-medium text-[color:var(--titanium-200)]">{rp.name}</span>
            {rp.lowestPrice != null && (
              <span className="text-sm text-[color:var(--titanium-500)]">
                {rp.highestPrice && rp.highestPrice !== rp.lowestPrice
                  ? `${formatPrice(rp.lowestPrice)} – ${formatPrice(rp.highestPrice)}`
                  : formatPrice(rp.lowestPrice)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
