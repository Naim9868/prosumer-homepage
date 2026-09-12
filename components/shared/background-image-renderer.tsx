"use client";

import type { CSSProperties, ReactNode } from "react";
import type { HeroBackgroundConfig, HeroOverlayConfig } from "@/types/homepage";
import { DEFAULT_HERO_BACKGROUND_CONFIG } from "@/types/homepage";
import { cn } from "@/lib/utils";

function buildOverlayStyle(overlay: HeroOverlayConfig): CSSProperties {
  const opacity = overlay.opacity / 100;
  if (overlay.type === "solid") {
    return { background: overlay.color, opacity };
  }
  if (overlay.type === "linear") {
    const angle = { "to-right": "90deg", "to-left": "270deg", "to-bottom": "180deg", "to-top": "0deg" }[overlay.direction] || "90deg";
    return { background: `linear-gradient(${angle}, ${overlay.color}, ${overlay.colorEnd})`, opacity };
  }
  if (overlay.type === "radial") {
    return { background: `radial-gradient(circle, ${overlay.color}, ${overlay.colorEnd})`, opacity };
  }
  return {};
}

function buildImageStyles(config: HeroBackgroundConfig): { wrapper: CSSProperties; img: CSSProperties } {
  const { fit, position, zoom, customWidth, customWidthUnit, customHeight, customHeightUnit } = config;
  const pos = `${position.x}% ${position.y}%`;
  const z = zoom / 100;

  switch (fit) {
    case "cover":
      return {
        wrapper: { position: "absolute", inset: 0, overflow: "hidden" },
        img: { width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${z})`, transformOrigin: `${position.x}% ${position.y}%` },
      };
    case "contain":
      return {
        wrapper: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
        img: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", objectPosition: pos, transform: `scale(${z})`, transformOrigin: `${position.x}% ${position.y}%` },
      };
    case "width":
      return {
        wrapper: { position: "absolute", inset: 0, overflow: "hidden" },
        img: { width: "100%", height: "auto", objectFit: "fill", objectPosition: pos, transform: `scale(${z})`, transformOrigin: `${position.x}% ${position.y}%` },
      };
    case "height":
      return {
        wrapper: { position: "absolute", inset: 0, overflow: "hidden" },
        img: { width: "auto", height: "100%", objectFit: "fill", objectPosition: pos, transform: `scale(${z})`, transformOrigin: `${position.x}% ${position.y}%` },
      };
    case "original":
      return {
        wrapper: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
        img: { maxWidth: "90%", maxHeight: "90%", objectFit: "none", objectPosition: pos, transform: `scale(${z})`, transformOrigin: `${position.x}% ${position.y}%` },
      };
    case "custom":
      return {
        wrapper: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
        img: { width: `${customWidth}${customWidthUnit}`, height: `${customHeight}${customHeightUnit}`, objectFit: "none", objectPosition: pos, transform: `scale(${z})`, transformOrigin: `${position.x}% ${position.y}%` },
      };
    default:
      return {
        wrapper: { position: "absolute", inset: 0, overflow: "hidden" },
        img: { width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${z})`, transformOrigin: `${position.x}% ${position.y}%` },
      };
  }
}

export function BackgroundImageRenderer({
  config,
  sizes = "100vw",
  priority = false,
  className,
  style,
  children,
}: {
  config?: HeroBackgroundConfig;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const cfg = config ?? DEFAULT_HERO_BACKGROUND_CONFIG;
  const imgSrc = cfg.useMobileImage && cfg.mobileImage ? cfg.mobileImage : cfg.image;

  if (!imgSrc) return <div className={className} style={style}>{children}</div>;

  const { wrapper: wrapperStyle, img: imgStyle } = buildImageStyles(cfg);
  const overlayStyle = cfg.overlay.opacity > 0 ? buildOverlayStyle(cfg.overlay) : undefined;

  return (
    <div className={cn("absolute inset-0", className)} style={style} aria-hidden>
      <div style={wrapperStyle}>
        <img
          src={imgSrc}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          style={imgStyle}
        />
      </div>
      {overlayStyle && <div className="absolute inset-0" style={overlayStyle} />}
      {children}
    </div>
  );
}
