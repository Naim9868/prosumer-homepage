"use client";

import { ApertureMark } from "@/components/shared/layout-primitives";
import { useHero } from "./hero-context";
import { Entrance } from "./hero-entrance";
import { typographyFor, heroBreakpointFor, heroTextPositionsFor, heroTextTransform } from "@/lib/hero";

export function HeroEyebrow() {
  const { slide, breakpoint, content } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const text = bp.content.eyebrow;
  if (!text) return null;
  const t = typographyFor(slide, breakpoint);
  const transform = heroTextTransform(heroTextPositionsFor(slide, breakpoint).eyebrow);
  const blockWidth = bp.styling.blockWidths.eyebrow;

  return (
    <div style={{ ...transform, ...(blockWidth > 0 ? { maxWidth: blockWidth } : {}) }}>
      <Entrance variants={content}>
        <span
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 uppercase"
          style={{
            fontSize: t.eyebrowSize,
            letterSpacing: `${t.eyebrowLetterSpacing}em`,
            fontWeight: 600,
            color: "var(--hero-accent)",
            border: "1px solid color-mix(in srgb, var(--hero-foreground) 16%, transparent)",
            background: "color-mix(in srgb, var(--hero-foreground) 6%, transparent)",
          }}
        >
          <ApertureMark className="h-3.5 w-3.5" />
          {text}
        </span>
      </Entrance>
    </div>
  );
}
