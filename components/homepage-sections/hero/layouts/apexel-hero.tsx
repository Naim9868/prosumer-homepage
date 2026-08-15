"use client";

import { motion } from "framer-motion";
import { heroCssVars, heroColorsFor, heroResponsiveFor, heroVisualsFor, spacingFor, heroMinHeightFor, heroContainerWidthFor, heroPaddingXFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroBackground, HeroContainer } from "../hero-background";
import { HeroEyebrow } from "../hero-eyebrow";
import { HeroHeading } from "../hero-heading";
import { HeroDescription } from "../hero-description";
import { HeroCTAGroup } from "../hero-cta-group";
import { HeroTrustBadges } from "../hero-trust-badges";
import { MobileHeroPoster } from "./mobile-hero-poster";
import { cn } from "@/lib/utils";

/**
 * Apexel-style hero: full-bleed background image with the copy anchored to the
 * bottom of the banner. On wide containers the heading block sits bottom-left
 * while the CTA buttons sit bottom-right; below that width everything stacks.
 * A slow Ken Burns zoom-out runs while the slide is active.
 */
export function ApexelHero() {
  const { slide, breakpoint, preview, active } = useHero();
  const visuals = heroVisualsFor(slide);
  const colors = heroColorsFor(slide);
  const spacing = spacingFor(slide, breakpoint);
  const responsive = heroResponsiveFor(slide, breakpoint);
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

  return (
    <section
      className={cn("relative flex flex-col justify-end overflow-hidden @container")}
      style={{
        ...heroCssVars(slide),
        background: colors.background,
        minHeight,
      }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={false}
        animate={{ scale: active ? 1 : 1.08 }}
        transition={{ duration: 18, ease: "linear" }}
      >
        <HeroBackground
          overlay={colors.overlay}
          overlayOpacity={visuals.styling.overlayOpacity}
          image={visuals.media.backgroundImage}
          dark={slide.theme === "dark"}
          sizes={bgSizes}
          backgroundSize={visuals.media.backgroundSize}
        />
      </motion.div>
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
          className="flex flex-col @4xl:flex-row @4xl:items-end @4xl:justify-between"
          style={{ gap: spacing.contentGap }}
        >
          <div className="flex min-w-0 max-w-[52rem] flex-col" style={{ gap: spacing.elementGap }}>
            <HeroEyebrow />
            <HeroHeading />
            <HeroDescription />
            {responsive.showBadges && <HeroTrustBadges />}
          </div>
          <div className="flex shrink-0 items-center @4xl:justify-end">
            <HeroCTAGroup hideSecondary={!responsive.showSecondaryCta} />
          </div>
        </div>
      </HeroContainer>
    </section>
  );
}