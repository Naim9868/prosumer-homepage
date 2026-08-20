"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Variants } from "framer-motion";
import type { HeroBreakpoint, HeroSlide } from "@/types/homepage";
import type { CatalogProduct } from "@/types/catalog";
import { containerVariants, entranceVariants } from "./hero-animations";

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
