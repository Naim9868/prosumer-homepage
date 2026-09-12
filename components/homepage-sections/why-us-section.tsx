"use client";

import { motion } from "framer-motion";
import {
  Truck,
  Banknote,
  ShieldCheck,
  Headset,
  Gem,
  RotateCcw,
  Star,
  Sparkles,
  Zap,
  Heart,
  Camera,
  Package,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import type { Section, WhyUsIcon, WhyUsIconVariant } from "@/types/homepage";
import { cn } from "@/lib/utils";

const iconMap: Record<WhyUsIcon, LucideIcon> = {
  truck: Truck,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  headset: Headset,
  gem: Gem,
  "rotate-ccw": RotateCcw,
  star: Star,
  sparkles: Sparkles,
  zap: Zap,
  heart: Heart,
  camera: Camera,
  package: Package,
};

const gridCols: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2 lg:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const iconVariantClasses: Record<WhyUsIconVariant, string> = {
  soft: "bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground",
  filled: "bg-primary text-primary-foreground",
  outline: "border border-primary/30 bg-transparent text-primary",
};

export function WhyUsSection({
  section,
}: {
  section: Extract<Section, { type: "whyUs" }>;
}) {
  const { eyebrow, title, subtitle, columns, items, animated, iconVariant, iconSize } = section.settings;
  if (items.length === 0) return null;

  return (
    <SectionWrapper id="why-us" style={section.style}>
      <SectionHeading eyebrow={eyebrow} title={title} description={subtitle} align="center" className="mx-auto" />

      <div className={cn("mt-12 grid grid-cols-1 gap-4", gridCols[columns])}>
        {items.map((item, i) => {
          const Icon = iconMap[item.icon] ?? Star;
          const card = (
            <div className="flex items-start gap-4 p-6">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  iconVariantClasses[iconVariant]
                )}
              >
                <Icon style={{ width: iconSize, height: iconSize }} />
              </div>
              <div>
                <h3 className="text-product-title font-heading text-[15px] text-foreground">{item.title}</h3>
                <p className="text-body-premium mt-1 text-[13.5px] text-foreground-muted">{item.description}</p>
              </div>
            </div>
          );

          const cardClass =
            "group rounded-[var(--radius-lg)] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md";

          if (!animated) {
            return (
              <div key={item.id} className={cardClass}>
                {card}
              </div>
            );
          }

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % columns) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={cardClass}
            >
              {card}
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}