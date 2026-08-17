"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { HeroBreakpoint, HeroSliderSettings, HeroSlide, HeroTheme, HeroTransition } from "@/types/homepage";
import type { CatalogProduct } from "@/types/catalog";
import { heroColorsFor, materializeHeroSlide } from "@/lib/hero";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import { HERO_LAYOUT_COMPONENTS } from "./layouts";
import { HeroProvider } from "./hero-context";
import { HeroNavigation } from "./hero-navigation";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function slideStyle(
  index: number,
  active: number,
  transition: HeroTransition,
  durationMs: number,
  reducedMotion: boolean
): CSSProperties {
  const dur = reducedMotion ? 0 : durationMs;
  const isActive = index === active;
  const base: CSSProperties = { pointerEvents: isActive ? undefined : "none" };

  switch (transition) {
    case "slide":
      return {
        ...base,
        opacity: isActive ? 1 : 0,
        transform: `translateX(${(index - active) * 100}%)`,
        transition: `transform ${dur}ms ${EASE}, opacity ${dur}ms ease`,
      };
    case "crossfade":
      return {
        ...base,
        opacity: isActive ? 1 : 0,
        transform: isActive ? "scale(1)" : "scale(1.03)",
        transition: `opacity ${dur}ms ease, transform ${dur}ms ease`,
      };
    default:
      return {
        ...base,
        opacity: isActive ? 1 : 0,
        transition: `opacity ${dur}ms ease`,
      };
  }
}

function useLiveBreakpoint(enabled: boolean): HeroBreakpoint {
  const [bp, setBp] = useState<HeroBreakpoint>("desktop");
  useEffect(() => {
    if (!enabled) return;
    const compute = () => setBp(window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop");
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [enabled]);
  return bp;
}

export function HeroRenderer({
  slides: rawSlides,
  settings,
  breakpoint,
  preview = false,
  forceTheme,
  controlledIndex,
  onIndexChange,
  products = {},
}: {
  slides: HeroSlide[];
  settings: HeroSliderSettings;
  breakpoint?: HeroBreakpoint;
  preview?: boolean;
  forceTheme?: HeroTheme;
  controlledIndex?: number;
  onIndexChange?: (i: number) => void;
  products?: Record<string, CatalogProduct>;
}) {
  const liveBp = useLiveBreakpoint(breakpoint === undefined);
  const bp = breakpoint ?? liveBp;

  // Each slide stores a full dataset per theme (light/dark). The public site
  // renders whichever theme the visitor uses; the builder can force a theme so
  // its preview shows the theme being edited.
  const { theme: siteTheme } = useTheme();
  const resolvedTheme = forceTheme ?? siteTheme;

  const slides = rawSlides.map((s) => materializeHeroSlide(s, resolvedTheme)).filter((s) => s.enabled);
  const count = slides.length;
  const [internal, setInternal] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const active = Math.min(Math.max(controlledIndex ?? internal, 0), Math.max(count - 1, 0));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return;
      const next = ((i % count) + count) % count;
      setInternal(next);
      onIndexChange?.(next);
    },
    [count, onIndexChange]
  );

  useEffect(() => {
    if (!settings.autoplay || preview || reducedMotion || paused || count <= 1) return;
    const id = setTimeout(() => goTo(active + 1), settings.interval);
    return () => clearTimeout(id);
  }, [settings.autoplay, settings.interval, active, reducedMotion, paused, count, goTo, preview]);

  if (count === 0) return null;

  const activeSlide = slides[active];
  const colors = heroColorsFor(activeSlide);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero slideshow"
      tabIndex={0}
      className="relative touch-pan-y"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goTo(active - 1);
        if (e.key === "ArrowRight") goTo(active + 1);
      }}
      onMouseEnter={() => settings.pauseOnHover && setPaused(true)}
      onMouseLeave={() => settings.pauseOnHover && setPaused(false)}
      onFocus={() => settings.pauseOnHover && setPaused(true)}
      onBlur={() => settings.pauseOnHover && setPaused(false)}
      onTouchStart={(e) => {
        const t = e.touches[0];
        if (t) touchStart.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const t = e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          goTo(active + (dx < 0 ? 1 : -1));
        }
      }}
    >
      <div className={cn("grid w-full", preview ? "overflow-visible" : "overflow-hidden")} style={{ gridTemplateColumns: "1fr", gridTemplateRows: "1fr" }}>
        {slides.map((slide, i) => {
          const Layout = HERO_LAYOUT_COMPONENTS[slide.layout] ?? HERO_LAYOUT_COMPONENTS.cinematic;
          const isActive = i === active;
          return (
            <div
              key={slide.id}
              className="min-w-0 [grid-area:1/1]"
              style={slideStyle(i, active, settings.transition, settings.transitionDuration, reducedMotion)}
              aria-hidden={!isActive}
            >
              <HeroProvider slide={slide} active={isActive} breakpoint={bp} preview={preview} products={products}>
                <Layout />
              </HeroProvider>
            </div>
          );
        })}
      </div>

      <HeroNavigation
        count={count}
        active={active}
        onPrev={() => goTo(active - 1)}
        onNext={() => goTo(active + 1)}
        onGo={goTo}
        settings={settings}
        accent={colors.accent}
        foreground={colors.foreground}
      />
    </div>
  );
}
