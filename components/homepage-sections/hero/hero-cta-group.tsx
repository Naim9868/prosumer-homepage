"use client";

import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { HeroButtonSize, HeroTypography } from "@/types/homepage";
import { buttonStyleCss, heroColorsFor, typographyFor, heroBreakpointFor, heroTextPositionsFor, heroTextTransform } from "@/lib/hero";
import { useHero } from "./hero-context";
import { Entrance } from "./hero-entrance";

function buttonBox(size: HeroButtonSize, t: HeroTypography): CSSProperties {
  const fixed = size.width > 0 || size.height > 0;
  return {
    fontSize: size.fontSize > 0 ? size.fontSize : t.buttonFontSize,
    fontWeight: size.fontWeight > 0 ? size.fontWeight : t.buttonWeight,
    padding: `${size.paddingY}px ${size.paddingX}px`,
    borderRadius: size.borderRadius,
    ...(size.width > 0 ? { width: size.width } : {}),
    ...(size.height > 0 ? { height: size.height } : {}),
    ...(fixed ? { justifyContent: "center" } : {}),
  };
}

export function HeroCTAGroup({ hideSecondary = false }: { hideSecondary?: boolean }) {
  const { slide, breakpoint, cta } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const colors = heroColorsFor(slide);
  const t = typographyFor(slide, breakpoint);
  const primary = bp.buttons.primary;
  const secondary = bp.buttons.secondary;
  const transform = heroTextTransform(heroTextPositionsFor(slide, breakpoint).buttons);
  const blockWidth = bp.styling.blockWidths.buttons;

  return (
    <div style={{ ...transform, ...(blockWidth > 0 ? { maxWidth: blockWidth } : {}) }}>
      <Entrance variants={cta} className="flex flex-wrap items-center gap-4">
        {primary.text && (
          <a
            href={primary.url || "#"}
            className="group inline-flex items-center gap-2 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            style={{
              ...buttonStyleCss(primary.style, colors),
              ...buttonBox(primary.size, t),
              ...(primary.textColor ? { color: primary.textColor } : {}),
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
              ...buttonBox(secondary.size, t),
              ...(secondary.textColor ? { color: secondary.textColor } : {}),
            }}
          >
            {secondary.text}
          </a>
        )}
      </Entrance>
    </div>
  );
}
