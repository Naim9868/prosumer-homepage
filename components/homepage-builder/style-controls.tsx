"use client";

import type { SectionStyle } from "@/types/homepage";
import { Field, FieldGrid, TextInput, Select, Toggle } from "@/components/homepage-builder/fields";
import { ImageUploader } from "@/components/homepage-builder/image-uploader";

export function StyleControls({
  style,
  onChange,
}: {
  style: SectionStyle;
  onChange: (next: SectionStyle) => void;
}) {
  const set = <K extends keyof SectionStyle>(key: K, value: SectionStyle[K]) => onChange({ ...style, [key]: value });

  return (
    <div className="space-y-4 rounded-[var(--radius-md)] border border-border bg-muted/40 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Styling</p>

      <FieldGrid>
        <Field label="Background Color">
          <TextInput
            type="text"
            placeholder="transparent, #ffffff, var(--muted)…"
            value={style.backgroundColor ?? ""}
            onChange={(e) => set("backgroundColor", e.target.value)}
          />
        </Field>
      </FieldGrid>
      <ImageUploader label="Background Image" value={style.backgroundImage ?? ""} onChange={(url) => set("backgroundImage", url)} folder="prosumer-lens/sections" hint="Optional — overlays the background color." />
      <FieldGrid>
        <Field label="Container Width">
          <Select
            value={style.containerWidth ?? "7xl"}
            onChange={(v) => set("containerWidth", v as SectionStyle["containerWidth"])}
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "X-Large", value: "xl" },
              { label: "Full-width content (7xl)", value: "7xl" },
              { label: "Edge to edge", value: "full" },
            ]}
          />
        </Field>
        <Field label="Text Alignment">
          <Select
            value={style.textAlign ?? "left"}
            onChange={(v) => set("textAlign", v as SectionStyle["textAlign"])}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
          />
        </Field>

        <Field label="Padding Top (px)">
          <TextInput type="number" min={0} max={400} value={style.paddingTop ?? 80} onChange={(e) => set("paddingTop", Number(e.target.value))} />
        </Field>
        <Field label="Padding Bottom (px)">
          <TextInput type="number" min={0} max={400} value={style.paddingBottom ?? 80} onChange={(e) => set("paddingBottom", Number(e.target.value))} />
        </Field>

        <Field label="Border Radius (px)">
          <TextInput type="number" min={0} max={64} value={style.borderRadius ?? 0} onChange={(e) => set("borderRadius", Number(e.target.value))} />
        </Field>
      </FieldGrid>

      <div className="flex flex-wrap gap-6 pt-1">
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={!style.hideOnDesktop} onChange={(v) => set("hideOnDesktop", !v)} label="Visible on desktop" />
          Visible on desktop
        </label>
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={!style.hideOnMobile} onChange={(v) => set("hideOnMobile", !v)} label="Visible on mobile" />
          Visible on mobile
        </label>
      </div>
    </div>
  );
}
