"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { HeroBreakpoint, HeroResponsive, HeroResponsiveSettings } from "@/types/homepage";
import { Field, FieldGrid, Select, Toggle, TextInput } from "@/components/homepage-builder/fields";
import { cn } from "@/lib/utils";

const BREAKPOINTS: { id: HeroBreakpoint; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

const HEIGHT_MODES = [
  { label: "Auto (fit content)", value: "auto" },
  { label: "Full screen", value: "full-screen" },
  { label: "Custom", value: "custom" },
];

const ALIGN_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const CONTENT_ORDER_OPTIONS = [
  { label: "Text First", value: "content-first" },
  { label: "Media First", value: "media-first" },
];

export function HeroResponsiveEditor({
  responsive,
  onChange,
}: {
  responsive: HeroResponsive;
  onChange: (next: HeroResponsive) => void;
}) {
  const set = <K extends keyof HeroResponsiveSettings>(breakpoint: HeroBreakpoint, key: K, value: HeroResponsiveSettings[K]) =>
    onChange({ ...responsive, [breakpoint]: { ...responsive[breakpoint], [key]: value } });

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-foreground-muted/70">
        Per-device controls for section height, text alignment, and what shows on mobile.
      </p>

      {BREAKPOINTS.map((bp) => {
        const s = responsive[bp.id];
        return (
          <div key={bp.id} className="space-y-3 rounded-[var(--radius-sm)] border border-border bg-background p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
              <bp.icon className="h-3.5 w-3.5" /> {bp.label}
            </p>

            <FieldGrid>
              <Field label="Heading size (px)">
                <TextInput
                  type="number"
                  min={16}
                  max={120}
                  step={1}
                  value={s.headingSize}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) set(bp.id, "headingSize", n);
                  }}
                />
              </Field>
              <Field label="Description size (px)">
                <TextInput
                  type="number"
                  min={11}
                  max={40}
                  step={1}
                  value={s.descriptionSize}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) set(bp.id, "descriptionSize", n);
                  }}
                />
              </Field>
              <Field label="Eyebrow size (px)">
                <TextInput
                  type="number"
                  min={9}
                  max={24}
                  step={0.5}
                  value={s.eyebrowSize}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) set(bp.id, "eyebrowSize", n);
                  }}
                />
              </Field>
              <Field label="Text alignment">
                <div className="flex gap-1">
                  {ALIGN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set(bp.id, "textAlign", opt.value as HeroResponsiveSettings["textAlign"])}
                      className={cn(
                        "flex-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-[12px] font-semibold transition-colors",
                        s.textAlign === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground-muted hover:bg-muted/70"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
            </FieldGrid>

            <Field label="Section height">
              <div className="space-y-2">
                <Select
                  value={s.heightMode}
                  onChange={(v) => set(bp.id, "heightMode", v as HeroResponsiveSettings["heightMode"])}
                  options={HEIGHT_MODES}
                />
                {s.heightMode === "custom" && (
                  <TextInput
                    type="number"
                    min={200}
                    max={2000}
                    step={10}
                    value={s.customHeight}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n)) set(bp.id, "customHeight", n);
                    }}
                  />
                )}
              </div>
            </Field>

            <FieldGrid>
              <Field label="Content order">
                <Select
                  value={s.contentOrder}
                  onChange={(v) => set(bp.id, "contentOrder", v as HeroResponsiveSettings["contentOrder"])}
                  options={CONTENT_ORDER_OPTIONS}
                />
              </Field>
              <Field label="Text / media gap (px)">
                <TextInput
                  type="number"
                  min={0}
                  max={160}
                  step={4}
                  value={s.contentGap}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) set(bp.id, "contentGap", n);
                  }}
                />
              </Field>
            </FieldGrid>

            {bp.id === "mobile" && (
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                  <Toggle checked={s.showSecondaryCta} onChange={(v) => set(bp.id, "showSecondaryCta", v)} label="Show secondary CTA" />
                  Secondary CTA
                </label>
                <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                  <Toggle checked={s.showBadges} onChange={(v) => set(bp.id, "showBadges", v)} label="Show badges" />
                  Trust badges
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
