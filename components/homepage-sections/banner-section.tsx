"use client";

import { ArrowRight } from "lucide-react";
import { ApertureMark } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import type { Section } from "@/types/homepage";

export function BannerSection({ section }: { section: Extract<Section, { type: "banner" }> }) {
  const { title, subtitle, buttonLabel, buttonUrl, image } = section.settings;
  const device = useBreakpoint();

  return (
    <SectionWrapper device={device} style={section.style} responsiveStyles={section.responsiveStyles}>
      <div
        className="relative overflow-hidden rounded-[var(--radius-xl)] px-8 py-16 text-center sm:px-16 sm:py-24"
        style={{
          background: image ? `url(${image}) center/cover` : "var(--gradient-secondary)",
        }}
      >
        <ApertureMark className="mx-auto h-10 w-10 text-white/70" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(circle at 20% 20%, rgba(201,164,76,0.35), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15), transparent 50%)" }}
        />
        <h2 className="text-display relative mx-auto mt-6 max-w-xl text-balance font-heading text-[clamp(1.75rem,4vw,3rem)] text-white">
          {title}
        </h2>
        {subtitle && <p className="text-body-premium relative mx-auto mt-4 max-w-md text-[15px] text-white/70">{subtitle}</p>}
        {buttonLabel && (
          <a href={buttonUrl || "#"} className="text-btn relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[14.5px] text-black shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]">
            {buttonLabel}
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </SectionWrapper>
  );
}
