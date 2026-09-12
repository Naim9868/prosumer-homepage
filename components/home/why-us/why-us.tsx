"use client";

import { motion } from "framer-motion";
import { Truck, Banknote, ShieldCheck, Headset, Gem, RotateCcw, type LucideIcon } from "lucide-react";
import { Container, SectionHeading } from "@/components/shared/layout-primitives";
import { whyUs } from "@/lib/data";

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  headset: Headset,
  gem: Gem,
  "rotate-ccw": RotateCcw,
};

export function WhyUs() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow="Why Prosumer" title="Built around Bangladeshi shooters" align="center" className="mx-auto" />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyUs.map((item, i) => {
            const Icon = iconMap[item.icon];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-start gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-product-title font-heading text-[15px] text-foreground">{item.title}</h3>
                  <p className="text-body-premium mt-1 text-[13.5px] text-foreground-muted">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
