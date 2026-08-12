"use client";

import { heroCssVars, heroColorsFor, heroVisualsFor, spacingFor, heroMinHeightFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroBackground, HeroContainer } from "../hero-background";
import { HeroContent } from "../hero-content";
import { MobileHeroPoster } from "./mobile-hero-poster";
import { cn } from "@/lib/utils";

export function CinematicHero() {
  const { slide, breakpoint, preview } = useHero();
  const visuals = heroVisualsFor(slide);
  const colors = heroColorsFor(slide);
  const spacing = spacingFor(slide, breakpoint);
  const isMobile = breakpoint === "mobile";
  const minHeight = heroMinHeightFor(slide, breakpoint);

  const bgSizes = preview
    ? breakpoint === "mobile"
      ? "375px"
      : breakpoint === "tablet"
        ? "768px"
        : "640px"
    : "100vw";

  if (isMobile) return <MobileHeroPoster />;

  const previewAspect = preview && !isMobile ? { aspectRatio: "16 / 7" } : undefined;

  return (
    <section
      className={cn("relative flex flex-col justify-center overflow-hidden")}
      style={{
        ...heroCssVars(slide),
        background: colors.background,
        minHeight,
        ...previewAspect,
      }}
    >
      <HeroBackground
        overlay={colors.overlay}
        overlayOpacity={visuals.styling.overlayOpacity}
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
          className="grid grid-cols-1 items-center lg:grid-cols-[1.05fr_0.95fr]"
          style={{ gap: spacing.contentGap }}
        >
          <HeroContent />
          <div aria-hidden className="hidden lg:block" />
        </div>
      </HeroContainer>
    </section>
  );
}
