"use client";

import { heroCssVars, heroColorsFor, heroBreakpointFor, mediaImageFor, heroSectionHeight, heroContainerWidthFor, heroPaddingXFor, spacingFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroBackground, HeroContainer } from "../hero-background";
import { HeroContent } from "../hero-content";
import { cn } from "@/lib/utils";

/**
 * Mobile hero layout. Renders the same background layer as desktop/tablet
 * (an absolutely-sized image box driven by `backgroundSize` /
 * `backgroundPosition`), so the size and position controls work identically
 * on every device. The text is overlaid on top and the section grows to fit
 * the content plus any downward text offsets.
 */
export function MobileHeroPoster() {
  const { slide, preview, navigation } = useHero();
  const bp = heroBreakpointFor(slide, "mobile");
  const colors = heroColorsFor(slide);
  const media = bp.media;
  const img = media.productImage || mediaImageFor(media, "mobile") || media.backgroundImage || media.desktopImage || "";
  const align = bp.styling.textAlign;
  const overlayOpacity = bp.styling.overlayOpacity ?? 0;
  const itemsClass = align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";

  const heightStyle = heroSectionHeight(slide, "mobile");
  const spacing = spacingFor(slide, "mobile");
  const sectionBr = bp.styling.borderRadius;
  const hasSectionBr = sectionBr && (sectionBr.topLeft || sectionBr.topRight || sectionBr.bottomLeft || sectionBr.bottomRight);

  // Text can be pushed down via per-element y offsets; reserve room for the
  // largest positive offset so it is never clipped by the section bounds.
  const offsets = Object.values(bp.styling.textPositions ?? {}).map((t) => Math.max(0, t?.y ?? 0));
  const maxOffset = Math.max(0, ...offsets);

  const bgSizes = preview ? "375px" : "100vw";

  return (
    <section
      className={cn("relative flex w-full flex-col justify-center @container", preview ? "overflow-visible" : "overflow-hidden")}
      style={{
        ...heroCssVars(slide),
        background: colors.background,
        ...heightStyle,
        ...(hasSectionBr ? { borderRadius: `${sectionBr.topLeft}px ${sectionBr.topRight}px ${sectionBr.bottomRight}px ${sectionBr.bottomLeft}px` } : {}),
      }}
    >
      {img ? (
        <HeroBackground
          overlay={colors.overlay}
          overlayOpacity={overlayOpacity}
          image={img}
          sizes={bgSizes}
          backgroundSize={media.backgroundSize}
          backgroundPosition={media.backgroundPosition}
          clip={!preview}
          backgroundConfig={media.backgroundConfig}
        />
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
      {navigation}
    </section>
  );
}
