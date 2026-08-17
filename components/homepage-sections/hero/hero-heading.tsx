"use client";

import { Fragment } from "react";
import { useHero } from "./hero-context";
import { Entrance } from "./hero-entrance";
import { typographyFor, heroBreakpointFor, heroTextPositionsFor, heroTextTransform } from "@/lib/hero";

/**
 * Renders the heading, supporting two light markup tokens typed in the admin:
 *  - {accent}…{/accent} → gold italic emphasis (e.g. "can't.")
 *  - \n               → a line break
 */
function renderHeading(text: string) {
  const parts = text.split(/(\{accent\}|\{\/accent\}|\n)/g);
  let accentOpen = false;
  return parts.map((part, i) => {
    if (part === "{accent}") {
      accentOpen = true;
      return null;
    }
    if (part === "{/accent}") {
      accentOpen = false;
      return null;
    }
    if (part === "\n") return <br key={i} />;
    if (!part) return null;
    if (accentOpen) {
      return (
        <em key={i} style={{ color: "var(--hero-accent)", fontStyle: "italic" }}>
          {part}
        </em>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function HeroHeading() {
  const { slide, breakpoint, content } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const t = typographyFor(slide, breakpoint);
  const heading = bp.content.heading;
  if (!heading || !heading.trim()) return null;
  const transform = heroTextTransform(heroTextPositionsFor(slide, breakpoint).heading);
  const blockWidth = bp.styling.blockWidths.heading;

  return (
    <div style={{ ...transform, ...(blockWidth > 0 ? { maxWidth: blockWidth } : {}) }}>
      <Entrance variants={content}>
        <h1
          className="font-heading text-balance"
          style={{
            fontSize: t.headingSize,
            fontWeight: t.headingWeight,
            lineHeight: t.headingLineHeight,
            letterSpacing: t.headingLetterSpacing,
            color: "var(--hero-foreground)",
            margin: 0,
          }}
        >
          {renderHeading(heading)}
        </h1>
      </Entrance>
    </div>
  );
}
