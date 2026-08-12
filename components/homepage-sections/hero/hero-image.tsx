import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Responsive hero image. Uses next/image for local/public assets so the
 * storefront gets optimized, sized, priority-aware loading; falls back to a
 * plain <img> for arbitrary external URLs (no remotePatterns dependency).
 */
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
