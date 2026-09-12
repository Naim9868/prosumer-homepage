"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { HeroBackgroundConfig, HeroImageFitMode, HeroOverlayConfig, HeroOverlayDirection, HeroOverlayType } from "@/types/homepage";
import { DEFAULT_HERO_BACKGROUND_CONFIG, HERO_IMAGE_FIT_OPTIONS, HERO_POSITION_PRESETS, HERO_BG_PRESETS } from "@/types/homepage";
import { Field, FieldGrid, TextInput, Select, Toggle } from "@/components/homepage-builder/fields";
import { ImageUploader } from "@/components/homepage-builder/image-uploader";
import { FocalPointPicker } from "@/components/homepage-builder/hero/focal-point-picker";
import { cn } from "@/lib/utils";

function Slider({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-foreground-muted">{label}</span>
        <span className="text-[11.5px] font-semibold text-foreground">{value}{suffix}</span>
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

function CollapsibleSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[var(--radius-md)] border border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">{title}</span>
        <span className="text-[10px] text-foreground-muted">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="border-t border-border px-3 py-3 space-y-3">{children}</div>}
    </div>
  );
}

function FitHint({ fit }: { fit: HeroImageFitMode }) {
  if (fit === "cover") return <p className="text-[11px] text-foreground-muted">✓ Hero fully covered · ⚠ Image may crop edges. Use Focal Point to keep subjects visible.</p>;
  if (fit === "contain") return <p className="text-[11px] text-foreground-muted">✓ Entire image visible · ⚠ Empty space may appear. Background color fills remaining area.</p>;
  if (fit === "width") return <p className="text-[11px] text-foreground-muted">Image width matches hero width. Height scales proportionally.</p>;
  if (fit === "height") return <p className="text-[11px] text-foreground-muted">Image height matches hero height. Width scales proportionally.</p>;
  if (fit === "original") return <p className="text-[11px] text-foreground-muted">Natural image dimensions. Use position to place within hero.</p>;
  if (fit === "custom") return <p className="text-[11px] text-foreground-muted">Set exact width and height. Use with caution — may distort if ratio differs.</p>;
  return null;
}

function OverlayControls({ overlay, onChange }: { overlay: HeroOverlayConfig; onChange: (next: HeroOverlayConfig) => void }) {
  const set = <K extends keyof HeroOverlayConfig>(key: K, val: HeroOverlayConfig[K]) => onChange({ ...overlay, [key]: val });

  return (
    <div className="space-y-3">
      <Field label="Type">
        <Select
          value={overlay.type}
          onChange={(v) => set("type", v as HeroOverlayType)}
          options={[
            { label: "Solid", value: "solid" },
            { label: "Linear Gradient", value: "linear" },
            { label: "Radial Gradient", value: "radial" },
          ]}
        />
      </Field>

      <Field label="Color">
        <input
          type="color"
          value={overlay.color}
          onChange={(e) => set("color", e.target.value)}
          className="h-8 w-full cursor-pointer rounded border border-border"
        />
      </Field>

      {(overlay.type === "linear" || overlay.type === "radial") && (
        <Field label="End Color">
          <input
            type="color"
            value={overlay.colorEnd}
            onChange={(e) => set("colorEnd", e.target.value)}
            className="h-8 w-full cursor-pointer rounded border border-border"
          />
        </Field>
      )}

      {overlay.type === "linear" && (
        <Field label="Direction">
          <Select
            value={overlay.direction}
            onChange={(v) => set("direction", v as HeroOverlayDirection)}
            options={[
              { label: "Left → Right", value: "to-right" },
              { label: "Right → Left", value: "to-left" },
              { label: "Top → Bottom", value: "to-bottom" },
              { label: "Bottom → Top", value: "to-top" },
            ]}
          />
        </Field>
      )}

      <Slider
        label="Opacity"
        value={overlay.opacity}
        min={0}
        max={100}
        step={1}
        suffix="%"
        onChange={(v) => set("opacity", v)}
      />
    </div>
  );
}

export function BackgroundImageEditor({
  config,
  onChange,
  deviceImage,
  onDeviceImageChange,
  deviceLabel,
}: {
  config: HeroBackgroundConfig;
  onChange: (next: HeroBackgroundConfig) => void;
  deviceImage?: string;
  onDeviceImageChange?: (url: string) => void;
  deviceLabel?: string;
}) {
  const set = <K extends keyof HeroBackgroundConfig>(key: K, val: HeroBackgroundConfig[K]) => onChange({ ...config, [key]: val });

  return (
    <div className="space-y-3">
      {/* Image Source */}
      <CollapsibleSection title="Image Source" defaultOpen>
        <ImageUploader
          label={deviceLabel ? `${deviceLabel} Image` : "Image"}
          value={deviceImage ?? config.image}
          onChange={(url) => {
            if (onDeviceImageChange) {
              onDeviceImageChange(url);
            } else {
              set("image", url);
            }
          }}
        />
        <FieldGrid>
          <Toggle
            checked={config.useMobileImage}
            onChange={(v) => set("useMobileImage", v)}
            label="Use separate mobile image"
          />
        </FieldGrid>
        {config.useMobileImage && (
          <ImageUploader
            label="Mobile Image"
            value={config.mobileImage}
            onChange={(v) => set("mobileImage", v)}
          />
        )}
      </CollapsibleSection>

      {/* Fit Mode */}
      <CollapsibleSection title="Fit" defaultOpen>
        <Field label="Fit Mode">
          <Select
            value={config.fit}
            onChange={(v) => set("fit", v as HeroImageFitMode)}
            options={HERO_IMAGE_FIT_OPTIONS}
          />
        </Field>
        <FitHint fit={config.fit} />
        {config.fit === "custom" && (
          <div className="space-y-2 rounded-[var(--radius-sm)] border border-border p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Custom Size</p>
            <FieldGrid>
              <Field label="Width">
                <div className="flex gap-1">
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={config.customWidth}
                    onChange={(e) => set("customWidth", Number(e.target.value))}
                    className="h-8 w-full rounded border border-border bg-background px-2 text-[12px]"
                  />
                  <Select
                    value={config.customWidthUnit}
                    onChange={(v) => set("customWidthUnit", v as "%" | "px")}
                    options={[{ label: "%", value: "%" }, { label: "px", value: "px" }]}
                  />
                </div>
              </Field>
              <Field label="Height">
                <div className="flex gap-1">
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={config.customHeight}
                    onChange={(e) => set("customHeight", Number(e.target.value))}
                    className="h-8 w-full rounded border border-border bg-background px-2 text-[12px]"
                  />
                  <Select
                    value={config.customHeightUnit}
                    onChange={(v) => set("customHeightUnit", v as "%" | "px")}
                    options={[{ label: "%", value: "%" }, { label: "px", value: "px" }]}
                  />
                </div>
              </Field>
            </FieldGrid>
          </div>
        )}
      </CollapsibleSection>

      {/* Focal Point */}
      <CollapsibleSection title="Focal Point">
        <FocalPointPicker
          imageSrc={deviceImage ?? config.image}
          x={config.position.x}
          y={config.position.y}
          onChange={(x, y) => set("position", { ...config.position, x, y })}
        />
        <FieldGrid>
          <Field label="X%">
            <TextInput
              type="number"
              min={0}
              max={100}
              value={config.position.x}
              onChange={(e) => set("position", { ...config.position, x: Number(e.target.value) })}
            />
          </Field>
          <Field label="Y%">
            <TextInput
              type="number"
              min={0}
              max={100}
              value={config.position.y}
              onChange={(e) => set("position", { ...config.position, y: Number(e.target.value) })}
            />
          </Field>
        </FieldGrid>
        <div className="grid grid-cols-3 gap-1">
          {HERO_POSITION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => set("position", { x: preset.x, y: preset.y })}
              className={cn(
                "rounded border px-1.5 py-1 text-[10px] font-medium transition-colors",
                config.position.x === preset.x && config.position.y === preset.y
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:bg-muted"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Zoom */}
      <CollapsibleSection title="Zoom">
        <Slider
          label="Zoom"
          value={config.zoom}
          min={50}
          max={200}
          step={5}
          suffix="%"
          onChange={(v) => set("zoom", v)}
        />
      </CollapsibleSection>

      {/* Overlay */}
      <CollapsibleSection title="Overlay">
        <OverlayControls
          overlay={config.overlay}
          onChange={(overlay) => set("overlay", overlay)}
        />
      </CollapsibleSection>

      {/* Presets */}
      <CollapsibleSection title="Presets">
        <div className="grid grid-cols-2 gap-1.5">
          {HERO_BG_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                onChange({
                  ...config,
                  fit: preset.fit,
                  position: { x: preset.x, y: preset.y },
                  zoom: preset.zoom,
                  overlay: {
                    ...config.overlay,
                    type: preset.overlayType ?? config.overlay.type,
                    opacity: preset.overlayOpacity ?? config.overlay.opacity,
                  },
                })
              }
              className="rounded border border-border px-2 py-1.5 text-[11px] font-medium text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Reset */}
      <button
        type="button"
        onClick={() => onChange(DEFAULT_HERO_BACKGROUND_CONFIG)}
        className="flex w-full items-center justify-center gap-1.5 rounded border border-border py-2 text-[11px] font-semibold text-foreground-muted transition-colors hover:bg-muted"
      >
        <RotateCcw className="h-3 w-3" /> Reset All Image Settings
      </button>
    </div>
  );
}
