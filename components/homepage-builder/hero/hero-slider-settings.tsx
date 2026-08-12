"use client";

import type { HeroSliderSettings } from "@/types/homepage";
import { Field, FieldGrid, TextInput, Select, Toggle } from "@/components/homepage-builder/fields";

const TRANSITION_OPTIONS = [
  { label: "Fade", value: "fade" },
  { label: "Slide", value: "slide" },
  { label: "Crossfade", value: "crossfade" },
];

export function HeroSliderSettingsEditor({
  settings,
  onChange,
}: {
  settings: HeroSliderSettings;
  onChange: (next: HeroSliderSettings) => void;
}) {
  const set = <K extends keyof HeroSliderSettings>(key: K, value: HeroSliderSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={settings.autoplay} onChange={(v) => set("autoplay", v)} label="Autoplay" />
          Autoplay
        </label>
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={settings.pauseOnHover} onChange={(v) => set("pauseOnHover", v)} label="Pause on hover" />
          Pause on hover
        </label>
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={settings.loop} onChange={(v) => set("loop", v)} label="Loop" />
          Loop
        </label>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={settings.showArrows} onChange={(v) => set("showArrows", v)} label="Arrows" />
          Arrows
        </label>
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={settings.showDots} onChange={(v) => set("showDots", v)} label="Dots" />
          Dots
        </label>
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={settings.showProgress} onChange={(v) => set("showProgress", v)} label="Progress bar" />
          Progress bar
        </label>
      </div>

      <FieldGrid>
        <Field label="Transition">
          <Select
            value={settings.transition}
            onChange={(v) => set("transition", v as HeroSliderSettings["transition"])}
            options={TRANSITION_OPTIONS}
          />
        </Field>
        <Field label="Autoplay Interval (ms)">
          <TextInput
            type="number"
            min={1500}
            max={30000}
            step={500}
            value={settings.interval}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) set("interval", n);
            }}
          />
        </Field>
        <Field label="Transition Duration (ms)">
          <TextInput
            type="number"
            min={100}
            max={3000}
            step={100}
            value={settings.transitionDuration}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) set("transitionDuration", n);
            }}
          />
        </Field>
      </FieldGrid>
    </div>
  );
}
