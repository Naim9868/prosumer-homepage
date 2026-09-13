"use client";

import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import type { Section } from "@/types/homepage";

export function NewsletterSection({ section }: { section: Extract<Section, { type: "newsletter" }> }) {
  const { title, subtitle, placeholder, buttonLabel } = section.settings;
  const device = useBreakpoint();

  return (
    <SectionWrapper device={device} style={section.style} responsiveStyles={section.responsiveStyles}>
      <div className="mx-auto max-w-xl text-center">
        <SectionHeading title={title} description={subtitle} align="center" className="mx-auto" />
        <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-6 flex max-w-sm items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-4">
          <label htmlFor="hp-newsletter-email" className="sr-only">Email address</label>
          <input id="hp-newsletter-email" type="email" required placeholder={placeholder} className="w-full bg-transparent text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none" />
          <button type="submit" className="text-btn flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] text-primary-foreground transition-transform hover:scale-105">
            {buttonLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </SectionWrapper>
  );
}
