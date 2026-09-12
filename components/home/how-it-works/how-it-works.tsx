"use client";

import { motion } from "framer-motion";
import { Container, SectionHeading } from "@/components/shared/layout-primitives";
import { howItWorks } from "@/lib/data";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border bg-muted/40 py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow="Process" title="From box to first shot in a minute" align="center" className="mx-auto" />

        <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[26px] hidden h-px bg-border md:block"
          />
          {howItWorks.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background font-heading text-lg font-bold text-primary shadow-sm">
                {step.step}
              </span>
              <h3 className="text-product-title mt-5 font-heading text-lg text-foreground">{step.title}</h3>
              <p className="text-body-premium mt-2 max-w-xs text-[14px] text-foreground-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
