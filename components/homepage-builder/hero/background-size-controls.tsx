"use client";

import type { HeroBackgroundPosition, HeroBackgroundSize } from "@/types/homepage";

const DEFAULT_SIZE: HeroBackgroundSize = { width: 1920, height: 1080 };
const DEFAULT_POSITION: HeroBackgroundPosition = { x: 0, y: 0 };

function Slider({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-foreground-muted">{label}</span>
        <span className="text-[11.5px] font-semibold text-foreground">
          {value}
          {suffix}
        </span>
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
  position,
  onSizeChange,
  onPositionChange,
}: {
  size: HeroBackgroundSize;
  position: HeroBackgroundPosition;
  onSizeChange: (next: HeroBackgroundSize) => void;
  onPositionChange: (next: HeroBackgroundPosition) => void;
}) {
  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-border p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Background Image Size</p>
        <button
          type="button"
          onClick={() => {
            onSizeChange(DEFAULT_SIZE);
            onPositionChange(DEFAULT_POSITION);
          }}
          className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
        >
          Reset
        </button>
      </div>
      <Slider label="Width (px)" value={size.width} min={320} max={3840} step={10} suffix="px" onChange={(v) => onSizeChange({ ...size, width: v })} />
      <Slider label="Height (px)" value={size.height} min={240} max={2160} step={10} suffix="px" onChange={(v) => onSizeChange({ ...size, height: v })} />
      <Slider label="X offset (px)" value={position.x} min={-1000} max={1000} step={10} suffix="px" onChange={(v) => onPositionChange({ ...position, x: v })} />
      <Slider label="Y offset (px)" value={position.y} min={-1000} max={1000} step={10} suffix="px" onChange={(v) => onPositionChange({ ...position, y: v })} />
      <p className="text-[11px] leading-relaxed text-foreground-muted">
        Size and position are absolute (px) and independent of the section&apos;s height and width — the image may overflow
        the section. The overflow is visible here in the editor; on the live site it is clipped to the section.
      </p>
    </div>
  );
}