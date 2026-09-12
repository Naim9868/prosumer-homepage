"use client";

import { useCallback, useState } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { HeroBreakpoint, HeroSettings, HeroTheme } from "@/types/homepage";
import { HeroRenderer } from "@/components/homepage-sections/hero/hero-renderer";
import { useCatalog } from "@/components/shared/catalog-context";
import { cn } from "@/lib/utils";

const DEVICES: { id: HeroBreakpoint; label: string; icon: typeof Monitor; width: number }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1280 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
];

function useElementSize<T extends HTMLElement>() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const ref = useCallback((node: T | null) => {
    if (!node) return;
    let raf = 0;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      );
    });
    ro.observe(node);
  }, []);

  return [ref, size] as const;
}

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
  const slides = settings.slides.filter((s) => s.enabled);
  const controlledIndex = activeSlideId ? Math.max(0, slides.findIndex((s) => s.id === activeSlideId)) : undefined;
  const { products } = useCatalog();
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));

  const device = DEVICES.find((d) => d.id === breakpoint) ?? DEVICES[0];
  const [boxRef, box] = useElementSize<HTMLDivElement>();
  const [contentRef, content] = useElementSize<HTMLDivElement>();
  const scale = box.width > 0 ? Math.min(1, box.width / device.width) : 1;
  const rendered = box.width > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Live Preview</p>
        <div className="flex gap-1">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onBreakpointChange(d.id)}
              aria-label={`Preview ${d.label}`}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                breakpoint === d.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground-muted hover:bg-muted/70"
              )}
            >
              <d.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={boxRef} className="overflow-hidden rounded-[var(--radius-lg)] border border-dashed border-primary/40 bg-[var(--background)] shadow-inner">
        {rendered && (
          <>
            <div className="flex items-center justify-between border-b border-dashed border-primary/20 px-3 py-1.5">
              <span className="rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {device.label}
              </span>
              <span className="text-[10px] font-mono text-foreground-muted">
                {device.width}px wide
              </span>
            </div>
            <div
              className="relative mx-auto"
              style={{
                width: device.width * scale,
                height: content.height > 0 ? content.height * scale : undefined,
              }}
            >
              <div
                ref={contentRef}
                className="overflow-hidden"
                style={{ width: device.width, transform: `scale(${scale})`, transformOrigin: "top left" }}
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
          </>
        )}
      </div>
    </div>
  );
}