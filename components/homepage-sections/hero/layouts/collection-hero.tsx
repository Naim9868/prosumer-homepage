"use client";

import { heroCssVars, heroColorsFor, heroVisualsFor, spacingFor, heroMinHeightFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroBackground, HeroContainer } from "../hero-background";
import { HeroContent } from "../hero-content";
import { MobileHeroPoster } from "./mobile-hero-poster";

export function CollectionHero() {
  const { slide, breakpoint, preview } = useHero();
  const visuals = heroVisualsFor(slide);
  const colors = heroColorsFor(slide);
  const spacing = spacingFor(slide, breakpoint);
  const isMobile = breakpoint === "mobile";
  const minHeight = heroMinHeightFor(slide, breakpoint);
  const bgSizes = preview ? (breakpoint === "mobile" ? "375px" : "640px") : "100vw";

  if (isMobile) return <MobileHeroPoster />;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        ...heroCssVars(slide),
        background: colors.background,
        minHeight,
      }}
    >
      <HeroBackground
        overlay={colors.overlay}
        overlayOpacity={visuals.styling.overlayOpacity ?? 1}
        image={visuals.media.backgroundImage}
        dark={slide.theme === "dark"}
        sizes={bgSizes}
        backgroundSize={visuals.media.backgroundSize}
      />
      <HeroContainer
        className="relative mx-auto"
        style={{
          maxWidth: spacing.containerMaxWidth,
          paddingTop: spacing.paddingTop,
          paddingBottom: spacing.paddingBottom,
          paddingLeft: spacing.paddingX,
          paddingRight: spacing.paddingX,
        }}
      >
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            gap: spacing.elementGap,
            minHeight:
              minHeight === undefined
                ? `min(calc(100vh - ${spacing.paddingTop} - ${spacing.paddingBottom}), 42rem)`
                : `min(calc(${typeof minHeight === "number" ? minHeight + "px" : minHeight} - ${spacing.paddingTop} - ${spacing.paddingBottom}), 42rem)`,
          }}
        >
          <HeroContent centered />
        </div>
      </HeroContainer>
    </section>
  );
}
