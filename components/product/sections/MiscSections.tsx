// components/product/sections/MiscSections.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/shared/product-card";
import type { CartProductInput } from "@/lib/cart-item";
import { getProductId } from "@/lib/cart-item";

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

function normalizeProvider(provider?: string): string {
  return (provider ?? "").toLowerCase().trim();
}

function isEmbedProvider(provider?: string): boolean {
  const p = normalizeProvider(provider);
  return p === "youtube" || p === "vimeo";
}

function detectProvider(url: string): "youtube" | "vimeo" | null {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/vimeo\.com/.test(url)) return "vimeo";
  return null;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?.*?v=|embed\/|live\/|shorts\/)|youtu\.be\/)([\w-]+)/
  );
  return m?.[1] ?? null;
}

function embedUrl(url: string, provider?: string): string {
  const p = normalizeProvider(provider);
  const resolved = p || detectProvider(url);
  if (resolved === "youtube") {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (resolved === "vimeo") {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }
  return url;
}

function shouldEmbed(provider?: string, url?: string): boolean {
  if (isEmbedProvider(provider)) return true;
  if (url) return detectProvider(url) !== null;
  return false;
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
            {shouldEmbed(video.provider, video.url) ? (
              <iframe
                src={embedUrl(video.url, video.provider)}
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

function getCategoryId(product: Product): string | null {
  const cat = product.categoryId;
  if (!cat) return null;
  if (typeof cat === "string") return cat;
  if (typeof cat === "object" && cat._id) return cat._id;
  return null;
}

export function RelatedProducts({ product }: { product: Product }) {
  const [products, setProducts] = useState<CartProductInput[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const ids = product.relatedProducts?.map((rp) => rp._id).filter(Boolean) ?? [];
      let items: CartProductInput[] = [];

      if (ids.length > 0) {
        try {
          const res = await fetch(`/api/products?ids=${ids.join(",")}`);
          const data = await res.json();
          items = data.products ?? [];
        } catch {}
      }

      if (items.length === 0) {
        const categoryId = getCategoryId(product);
        const url = categoryId
          ? `/api/products?categoryId=${categoryId}&limit=10&sort=newest`
          : `/api/products?limit=10&sort=popular`;

        try {
          const res = await fetch(url);
          const data = await res.json();
          items = (data.products ?? []).filter(
            (p: CartProductInput) => getProductId(p) !== product._id
          );
        } catch {}
      }

      if (!cancelled) {
        setProducts(items);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [product]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > *")?.offsetWidth ?? 200;
    el.scrollBy({ left: dir === "left" ? -(cardWidth + 16) : cardWidth + 16, behavior: "smooth" });
  }, []);

  if (loading) return (
    <section id="related" aria-labelledby="section-related" className="flex flex-col gap-4">
      <h2 id="section-related" className="text-xl font-medium text-[color:var(--titanium-100)]">
        You may also like
      </h2>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="w-[180px] min-w-[180px] sm:w-[220px] sm:min-w-[220px]">
            <div className="animate-pulse rounded-xl bg-[color:var(--surface-800)] aspect-square" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[color:var(--surface-800)]" />
          </div>
        ))}
      </div>
    </section>
  );
  if (!products.length) return null;

  return (
    <section id="related" aria-labelledby="section-related" className="flex flex-col gap-4">
      <h2 id="section-related" className="text-xl font-medium text-[color:var(--titanium-100)]">
        You may also like
      </h2>
      <div className="relative">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[color:var(--titanium-700)] bg-[color:var(--surface-800)] p-2 text-[color:var(--titanium-300)] transition-colors hover:bg-[color:var(--surface-700)] hover:text-white"
        >
          <ChevronLeft size={18} />
        </button>
        <div
          ref={scrollRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {products.map((rp, i) => (
            <div key={`${getProductId(rp)}-${i}`} className="w-[180px] min-w-[180px] snap-start sm:w-[220px] sm:min-w-[220px]">
              <ProductCard product={rp} index={i} />
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[color:var(--titanium-700)] bg-[color:var(--surface-800)] p-2 text-[color:var(--titanium-300)] transition-colors hover:bg-[color:var(--surface-700)] hover:text-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
