"use client";

import { RotateCcw } from "lucide-react";
import type { HeroPreset } from "@/types/homepage";
import { HERO_PRESETS } from "@/lib/hero";
import { cn } from "@/lib/utils";

export function PresetPicker({
  current,
  onApply,
  onReset,
}: {
  current: HeroPreset | null;
  onApply: (preset: HeroPreset) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {HERO_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onApply(preset.value)}
            title={preset.description}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              current === preset.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:bg-muted"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground-muted hover:text-foreground">
        <RotateCcw className="h-3.5 w-3.5" /> Reset slide to default
      </button>
    </div>
  );
}
