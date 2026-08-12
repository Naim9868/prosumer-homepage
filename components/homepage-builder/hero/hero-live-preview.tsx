"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { HeroBreakpoint, HeroSettings, HeroTheme } from "@/types/homepage";
import { HeroRenderer } from "@/components/homepage-sections/hero/hero-renderer";
import { useCatalog } from "@/components/shared/catalog-context";
import { cn } from "@/lib/utils";

const DEVICES: { id: HeroBreakpoint; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

export function HeroLivePreview({
  settings,
  breakpoint,
  onBreakpointChange,
  activeSlideId,
  forceTheme,
}: {
  settings: HeroSettings;
  breakpoint: HeroBreakpoint;
  onBreakpointChange: (bp: HeroBreakpoint) => void;
  activeSlideId?: string | null;
  forceTheme?: HeroTheme;
}) {
  const isMobile = breakpoint === "mobile";
  const slides = settings.slides.filter((s) => s.enabled);
  const controlledIndex = activeSlideId ? Math.max(0, slides.findIndex((s) => s.id === activeSlideId)) : undefined;
  const { products } = useCatalog();
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Live Preview</p>
        <div className="flex gap-1">
          {DEVICES.map((device) => (
            <button
              key={device.id}
              type="button"
              onClick={() => onBreakpointChange(device.id)}
              aria-label={`Preview ${device.label}`}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                breakpoint === device.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground-muted hover:bg-muted/70"
              )}
            >
              <device.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{device.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-muted/40 shadow-inner">
        <div
          className={cn(
            "mx-auto min-h-[380px] w-full overflow-hidden bg-[var(--background)]",
            isMobile && "max-w-[375px]"
          )}
        >
          <HeroRenderer
            slides={slides}
            settings={{ ...settings.slider, autoplay: false }}
            breakpoint={breakpoint}
            preview
            forceTheme={forceTheme}
            controlledIndex={controlledIndex}
            products={productsById}
          />
        </div>
      </div>
    </div>
  );
}
