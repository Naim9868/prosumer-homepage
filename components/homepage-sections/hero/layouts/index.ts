import type { FC } from "react";
import type { HeroLayout } from "@/types/homepage";
import { CinematicHero } from "./cinematic-hero";
import { ApexelHero } from "./apexel-hero";

export const HERO_LAYOUT_COMPONENTS: Record<HeroLayout, FC> = {
  cinematic: CinematicHero,
  apexel: ApexelHero,
};