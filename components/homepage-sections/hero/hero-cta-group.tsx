"use client";

import { ArrowRight } from "lucide-react";
import { buttonStyleCss, heroColorsFor, typographyFor } from "@/lib/hero";
import { useHero } from "./hero-context";
import { Entrance } from "./hero-entrance";

export function HeroCTAGroup({ hideSecondary = false }: { hideSecondary?: boolean }) {
  const { slide, breakpoint, cta } = useHero();
  const colors = heroColorsFor(slide);
  const t = typographyFor(slide, breakpoint);
  const primary = slide.buttons.primary;
  const secondary = slide.buttons.secondary;

  return (
    <Entrance variants={cta} className="flex flex-wrap items-center gap-4">
      {primary.text && (
        <a
          href={primary.url || "#"}
          className="group inline-flex items-center gap-2 transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{
            ...buttonStyleCss(primary.style, colors),
            fontSize: t.buttonFontSize,
            fontWeight: t.buttonWeight,
            padding: "15px 30px",
            borderRadius: 9999,
          }}
        >
          {primary.text}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      )}
      {!hideSecondary && secondary.text && (
        <a
          href={secondary.url || "#"}
          className="inline-flex items-center gap-2 transition-colors"
          style={{
            ...buttonStyleCss(secondary.style, colors),
            fontSize: t.buttonFontSize,
            fontWeight: t.buttonWeight,
            padding: "15px 26px",
            borderRadius: 9999,
          }}
        >
          {secondary.text}
        </a>
      )}
    </Entrance>
  );
}
