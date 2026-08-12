"use client";

import type { HeroBreakpoint } from "@/types/homepage";
import { Field } from "@/components/homepage-builder/fields";

export type ResponsiveNumberValue = Record<HeroBreakpoint, number>;

export function ResponsiveNumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 200,
  suffix = "px",
}: {
  label: string;
  value: ResponsiveNumberValue;
  onChange: (next: ResponsiveNumberValue) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const set = (key: HeroBreakpoint, v: number) => {
    const n = Number.isFinite(v) ? v : 0;
    const clamped = Math.max(min, Math.min(max, n));
    onChange({ ...value, [key]: clamped });
  };

  return (
    <Field label={label}>
      <div className="grid grid-cols-3 gap-2">
        {(["desktop", "tablet", "mobile"] as const).map((bp) => (
          <div key={bp} className="relative">
            <input
              type="number"
              min={min}
              max={max}
              value={value[bp]}
              onChange={(e) => set(bp, Number(e.target.value))}
              className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-2 py-2 pr-7 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-foreground-muted">{suffix}</span>
            <span className="mt-0.5 block text-center text-[9.5px] uppercase tracking-wide text-foreground-muted">
              {bp === "desktop" ? "D" : bp === "tablet" ? "T" : "M"}
            </span>
          </div>
        ))}
      </div>
    </Field>
  );
}
