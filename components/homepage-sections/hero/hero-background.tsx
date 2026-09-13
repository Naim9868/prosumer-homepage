import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HeroBackgroundConfig, HeroBackgroundPosition, HeroBackgroundSize } from "@/types/homepage";
import { BackgroundImageRenderer } from "@/components/shared/background-image-renderer";

// ---------------------------------------------------------------
// HeroImage (responsive image wrapper)
// ---------------------------------------------------------------

export function HeroImage({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  loading,
  className,
  style,
}: {
  src: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!src) return null;

  const isLocal = /^\/(?!\/)/.test(src);

  if (isLocal) {
    return (
      <Image
        src={src}
        alt={alt ?? ""}
        fill
        sizes={sizes}
        priority={priority}
        loading={loading}
        className={cn("object-cover", className)}
        style={style}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? ""}
      loading={loading ?? "lazy"}
      decoding="async"
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={style}
    />
  );
}

// ---------------------------------------------------------------
// HeroBackground
// ---------------------------------------------------------------

export function HeroBackground({
  image,
  overlay,
  sizes = "100vw",
  backgroundSize = { width: 1920, height: 1080 },
  backgroundPosition = { x: 0, y: 0 },
  overlayOpacity = 1,
  clip = true,
  backgroundConfig,
  borderRadius,
}: {
  image?: string;
  overlay: string;
  sizes?: string;
  backgroundSize?: Partial<HeroBackgroundSize>;
  backgroundPosition?: Partial<HeroBackgroundPosition>;
  overlayOpacity?: number;
  clip?: boolean;
  backgroundConfig?: HeroBackgroundConfig;
  borderRadius?: { topLeft: number; topRight: number; bottomLeft: number; bottomRight: number };
}) {
  const br = borderRadius && (borderRadius.topLeft || borderRadius.topRight || borderRadius.bottomLeft || borderRadius.bottomRight)
    ? borderRadius
    : undefined;
  const brStyle = br ? { borderRadius: `${br.topLeft}px ${br.topRight}px ${br.bottomRight}px ${br.bottomLeft}px` } : {};

  // When backgroundConfig is present, use the new shared renderer
  // Merge the legacy image as fallback if backgroundConfig.image is empty
  if (backgroundConfig) {
    const mergedConfig = {
      ...backgroundConfig,
      image: backgroundConfig.image || image || "",
    };
    const configBr = backgroundConfig.borderRadius && (backgroundConfig.borderRadius.topLeft || backgroundConfig.borderRadius.topRight || backgroundConfig.borderRadius.bottomLeft || backgroundConfig.borderRadius.bottomRight)
      ? backgroundConfig.borderRadius
      : undefined;
    const configBrStyle = configBr ? { borderRadius: `${configBr.topLeft}px ${configBr.topRight}px ${configBr.bottomRight}px ${configBr.bottomLeft}px` } : {};
    return (
      <div aria-hidden className={cn("pointer-events-none absolute inset-0", clip && "overflow-hidden")} style={configBrStyle}>
        <div className="absolute inset-0" style={{ background: "var(--hero-background)" }} />
        <BackgroundImageRenderer config={mergedConfig} sizes={sizes} priority />
      </div>
    );
  }

  // Legacy behavior — unchanged
  const boxStyle: CSSProperties = {
    left: "50%",
    top: "50%",
    width: `${backgroundSize.width ?? 1920}px`,
    height: `${backgroundSize.height ?? 1080}px`,
    transform: `translate(calc(-50% + ${backgroundPosition.x ?? 0}px), calc(-50% + ${backgroundPosition.y ?? 0}px))`,
  };

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", clip && "overflow-hidden")} style={brStyle}>
      <div className="absolute inset-0" style={{ background: "var(--hero-background)" }} />

      {image && (
        <div className="absolute" style={boxStyle}>
          <HeroImage src={image} alt="" sizes={sizes} priority className="object-cover" />
        </div>
      )}

      {overlay !== "transparent" && overlayOpacity > 0 && (
        <div className="absolute inset-0" style={{ background: overlay, opacity: overlayOpacity }} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// HeroContainer
// ---------------------------------------------------------------

export function HeroContainer({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("relative z-10 w-full", className)} style={style}>
      {children}
    </div>
  );
}
