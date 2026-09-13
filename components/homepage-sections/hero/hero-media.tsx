"use client";

import { type CSSProperties } from "react";
import { heroColorsFor, heroBreakpointFor, mediaImageFor } from "@/lib/hero";
import { cn } from "@/lib/utils";
import { useHero } from "./hero-context";
import { Entrance } from "./hero-content";
import { HeroImage } from "./hero-background";

// ---------------------------------------------------------------
// HeroMedia
// ---------------------------------------------------------------

export function HeroMedia({ className }: { className?: string }) {
  const { slide, breakpoint, media: mediaVariants, products } = useHero();
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

  const br = media.borderRadius && typeof media.borderRadius === "object"
    ? media.borderRadius
    : { topLeft: 40, topRight: 40, bottomLeft: 40, bottomRight: 40 };

  // Product image overlay settings
  const pis = media.productImageSettings;
  const showOverlay = pis?.enabled && product;
  const brs = pis?.borderRadius ?? { topLeft: 12, topRight: 12, bottomLeft: 12, bottomRight: 12 };
  const btn = pis?.button;
  const btnUrl = btn?.url || (media.productId ? `/products/${media.productId}` : "#");

  return (
    <Entrance variants={mediaVariants} className={cn("relative", className)}>
      {img && (
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: `${br.topLeft}px ${br.topRight}px ${br.bottomRight}px ${br.bottomLeft}px`,
            ...imageWidthStyle,
          }}
        >
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
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* ── Product Image Overlay ─────────────────────── */}
      {showOverlay && (
        <div
          className="absolute z-20 overflow-hidden"
          style={{
            width: pis.width,
            height: pis.height,
            left: `calc(50% + ${pis.offsetX}px)`,
            top: `calc(50% + ${pis.offsetY}px)`,
            transform: "translate(-50%, -50%)",
            borderRadius: `${brs.topLeft}px ${brs.topRight}px ${brs.bottomRight}px ${brs.bottomLeft}px`,
            border: pis.border.width > 0
              ? `${pis.border.width}px ${pis.border.style} ${pis.border.color}`
              : undefined,
            boxShadow: pis.shadow > 0
              ? `0 8px 32px rgba(0,0,0,${pis.shadow})`
              : undefined,
          }}
        >
          {product?.image && (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              draggable={false}
            />
          )}

          {btn?.enabled && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          )}

          {btn?.enabled && (
            <a
              href={btnUrl}
              className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-opacity hover:opacity-90"
              style={{
                padding: "8px 16px",
                borderRadius: btn.borderRadius,
                ...(btn.style === "filled"
                  ? {
                      background: btn.backgroundColor || colors.accent,
                      color: btn.textColor || "#0A0A0A",
                    }
                  : btn.style === "outline"
                    ? {
                        background: "transparent",
                        color: btn.backgroundColor || colors.foreground,
                        border: `1.5px solid ${btn.backgroundColor || colors.foreground}`,
                      }
                    : {
                        background: "transparent",
                        color: btn.backgroundColor || colors.foreground,
                      }),
              }}
            >
              {btn.text}
            </a>
          )}
        </div>
      )}
    </Entrance>
  );
}
