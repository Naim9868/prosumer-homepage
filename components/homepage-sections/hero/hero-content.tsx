"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { spacingFor, heroResponsiveFor } from "@/lib/hero";
import { useHero } from "./hero-context";
import { HeroEyebrow } from "./hero-eyebrow";
import { HeroHeading } from "./hero-heading";
import { HeroDescription } from "./hero-description";
import { HeroCTAGroup } from "./hero-cta-group";
import { HeroTrustBadges } from "./hero-trust-badges";

export function HeroContent({ centered = false, className }: { centered?: boolean; className?: string }) {
  const { slide, breakpoint, active, container } = useHero();
  const spacing = spacingFor(slide, breakpoint);
  const isMobile = breakpoint === "mobile";
  const responsive = heroResponsiveFor(slide, breakpoint);
  const align = centered ? "center" : responsive.textAlign;
  const hideBadges = isMobile && !responsive.showBadges;
  const hideSecondary = isMobile && !responsive.showSecondaryCta;
  const itemsClass = align === "center" ? "items-center" : align === "right" ? "items-end" : "items-start";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={active ? "show" : "hidden"}
      className={cn("flex min-w-0 flex-col", itemsClass, className)}
      style={{ gap: spacing.elementGap, textAlign: align }}
    >
      <HeroEyebrow />
      <HeroHeading />
      <HeroDescription />
      <HeroCTAGroup hideSecondary={hideSecondary} />
      {!hideBadges && <HeroTrustBadges />}
    </motion.div>
  );
}
