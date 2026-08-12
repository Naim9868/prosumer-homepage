"use client";

import { heroCssVars, heroColorsFor, heroVisualsFor, spacingFor, heroMinHeightFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroBackground, HeroContainer } from "../hero-background";
import { HeroContent } from "../hero-content";
import { HeroMedia } from "../hero-media";
import { MobileHeroPoster } from "./mobile-hero-poster";

export function PromotionHero() {
  const { slide, breakpoint, preview } = useHero();
  const visuals = heroVisualsFor(slide);
  const colors = heroColorsFor(slide);
  const spacing = spacingFor(slide, breakpoint);
  const isMobile = breakpoint === "mobile";
  const bgSizes = preview ? (breakpoint === "mobile" ? "375px" : "640px") : "100vw";

  if (isMobile) return <MobileHeroPoster />;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        ...heroCssVars(slide),
        background: colors.background,
        minHeight: heroMinHeightFor(slide, breakpoint),
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
        className="mx-auto"
        style={{
          maxWidth: spacing.containerMaxWidth,
          paddingTop: spacing.paddingTop,
          paddingBottom: spacing.paddingBottom,
          paddingLeft: spacing.paddingX,
          paddingRight: spacing.paddingX,
        }}
      >
        <div
          className="grid grid-cols-1 items-center lg:grid-cols-[0.95fr_1.05fr]"
          style={{ gap: spacing.contentGap }}
        >
          <HeroContent />
          <HeroMedia />
        </div>
      </HeroContainer>
    </section>
  );
}
