"use client";

import { useHero } from "./hero-context";
import { Entrance } from "./hero-entrance";
import { getHeroBadgeIcon } from "./hero-badge-icons";
import { heroTextPositionsFor, heroTextTransform } from "@/lib/hero";

export function HeroTrustBadges() {
  const { slide, badge } = useHero();
  const badges = slide.badges;
  if (!badges || badges.length === 0) return null;
  const transform = heroTextTransform(heroTextPositionsFor(slide).badges);

  return (
    <div style={transform}>
      <Entrance variants={badge} className="flex flex-wrap gap-x-8 gap-y-3">
        {badges.map((b) => {
          const Icon = getHeroBadgeIcon(b.icon);
          if (!b.description) {
            return (
              <div key={b.id} className="flex items-center gap-2 text-[13px] font-medium" style={{ color: "var(--hero-muted)" }}>
                <span style={{ color: "var(--hero-accent)" }} className="flex items-center">
                  <Icon className="h-4 w-4" />
                </span>
                {b.title}
              </div>
            );
          }
          return (
            <div key={b.id} className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                style={{ borderColor: "var(--hero-border)", color: "var(--hero-accent)" }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--hero-foreground)" }}>
                  {b.title}
                </p>
                <p className="text-[12px]" style={{ color: "var(--hero-muted)" }}>
                  {b.description}
                </p>
              </div>
            </div>
          );
        })}
      </Entrance>
    </div>
  );
}
