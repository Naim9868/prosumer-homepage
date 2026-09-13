"use client";

import type { HeroBreakpointStyling } from "@/types/homepage";
import { Field, FieldGrid, Select, Toggle, TextInput } from "@/components/homepage-builder/fields";
import { cn } from "@/lib/utils";

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

/**
 * Per-device layout controls. The active breakpoint is chosen by the device
 * tabs in the slide editor, so this editor only ever edits one device's
 * independent setup.
 */
export function HeroResponsiveEditor({
  styling,
  onChange,
}: {
  styling: HeroBreakpointStyling;
  onChange: (next: HeroBreakpointStyling) => void;
}) {
  const set = <K extends keyof HeroBreakpointStyling>(key: K, value: HeroBreakpointStyling[K]) =>
    onChange({ ...styling, [key]: value });

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-foreground-muted/70">
        These controls apply only to the device you&apos;re currently editing — every other device keeps its own
        independent setup.
      </p>

      <Field label="Section height">
        <div className="space-y-2">
          <Select
            value={styling.heightMode}
            onChange={(v) => set("heightMode", v as HeroBreakpointStyling["heightMode"])}
            options={HEIGHT_MODES}
          />
          {styling.heightMode === "custom" && (
            <TextInput
              type="number"
              min={200}
              max={2000}
              step={10}
              value={styling.customHeight}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) set("customHeight", n);
              }}
            />
          )}
        </div>
      </Field>

      <Field label="Text alignment">
        <div className="flex gap-1">
          {ALIGN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("textAlign", opt.value as HeroBreakpointStyling["textAlign"])}
              className={cn(
                "flex-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-[12px] font-semibold transition-colors",
                styling.textAlign === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground-muted hover:bg-muted/70"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      <FieldGrid>
        <Field label="Content order">
          <Select
            value={styling.contentOrder}
            onChange={(v) => set("contentOrder", v as HeroBreakpointStyling["contentOrder"])}
            options={CONTENT_ORDER_OPTIONS}
          />
        </Field>
        <Field label="Text / media gap (px)">
          <TextInput
            type="number"
            min={0}
            max={160}
            step={4}
            value={styling.contentGap}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) set("contentGap", n);
            }}
          />
        </Field>
      </FieldGrid>

      <FieldGrid>
        <Field label="Heading size (px)">
          <TextInput
            type="number"
            min={20}
            max={140}
            step={1}
            value={styling.typography.headingSize}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) set("typography", { ...styling.typography, headingSize: n });
            }}
          />
        </Field>
        <Field label="Description size (px)">
          <TextInput
            type="number"
            min={12}
            max={36}
            step={1}
            value={styling.typography.descriptionSize}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) set("typography", { ...styling.typography, descriptionSize: n });
            }}
          />
        </Field>
        <Field label="Eyebrow size (px)">
          <TextInput
            type="number"
            min={9}
            max={28}
            step={0.5}
            value={styling.typography.eyebrowSize}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) set("typography", { ...styling.typography, eyebrowSize: n });
            }}
          />
        </Field>
      </FieldGrid>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={styling.showSecondaryCta} onChange={(v) => set("showSecondaryCta", v)} label="Show secondary CTA" />
          Secondary CTA
        </label>
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={styling.showBadges} onChange={(v) => set("showBadges", v)} label="Show badges" />
          Trust badges
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Section Border Radius (px)</p>
        <FieldGrid>
          <Field label="Top Left">
            <TextInput
              type="number"
              min={0}
              max={200}
              value={styling.borderRadius?.topLeft ?? 0}
              onChange={(e) => set("borderRadius", {
                ...(styling.borderRadius ?? { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
                topLeft: Math.max(0, Math.min(200, Number(e.target.value))),
              })}
            />
          </Field>
          <Field label="Top Right">
            <TextInput
              type="number"
              min={0}
              max={200}
              value={styling.borderRadius?.topRight ?? 0}
              onChange={(e) => set("borderRadius", {
                ...(styling.borderRadius ?? { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
                topRight: Math.max(0, Math.min(200, Number(e.target.value))),
              })}
            />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Bottom Left">
            <TextInput
              type="number"
              min={0}
              max={200}
              value={styling.borderRadius?.bottomLeft ?? 0}
              onChange={(e) => set("borderRadius", {
                ...(styling.borderRadius ?? { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
                bottomLeft: Math.max(0, Math.min(200, Number(e.target.value))),
              })}
            />
          </Field>
          <Field label="Bottom Right">
            <TextInput
              type="number"
              min={0}
              max={200}
              value={styling.borderRadius?.bottomRight ?? 0}
              onChange={(e) => set("borderRadius", {
                ...(styling.borderRadius ?? { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
                bottomRight: Math.max(0, Math.min(200, Number(e.target.value))),
              })}
            />
          </Field>
        </FieldGrid>
      </div>
    </div>
  );
}