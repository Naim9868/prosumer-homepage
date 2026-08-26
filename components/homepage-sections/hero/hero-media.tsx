"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import type { CatalogProduct } from "@/types/catalog";
import { heroColorsFor, heroBreakpointFor, mediaImageFor } from "@/lib/hero";
import { cn } from "@/lib/utils";
import { useHero } from "./hero-context";
import { Entrance } from "./hero-entrance";
import { HeroFallbackVisual } from "./hero-fallback-visual";
import { HeroImage } from "./hero-image";

export function HeroMedia({ className }: { className?: string }) {
  const { slide, breakpoint, active, container, media: mediaVariants, products } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const media = bp.media;
  const colors = heroColorsFor(slide);
  const isMobile = breakpoint === "mobile";
  const pos = isMobile ? bp.styling.imagePosition : media.position;
  const bpImg = mediaImageFor(media, breakpoint);
  const img = media.productImage || bpImg;
  const product = media.productId ? products[media.productId] : undefined;

  const imageWidthStyle: CSSProperties =
    media.imageWidthMode === "manual" ? { width: media.imageWidth } : {};

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={active ? "show" : "hidden"}
      className={cn("relative", className)}
    >
      <Entrance variants={mediaVariants} className="relative">
        <div
          className={cn(
            "relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] border",
            media.imageWidthMode === "auto" && "w-full"
          )}
          style={{
            borderColor: "var(--hero-border)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            ...imageWidthStyle,
          }}
        >
          {img ? (
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pos.x}%, ${pos.y}%) scale(${pos.scale})`,
              }}
            >
              <HeroImage
                src={img}
                alt={bp.content.heading}
                sizes="(max-width: 768px) 90vw, 44vw"
                className="object-cover"
              />
            </div>
          ) : product ? (
            <ProductVisual product={product} accent={colors.accent} />
          ) : (
            <HeroFallbackVisual />
          )}

          {media.source === "product-custom" && product && (
            <div
              className="absolute bottom-4 left-4 z-10 rounded-full border px-4 py-2"
              style={{ background: colors.card, borderColor: colors.border }}
            >
              <p className="text-[12px] font-semibold" style={{ color: colors.foreground }}>
                {product.name}
              </p>
              <p className="text-[11px]" style={{ color: colors.accent }}>
                ৳{product.price}
              </p>
            </div>
          )}
        </div>
      </Entrance>
    </motion.div>
  );
}

function ProductVisual({ product, accent }: { product: CatalogProduct; accent: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: product.gradient }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{product.category}</p>
      <p className="mt-3 font-heading text-2xl font-bold text-white">{product.name}</p>
      <p className="mt-3 text-xl font-bold" style={{ color: accent }}>
        ৳{product.price}
      </p>
      {product.compareAtPrice ? (
        <p className="mt-1 text-sm text-white/50 line-through">৳{product.compareAtPrice}</p>
      ) : null}
      <span
        className="mt-5 inline-flex rounded-full px-6 py-2.5 text-[12px] font-semibold"
        style={{ background: accent, color: "#0A0A0A" }}
      >
        Shop Now
      </span>
    </div>
  );
}
