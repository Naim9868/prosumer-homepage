"use client";

import { useHero } from "./hero-context";
import { Entrance } from "./hero-entrance";
import { typographyFor, heroBreakpointFor, heroTextPositionsFor, heroTextTransform } from "@/lib/hero";

export function HeroDescription() {
  const { slide, breakpoint, content } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const text = bp.content.description;
  if (!text) return null;
  const t = typographyFor(slide, breakpoint);
  const transform = heroTextTransform(heroTextPositionsFor(slide, breakpoint).description);
  const blockWidth = bp.styling.blockWidths.description;

  return (
    <div style={{ ...transform, ...(blockWidth > 0 ? { maxWidth: blockWidth } : {}) }}>
      <Entrance variants={content}>
        <p
          style={{
            fontSize: t.descriptionSize,
            fontWeight: t.descriptionWeight,
            lineHeight: 1.65,
            color: "var(--hero-muted)",
            margin: 0,
          }}
        >
          {text}
        </p>
      </Entrance>
    </div>
  );
}
