"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSliderSettings } from "@/types/homepage";

export function HeroNavigation({
  count,
  active,
  onPrev,
  onNext,
  onGo,
  settings,
  accent,
  foreground,
}: {
  count: number;
  active: number;
  onPrev: () => void;
  onNext: () => void;
  onGo: (i: number) => void;
  settings: HeroSliderSettings;
  accent: string;
  foreground: string;
}) {
  if (count <= 1) return null;

  const arrowBase = {
    borderColor: `${foreground}2E`,
    color: foreground,
    background: "rgba(0,0,0,0.22)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  } as const;

  return (
    <>
      {settings.showArrows && (
        <>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border transition-transform hover:scale-105"
            style={arrowBase}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border transition-transform hover:scale-105"
            style={arrowBase}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {settings.showDots && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onGo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: i === active ? 26 : 8, background: i === active ? accent : `${foreground}38` }}
            />
          ))}
        </div>
      )}

      {settings.showProgress && settings.autoplay && (
        <div className="absolute inset-x-0 bottom-0 z-20 h-0.5" style={{ background: `${foreground}18` }}>
          <div
            key={active}
            className="hero-progress-bar h-full"
            style={{ background: accent, animationDuration: `${settings.interval}ms` }}
          />
        </div>
      )}
    </>
  );
}
