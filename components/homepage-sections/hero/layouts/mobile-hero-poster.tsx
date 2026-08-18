"use client";

import { heroCssVars, heroColorsFor, heroBreakpointFor, mediaImageFor, heroMinHeightFor, heroContainerWidthFor, heroPaddingXFor, spacingFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroContainer } from "../hero-background";
import { HeroImage } from "../hero-image";
import { HeroContent } from "../hero-content";
import { cn } from "@/lib/utils";

/**
 * Mobile hero layout. The image is a full-bleed cover layer that always fills
 * the section (never a fixed oversized box), and the text is overlaid on top.
 * The section grows to fit the content plus any downward text offsets, so the
 * builder preview and the live site render identically — nothing is cropped or
 * clipped on the storefront.
 */
export function MobileHeroPoster() {
  const { slide } = useHero();
  const bp = heroBreakpointFor(slide, "mobile");
  const colors = heroColorsFor(slide);
  const media = bp.media;
  const baseImg = media.productImage || mediaImageFor(media, "mobile") || media.backgroundImage || media.desktopImage || "";
  const img = slide.theme === "dark" && media.backgroundImageDark ? media.backgroundImageDark : baseImg;
  const align = bp.styling.textAlign;
  const overlayOpacity = bp.styling.overlayOpacity ?? 0;
  const itemsClass = align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";

  const minHeight = heroMinHeightFor(slide, "mobile");
  const spacing = spacingFor(slide, "mobile");

  // Text can be pushed down via per-element y offsets; reserve room for the
  // largest positive offset so it is never clipped by the section bounds.
  const offsets = Object.values(bp.styling.textPositions ?? {}).map((t) => Math.max(0, t?.y ?? 0));
  const maxOffset = Math.max(0, ...offsets);

  return (
    <section
      className="relative flex w-full flex-col justify-center @container"
      style={{ ...heroCssVars(slide), background: colors.background, minHeight }}
    >
      {img ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <HeroImage src={img} alt="" sizes="100vw" priority className="object-cover" />
          {overlayOpacity > 0 && (
            <div className="absolute inset-0" style={{ background: colors.overlay, opacity: overlayOpacity }} />
          )}
        </div>
      ) : null}
      <HeroContainer
        className="relative mx-auto flex w-full"
        style={{
          maxWidth: heroContainerWidthFor(slide, "mobile"),
          paddingLeft: heroPaddingXFor(slide, "mobile"),
          paddingRight: heroPaddingXFor(slide, "mobile"),
        }}
      >
        <div
          className={cn("flex w-full flex-col", itemsClass)}
          style={{ paddingTop: spacing.paddingTop, paddingBottom: spacing.paddingBottom + maxOffset }}
        >
          <HeroContent centered={align === "center"} />
        </div>
      </HeroContainer>
    </section>
  );
}