import type { Variants } from "framer-motion";
import type { HeroEntrance } from "@/types/homepage";

const EASE = [0.22, 1, 0.36, 1] as const;

export type HeroAnimTypes = Variants;

export function entranceVariants(entrance: HeroEntrance, durationSec: number): Variants {
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

export function containerVariants(delaySec: number, staggerSec: number): Variants {
  return {
    hidden: {},
    show: {
      transition: { delayChildren: delaySec, staggerChildren: Math.max(0, staggerSec) },
    },
  };
}
