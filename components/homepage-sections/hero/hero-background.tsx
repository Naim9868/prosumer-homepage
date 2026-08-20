import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HeroImage } from "./hero-image";
import type { HeroBackgroundPosition, HeroBackgroundSize } from "@/types/homepage";

export function HeroBackground({
  image,
  overlay,
  sizes = "100vw",
  backgroundSize = { width: 1920, height: 1080 },
  backgroundPosition = { x: 0, y: 0 },
  overlayOpacity = 1,
  clip = true,
}: {
  image?: string;
  overlay: string;
  sizes?: string;
  backgroundSize?: Partial<HeroBackgroundSize>;
  backgroundPosition?: Partial<HeroBackgroundPosition>;
  overlayOpacity?: number;
  clip?: boolean;
}) {
  // The image box has its own absolute px size and its own px offset from the
  // section center — both independent of the section dimensions. When it is
  // larger than the section it overflows; `clip` controls whether that
  // overflow is hidden (public) or visible (builder preview).
  const boxStyle: CSSProperties = {
    left: "50%",
    top: "50%",
    width: `${backgroundSize.width ?? 1920}px`,
    height: `${backgroundSize.height ?? 1080}px`,
    transform: `translate(calc(-50% + ${backgroundPosition.x ?? 0}px), calc(-50% + ${backgroundPosition.y ?? 0}px))`,
  };

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", clip && "overflow-hidden")}>
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
