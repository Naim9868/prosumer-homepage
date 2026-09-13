"use client";

import { motion } from "framer-motion";
import { heroCssVars, heroColorsFor, heroBreakpointFor, spacingFor, heroSectionHeight, heroContainerWidthFor, heroPaddingXFor } from "@/lib/hero";
import { useHero } from "../hero-context";
import { HeroBackground, HeroContainer } from "../hero-background";
import { HeroEyebrow } from "../hero-content";
import { HeroHeading } from "../hero-content";
import { HeroDescription } from "../hero-content";
import { HeroCTAGroup } from "../hero-content";
import { HeroTrustBadges } from "../hero-content";
import { HeroMedia } from "../hero-media";
import { MobileHeroPoster } from "./mobile-hero-poster";
import { cn } from "@/lib/utils";

/**
 * Apexel-style hero: full-bleed background image with the copy anchored to the
 * bottom of the banner. On wide containers the heading block sits bottom-left
 * while the CTA buttons sit bottom-right; below that width everything stacks.
 * A slow Ken Burns zoom-out runs while the slide is active.
 */
export function ApexelHero() {
  const { slide, breakpoint, preview, active, navigation } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const colors = heroColorsFor(slide);
  const spacing = spacingFor(slide, breakpoint);
  const isMobile = breakpoint === "mobile";
  const heightStyle = heroSectionHeight(slide, breakpoint);
  const sectionBr = bp.styling.borderRadius;
  const hasSectionBr = sectionBr && (sectionBr.topLeft || sectionBr.topRight || sectionBr.bottomLeft || sectionBr.bottomRight);

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
      className={cn("relative flex flex-col justify-end @container", preview ? "overflow-visible" : "overflow-hidden")}
      style={{
        ...heroCssVars(slide),
        background: colors.background,
        ...heightStyle,
        ...(hasSectionBr ? { borderRadius: `${sectionBr.topLeft}px ${sectionBr.topRight}px ${sectionBr.bottomRight}px ${sectionBr.bottomLeft}px` } : {}),
      }}
    >
      <motion.div
        aria-hidden
        className={cn("absolute inset-0", preview && "overflow-visible")}
        initial={false}
        animate={{ scale: active ? 1 : 1.08 }}
        transition={{ duration: 18, ease: "linear" }}
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
            {bp.styling.showBadges && <HeroTrustBadges />}
          </div>
          <div className="flex shrink-0 items-center @4xl:justify-end">
            <HeroCTAGroup hideSecondary={!bp.styling.showSecondaryCta} />
          </div>
          <div className="hidden @4xl:block">
            <HeroMedia />
          </div>
        </div>
      </HeroContainer>
      {navigation}
    </section>
  );
}
