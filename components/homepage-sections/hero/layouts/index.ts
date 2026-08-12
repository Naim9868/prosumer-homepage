import type { FC } from "react";
import type { HeroLayout } from "@/types/homepage";
import { PremiumSplitHero } from "./premium-split-hero";
import { CinematicHero } from "./cinematic-hero";
import { ProductFocusHero } from "./product-focus-hero";
import { CollectionHero } from "./collection-hero";
import { PromotionHero } from "./promotion-hero";

export const HERO_LAYOUT_COMPONENTS: Record<HeroLayout, FC> = {
  "premium-split": PremiumSplitHero,
  cinematic: CinematicHero,
  "product-focus": ProductFocusHero,
  collection: CollectionHero,
  promotion: PromotionHero,
};
