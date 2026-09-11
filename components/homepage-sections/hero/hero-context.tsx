"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Variants } from "framer-motion";
import type { HeroBreakpoint, HeroEntrance, HeroSlide } from "@/types/homepage";
import type { CatalogProduct } from "@/types/catalog";

// ---------------------------------------------------------------
// Animation variants (previously hero-animations.ts)
// ---------------------------------------------------------------

const EASE = [0.22, 1, 0.36, 1] as const;

function entranceVariants(entrance: HeroEntrance, durationSec: number): Variants {
  const duration = Math.max(0.001, durationSec);
  switch (entrance) {
    case "fade":
      return {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration } },
      };
    case "fade-up":
      return {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
      };
    case "fade-down":
      return {
        hidden: { opacity: 0, y: -24 },
        show: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
      };
    case "scale":
      return {
        hidden: { opacity: 0, scale: 0.96 },
        show: { opacity: 1, scale: 1, transition: { duration, ease: EASE } },
      };
    default:
      return {
        hidden: { opacity: 1 },
        show: { opacity: 1 },
      };
  }
}

function containerVariants(delaySec: number, staggerSec: number): Variants {
  return {
    hidden: {},
    show: {
      transition: { delayChildren: delaySec, staggerChildren: Math.max(0, staggerSec) },
    },
  };
}

// Re-export for lib/hero.ts which uses these in animationFor()
export { entranceVariants, containerVariants };

// ---------------------------------------------------------------
// Hero context
// ---------------------------------------------------------------

export interface HeroContextValue {
  slide: HeroSlide;
  active: boolean;
  breakpoint: HeroBreakpoint;
  preview: boolean;
  products: Record<string, CatalogProduct>;
  container: Variants;
  content: Variants;
  cta: Variants;
  badge: Variants;
  media: Variants;
  /** Slider controls (arrows / dots / progress) anchored to the hero section. */
  navigation?: ReactNode;
}

const HeroContext = createContext<HeroContextValue | null>(null);

export function HeroProvider({
  slide,
  active,
  breakpoint,
  preview = false,
  products = {},
  navigation,
  children,
}: {
  slide: HeroSlide;
  active: boolean;
  breakpoint: HeroBreakpoint;
  preview?: boolean;
  products?: Record<string, CatalogProduct>;
  navigation?: ReactNode;
  children: ReactNode;
}) {
  const value = useMemo<HeroContextValue>(() => {
    const a = slide.animation;
    return {
      slide,
      active,
      breakpoint,
      preview,
      products,
      container: containerVariants(a.delay / 1000, a.stagger / 1000),
      content: entranceVariants(a.contentEntrance, a.duration / 1000),
      cta: entranceVariants(a.ctaEntrance, a.duration / 1000),
      badge: entranceVariants(a.badgeEntrance, a.duration / 1000),
      media: entranceVariants(a.imageEntrance, a.duration / 1000),
      navigation,
    };
  }, [slide, active, breakpoint, preview, products, navigation]);

  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>;
}

export function useHero(): HeroContextValue {
  const ctx = useContext(HeroContext);
  if (!ctx) throw new Error("useHero must be used within a HeroProvider");
  return ctx;
}
