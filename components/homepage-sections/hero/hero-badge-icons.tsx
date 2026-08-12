import type { ReactElement } from "react";
import { ShieldCheck, Truck, Star, Gem, Sparkles, Smartphone, Headset, Package, Zap } from "lucide-react";
import { ApertureMark } from "@/components/shared/layout-primitives";
import type { HeroBadgeIcon } from "@/types/homepage";

type IconRender = (props: { className?: string }) => ReactElement;

export const HERO_BADGE_ICONS: Record<HeroBadgeIcon, IconRender> = {
  aperture: ({ className }) => <ApertureMark className={className} />,
  shield: ({ className }) => <ShieldCheck className={className} />,
  truck: ({ className }) => <Truck className={className} />,
  star: ({ className }) => <Star className={className} />,
  gem: ({ className }) => <Gem className={className} />,
  sparkles: ({ className }) => <Sparkles className={className} />,
  smartphone: ({ className }) => <Smartphone className={className} />,
  headset: ({ className }) => <Headset className={className} />,
  package: ({ className }) => <Package className={className} />,
  zap: ({ className }) => <Zap className={className} />,
};

export const HERO_BADGE_ICON_OPTIONS: { value: HeroBadgeIcon; label: string }[] = [
  { value: "aperture", label: "Aperture" },
  { value: "shield", label: "Shield" },
  { value: "truck", label: "Truck" },
  { value: "star", label: "Star" },
  { value: "gem", label: "Gem" },
  { value: "sparkles", label: "Sparkles" },
  { value: "smartphone", label: "Smartphone" },
  { value: "headset", label: "Headset" },
  { value: "package", label: "Package" },
  { value: "zap", label: "Zap" },
];

export function getHeroBadgeIcon(name: HeroBadgeIcon): IconRender {
  return HERO_BADGE_ICONS[name] ?? HERO_BADGE_ICONS.sparkles;
}
