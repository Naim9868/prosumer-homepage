"use client";

import type { HeroImagePosition } from "@/types/homepage";
import { Field, Select } from "@/components/homepage-builder/fields";

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-foreground-muted">{label}</span>
        <span className="text-[11.5px] font-semibold text-foreground">{value}</span>
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

export function ImagePositionControls({
  position,
  onChange,
}: {
  position: HeroImagePosition;
  onChange: (next: HeroImagePosition) => void;
}) {
  const set = <K extends keyof HeroImagePosition>(key: K, value: HeroImagePosition[K]) => onChange({ ...position, [key]: value });

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-border p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Image Position</p>
      <Slider label="X offset (%)" value={position.x} min={-100} max={100} step={1} onChange={(v) => set("x", v)} />
      <Slider label="Y offset (%)" value={position.y} min={-100} max={100} step={1} onChange={(v) => set("y", v)} />
      <Slider label="Scale" value={position.scale} min={0.5} max={2} step={0.05} onChange={(v) => set("scale", v)} />
      <Field label="Object Position">
        <Select
          value={position.objectPosition}
          onChange={(v) => set("objectPosition", v)}
          options={[
            { label: "Center", value: "center" },
            { label: "Top", value: "top" },
            { label: "Bottom", value: "bottom" },
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ]}
        />
      </Field>
    </div>
  );
}
