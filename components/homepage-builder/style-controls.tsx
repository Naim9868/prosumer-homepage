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
          <TextInput type="number" min={0} max={400} step={1} value={style.paddingTop ?? 80} onChange={(e) => set("paddingTop", e.target.value === "" ? 0 : Number(e.target.value))} />
        </Field>
        <Field label="Padding Bottom (px)">
          <TextInput type="number" min={0} max={400} step={1} value={style.paddingBottom ?? 80} onChange={(e) => set("paddingBottom", e.target.value === "" ? 0 : Number(e.target.value))} />
        </Field>

        <Field label="Border Radius (px)">
          <TextInput type="number" min={0} max={64} step={1} value={style.borderRadius ?? 0} onChange={(e) => set("borderRadius", e.target.value === "" ? 0 : Number(e.target.value))} />
        </Field>
      </FieldGrid>

      <FieldGrid>
        <Field label="Padding Left (px)">
          <TextInput type="number" min={0} max={400} value={style.paddingLeft ?? ""} onChange={(e) => set("paddingLeft", e.target.value ? Number(e.target.value) : undefined)} placeholder="Default" />
        </Field>
        <Field label="Padding Right (px)">
          <TextInput type="number" min={0} max={400} value={style.paddingRight ?? ""} onChange={(e) => set("paddingRight", e.target.value ? Number(e.target.value) : undefined)} placeholder="Default" />
        </Field>
        <Field label="Minimum Height (px)">
          <TextInput type="number" min={0} max={3000} value={style.minHeight ?? ""} onChange={(e) => set("minHeight", e.target.value ? Number(e.target.value) : undefined)} placeholder="Auto" />
        </Field>
        <Field label="Overflow">
          <Select
            value={style.overflow ?? "visible"}
            onChange={(v) => set("overflow", v as SectionStyle["overflow"])}
            options={[{ label: "Visible", value: "visible" }, { label: "Hidden", value: "hidden" }, { label: "Auto", value: "auto" }]}
          />
        </Field>
        <Field label="Section Position">
          <Select
            value={style.position ?? "relative"}
            onChange={(v) => set("position", v as SectionStyle["position"])}
            options={[{ label: "Relative", value: "relative" }, { label: "Static", value: "static" }, { label: "Sticky", value: "sticky" }, { label: "Absolute", value: "absolute" }]}
          />
        </Field>
        <Field label="Z-Index">
          <TextInput type="number" min={-100} max={1000} value={style.zIndex ?? ""} onChange={(e) => set("zIndex", e.target.value ? Number(e.target.value) : undefined)} placeholder="Auto" />
        </Field>
        <Field label="Margin Top (px)">
          <TextInput type="number" min={-400} max={400} value={style.marginTop ?? ""} onChange={(e) => set("marginTop", e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
        </Field>
        <Field label="Margin Bottom (px)">
          <TextInput type="number" min={-400} max={400} value={style.marginBottom ?? ""} onChange={(e) => set("marginBottom", e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
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
