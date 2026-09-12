"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import type { Section } from "@/types/homepage";

export function FaqSection({ section }: { section: Extract<Section, { type: "faq" }> }) {
  const { title, subtitle, items } = section.settings;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SectionWrapper id="faq" style={{ ...section.style, containerWidth: section.style.containerWidth ?? "md" }}>
      <SectionHeading eyebrow="Questions" title={title} description={subtitle} align="center" className="mx-auto" />
      <div className="mt-10 divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.id}>
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-[14.5px] font-semibold text-foreground">{item.question}</span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground-muted transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg)" : "none" }}>
                  <Plus className="h-3.5 w-3.5" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <p className="text-body-premium px-6 pb-5 text-[13.5px] text-foreground-muted">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
