"use client";

import { useHero } from "./hero-context";
import { Entrance } from "./hero-entrance";
import { typographyFor } from "@/lib/hero";

export function HeroDescription() {
  const { slide, breakpoint, content } = useHero();
  const text = slide.content.description;
  if (!text) return null;
  const t = typographyFor(slide, breakpoint);

  return (
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
  );
}
