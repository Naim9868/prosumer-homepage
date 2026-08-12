"use client";

import type { HeroBackgroundSize } from "@/types/homepage";

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-foreground-muted">{label}</span>
        <span className="text-[11.5px] font-semibold text-foreground">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--primary)]"
      />
    </div>
  );
}

export function BackgroundSizeControls({
  size,
  onChange,
}: {
  size: HeroBackgroundSize;
  onChange: (next: HeroBackgroundSize) => void;
}) {
  const set = <K extends keyof HeroBackgroundSize>(key: K, value: HeroBackgroundSize[K]) => onChange({ ...size, [key]: value });

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-border p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Background Image Size</p>
        <button
          type="button"
          onClick={() => onChange({ width: 100, height: 100 })}
          className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
        >
          Reset
        </button>
      </div>
      <Slider label="Width (%)" value={size.width} min={10} max={200} step={1} onChange={(v) => set("width", v)} />
      <Slider label="Height (%)" value={size.height} min={10} max={200} step={1} onChange={(v) => set("height", v)} />
      <p className="text-[11px] leading-relaxed text-foreground-muted">
        Sizes the background image relative to the section. 100% = full bleed; below 100% shrinks it toward the
        center, above 100% zooms in.
      </p>
    </div>
  );
}
