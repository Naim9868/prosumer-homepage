"use client";

import { useState } from "react";
import type { SectionStyle, ResponsiveSectionStyles, SectionDevice, SectionTheme } from "@/types/homepage";
import { Field, FieldGrid, TextInput, Select, Toggle } from "@/components/homepage-builder/fields";
import { ImageUploader } from "@/components/homepage-builder/image-uploader";
import { cn } from "@/lib/utils";

const DEVICE_TABS: { label: string; value: SectionDevice }[] = [
  { label: "Desktop", value: "desktop" },
  { label: "Tablet", value: "tablet" },
  { label: "Mobile", value: "mobile" },
];

/** Merge a device delta into the base style to produce the effective style for that device. */
function resolveForDevice(base: SectionStyle, delta?: Partial<SectionStyle>): SectionStyle {
  return { ...base, ...delta };
}

export function StyleControls({
  style,
  responsiveStyles,
  onChange,
  onResponsiveStylesChange,
}: {
  style: SectionStyle;
  responsiveStyles?: ResponsiveSectionStyles;
  onChange: (next: SectionStyle) => void;
  onResponsiveStylesChange?: (next: ResponsiveSectionStyles) => void;
}) {
  const [activeDevice, setActiveDevice] = useState<SectionDevice>("desktop");
  const [activeTheme] = useState<SectionTheme>("light");

  // Device-specific delta (what's stored for this device/theme)
  const deviceDelta = responsiveStyles?.[activeTheme]?.[activeDevice] ?? {};
  const effectiveStyle = resolveForDevice(style, deviceDelta);

  /** Update the base (default) style — shared fallback for all devices. */
  const setBase = <K extends keyof SectionStyle>(key: K, value: SectionStyle[K]) =>
    onChange({ ...style, [key]: value });

  /** Update a device-specific override. Only stores fields that differ from base. */
  const setDevice = <K extends keyof SectionStyle>(key: K, value: SectionStyle[K]) => {
    if (!onResponsiveStylesChange) return;
    const nextDelta = { ...deviceDelta, [key]: value };
    onResponsiveStylesChange({
      ...responsiveStyles,
      [activeTheme]: {
        ...responsiveStyles?.[activeTheme],
        [activeDevice]: nextDelta,
      },
    });
  };

  const isDefault = activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop;

  return (
    <div className="space-y-4 rounded-[var(--radius-md)] border border-border bg-muted/40 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Styling</p>

      {/* Device tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
        {DEVICE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveDevice(tab.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
              activeDevice === tab.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground-muted hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {isDefault && (
        <p className="text-[11px] text-foreground-muted/70">
          Editing the base (default) style. Use tabs to set per-device overrides.
        </p>
      )}

      {/* Fields — show effective value (base + device override) */}
      <FieldGrid>
        <Field label="Background Color">
          <TextInput
            type="text"
            placeholder="transparent, #ffffff, var(--muted)…"
            value={effectiveStyle.backgroundColor ?? ""}
            onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
              ? setBase("backgroundColor", e.target.value)
              : setDevice("backgroundColor", e.target.value)
            )}
          />
        </Field>
      </FieldGrid>
      <ImageUploader
        label="Background Image"
        value={effectiveStyle.backgroundImage ?? ""}
        onChange={(url) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
          ? setBase("backgroundImage", url)
          : setDevice("backgroundImage", url)
        )}
        folder="prosumer-lens/sections"
        hint="Optional — overlays the background color."
      />
      <FieldGrid>
        <Field label="Container Width">
          <Select
            value={effectiveStyle.containerWidth ?? "7xl"}
            onChange={(v) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
              ? setBase("containerWidth", v as SectionStyle["containerWidth"])
              : setDevice("containerWidth", v as SectionStyle["containerWidth"])
            )}
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
            value={effectiveStyle.textAlign ?? "left"}
            onChange={(v) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
              ? setBase("textAlign", v as SectionStyle["textAlign"])
              : setDevice("textAlign", v as SectionStyle["textAlign"])
            )}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
          />
        </Field>

        <Field label="Padding Top (px)">
          <TextInput type="number" min={0} max={400} step={1} value={effectiveStyle.paddingTop ?? 80} onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("paddingTop", e.target.value === "" ? 0 : Number(e.target.value))
            : setDevice("paddingTop", e.target.value === "" ? 0 : Number(e.target.value))
          )} />
        </Field>
        <Field label="Padding Bottom (px)">
          <TextInput type="number" min={0} max={400} step={1} value={effectiveStyle.paddingBottom ?? 80} onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("paddingBottom", e.target.value === "" ? 0 : Number(e.target.value))
            : setDevice("paddingBottom", e.target.value === "" ? 0 : Number(e.target.value))
          )} />
        </Field>

        <Field label="Border Radius (px)">
          <TextInput type="number" min={0} max={64} step={1} value={effectiveStyle.borderRadius ?? 0} onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("borderRadius", e.target.value === "" ? 0 : Number(e.target.value))
            : setDevice("borderRadius", e.target.value === "" ? 0 : Number(e.target.value))
          )} />
        </Field>
      </FieldGrid>

      <FieldGrid>
        <Field label="Padding Left (px)">
          <TextInput type="number" min={0} max={400} value={effectiveStyle.paddingLeft ?? ""} onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("paddingLeft", e.target.value ? Number(e.target.value) : undefined)
            : setDevice("paddingLeft", e.target.value ? Number(e.target.value) : undefined)
          )} placeholder="Default" />
        </Field>
        <Field label="Padding Right (px)">
          <TextInput type="number" min={0} max={400} value={effectiveStyle.paddingRight ?? ""} onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("paddingRight", e.target.value ? Number(e.target.value) : undefined)
            : setDevice("paddingRight", e.target.value ? Number(e.target.value) : undefined)
          )} placeholder="Default" />
        </Field>
        <Field label="Minimum Height (px)">
          <TextInput type="number" min={0} max={3000} value={effectiveStyle.minHeight ?? ""} onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("minHeight", e.target.value ? Number(e.target.value) : undefined)
            : setDevice("minHeight", e.target.value ? Number(e.target.value) : undefined)
          )} placeholder="Auto" />
        </Field>
        <Field label="Overflow">
          <Select
            value={effectiveStyle.overflow ?? "visible"}
            onChange={(v) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
              ? setBase("overflow", v as SectionStyle["overflow"])
              : setDevice("overflow", v as SectionStyle["overflow"])
            )}
            options={[{ label: "Visible", value: "visible" }, { label: "Hidden", value: "hidden" }, { label: "Auto", value: "auto" }]}
          />
        </Field>
        <Field label="Section Position">
          <Select
            value={effectiveStyle.position ?? "relative"}
            onChange={(v) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
              ? setBase("position", v as SectionStyle["position"])
              : setDevice("position", v as SectionStyle["position"])
            )}
            options={[{ label: "Relative", value: "relative" }, { label: "Static", value: "static" }, { label: "Sticky", value: "sticky" }, { label: "Absolute", value: "absolute" }]}
          />
        </Field>
        <Field label="Z-Index">
          <TextInput type="number" min={-100} max={1000} value={effectiveStyle.zIndex ?? ""} onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("zIndex", e.target.value ? Number(e.target.value) : undefined)
            : setDevice("zIndex", e.target.value ? Number(e.target.value) : undefined)
          )} placeholder="Auto" />
        </Field>
        <Field label="Margin Top (px)">
          <TextInput type="number" min={-400} max={400} value={effectiveStyle.marginTop ?? ""} onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("marginTop", e.target.value ? Number(e.target.value) : undefined)
            : setDevice("marginTop", e.target.value ? Number(e.target.value) : undefined)
          )} placeholder="0" />
        </Field>
        <Field label="Margin Bottom (px)">
          <TextInput type="number" min={-400} max={400} value={effectiveStyle.marginBottom ?? ""} onChange={(e) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("marginBottom", e.target.value ? Number(e.target.value) : undefined)
            : setDevice("marginBottom", e.target.value ? Number(e.target.value) : undefined)
          )} placeholder="0" />
        </Field>
      </FieldGrid>

      <div className="flex flex-wrap gap-6 pt-1">
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={!effectiveStyle.hideOnDesktop} onChange={(v) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("hideOnDesktop", !v)
            : setDevice("hideOnDesktop", !v)
          )} label="Visible on desktop" />
          Visible on desktop
        </label>
        <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Toggle checked={!effectiveStyle.hideOnMobile} onChange={(v) => (activeDevice === "desktop" && !responsiveStyles?.[activeTheme]?.desktop
            ? setBase("hideOnMobile", !v)
            : setDevice("hideOnMobile", !v)
          )} label="Visible on mobile" />
          Visible on mobile
        </label>
      </div>
    </div>
  );
}
