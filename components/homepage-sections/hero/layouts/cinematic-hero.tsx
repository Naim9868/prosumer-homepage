"use client";

import { heroCssVars, heroColorsFor, heroBreakpointFor, spacingFor, heroSectionHeight, heroContainerWidthFor, heroPaddingXFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroBackground, HeroContainer } from "../hero-background";
import { HeroContent } from "../hero-content";
import { MobileHeroPoster } from "./mobile-hero-poster";
import { cn } from "@/lib/utils";

export function CinematicHero() {
  const { slide, breakpoint, preview, navigation } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const colors = heroColorsFor(slide);
  const spacing = spacingFor(slide, breakpoint);
  const isMobile = breakpoint === "mobile";
  const heightStyle = heroSectionHeight(slide, breakpoint);

  const bgSizes = preview
    ? breakpoint === "mobile"
      ? "375px"
      : breakpoint === "tablet"
        ? "768px"
        : "640px"
    : "100vw";

  if (isMobile) return <MobileHeroPoster />;

  return (
    <section
      className={cn("relative flex flex-col justify-center @container", preview ? "overflow-visible" : "overflow-hidden")}
      style={{
        ...heroCssVars(slide),
        background: colors.background,
        ...heightStyle,
      }}
    >
      <HeroBackground
        overlay={colors.overlay}
        overlayOpacity={bp.styling.overlayOpacity}
        image={bp.media.backgroundImage}
        sizes={bgSizes}
        backgroundSize={bp.media.backgroundSize}
        backgroundPosition={bp.media.backgroundPosition}
        clip={!preview}
        backgroundConfig={bp.media.backgroundConfig}
      />
      <HeroContainer
        className="relative mx-auto"
        style={{
          maxWidth: heroContainerWidthFor(slide, breakpoint),
          paddingTop: spacing.paddingTop,
          paddingBottom: spacing.paddingBottom,
          paddingLeft: heroPaddingXFor(slide, breakpoint),
          paddingRight: heroPaddingXFor(slide, breakpoint),
        }}
      >
        <div
          className="grid grid-cols-1 items-center @5xl:grid-cols-[1.05fr_0.95fr]"
          style={{ gap: spacing.contentGap }}
        >
          <HeroContent />
          <div aria-hidden className="hidden @5xl:block" />
        </div>
      </HeroContainer>
      {navigation}
    </section>
  );
}
