import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HeroImage } from "./hero-image";
import type { HeroBackgroundSize } from "@/types/homepage";

export function HeroBackground({
  image,
  imageDark,
  overlay,
  sizes = "100vw",
  dark = false,
  backgroundSize = { width: 100, height: 100 },
  overlayOpacity = 1,
}: {
  image?: string;
  imageDark?: string;
  overlay: string;
  sizes?: string;
  dark?: boolean;
  backgroundSize?: Partial<HeroBackgroundSize>;
  overlayOpacity?: number;
}) {
  const hasDarkImage = Boolean(imageDark);
  const showDark = dark && hasDarkImage;

  const width = backgroundSize.width ?? 100;
  const height = backgroundSize.height ?? 100;
  const fullBleed = width >= 100 && height >= 100;
  const boxStyle: CSSProperties | undefined = fullBleed
    ? undefined
    : {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: `${width}%`,
        height: `${height}%`,
      };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--hero-background)" }} />

      {image && (
        <div className={cn("absolute", fullBleed && "inset-0")} style={{ display: showDark ? "none" : "block", ...boxStyle }}>
          <HeroImage src={image} alt="" sizes={sizes} priority className="object-cover" />
        </div>
      )}
      {imageDark && (
        <div className={cn("absolute", fullBleed && "inset-0")} style={{ display: showDark ? "block" : "none", ...boxStyle }}>
          <HeroImage src={imageDark} alt="" sizes={sizes} priority className="object-cover" />
        </div>
      )}

      {overlay !== "transparent" && overlayOpacity > 0 && (
        <div className="absolute inset-0" style={{ background: overlay, opacity: overlayOpacity }} />
      )}
    </div>
  );
}

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
