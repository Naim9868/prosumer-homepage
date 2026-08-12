"use client";

import { heroCssVars, heroColorsFor, heroResponsiveFor, heroVisualsFor, mediaImageFor, heroMinHeightFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroContent } from "../hero-content";
import { cn } from "@/lib/utils";

/**
 * Mobile-only hero layout. The slide image is shown full-width at its natural
 * aspect ratio, then the hero text sits below it on the section background so
 * it is always readable and never clipped or overlapped by a thin image strip.
 * Height is content-driven; only a numeric customHeight is honored as a
 * minimum so the section grows gracefully with longer copy.
 */
export function MobileHeroPoster() {
  const { slide } = useHero();
  const visuals = heroVisualsFor(slide);
  const colors = heroColorsFor(slide);
  const responsive = heroResponsiveFor(slide, "mobile");
  const media = visuals.media;
  const img = media.productImage || mediaImageFor(media, "mobile") || media.backgroundImage || media.desktopImage || "";
  const align = responsive.textAlign;
  const overlayOpacity = visuals.styling.overlayOpacity ?? 0;
  const itemsClass = align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";

  const minHeight = heroMinHeightFor(slide, "mobile");
  const minH = typeof minHeight === "number" ? minHeight : undefined;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ ...heroCssVars(slide), background: colors.background, minHeight: minH }}
    >
      {img ? (
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={slide.content.heading || ""}
            loading="eager"
            decoding="async"
            className="block h-auto w-full object-cover"
          />
          {overlayOpacity > 0 && (
            <div className="pointer-events-none absolute inset-0" style={{ background: colors.overlay, opacity: overlayOpacity }} />
          )}
        </div>
      ) : null}
      <div className={cn("flex w-full flex-col px-5 pb-9 pt-5", itemsClass)}>
        <HeroContent centered={align === "center"} />
      </div>
    </section>
  );
}
