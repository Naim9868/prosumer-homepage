"use client";

import { heroCssVars, heroColorsFor, heroBreakpointFor, mediaImageFor, heroMinHeightFor, heroContainerWidthFor, heroPaddingXFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroBackground, HeroContainer } from "../hero-background";
import { HeroContent } from "../hero-content";
import { cn } from "@/lib/utils";

/**
 * Mobile hero layout. Like desktop/tablet, the image is rendered as a proper
 * background layer with its own absolute px size and px offset (fully
 * independent of the section), then the hero text is overlaid on top. The
 * overflow is visible in the builder preview and clipped on the live site.
 */
export function MobileHeroPoster() {
  const { slide, preview } = useHero();
  const bp = heroBreakpointFor(slide, "mobile");
  const colors = heroColorsFor(slide);
  const media = bp.media;
  const img = media.productImage || mediaImageFor(media, "mobile") || media.backgroundImage || media.desktopImage || "";
  const align = bp.styling.textAlign;
  const overlayOpacity = bp.styling.overlayOpacity ?? 0;
  const itemsClass = align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";

  const minHeight = heroMinHeightFor(slide, "mobile");
  const bgSizes = preview ? "375px" : "100vw";

  return (
    <section
      className={cn("relative flex w-full flex-col justify-center @container", preview ? "overflow-visible" : "overflow-hidden")}
      style={{ ...heroCssVars(slide), background: colors.background, minHeight }}
    >
      {img ? (
        <HeroBackground
          overlay={colors.overlay}
          overlayOpacity={overlayOpacity}
          image={img}
          dark={slide.theme === "dark"}
          sizes={bgSizes}
          backgroundSize={media.backgroundSize}
          backgroundPosition={media.backgroundPosition}
          clip={!preview}
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
        <div className={cn("flex w-full flex-col py-9", itemsClass)}>
          <HeroContent centered={align === "center"} />
        </div>
      </HeroContainer>
    </section>
  );
}