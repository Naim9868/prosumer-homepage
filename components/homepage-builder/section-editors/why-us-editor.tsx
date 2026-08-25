"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  Truck,
  Banknote,
  ShieldCheck,
  Headset,
  Gem,
  RotateCcw,
  Star,
  Sparkles,
  Zap,
  Heart,
  Camera,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { Section, WhyUsIcon, WhyUsItem, WhyUsSettings, WhyUsIconVariant, SectionStyle } from "@/types/homepage";
import { Field, FieldGrid, TextInput, TextArea, Select, Toggle } from "@/components/homepage-builder/fields";
import { WhyUsSection } from "@/components/homepage-sections/why-us-section";

const iconMap: Record<WhyUsIcon, LucideIcon> = {
  truck: Truck,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  headset: Headset,
  gem: Gem,
  "rotate-ccw": RotateCcw,
  star: Star,
  sparkles: Sparkles,
  zap: Zap,
  heart: Heart,
  camera: Camera,
  package: Package,
};

const iconOptions = (Object.keys(iconMap) as WhyUsIcon[]).map((key) => ({
  label: key
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" "),
  value: key,
}));

function IconSelect({ value, onChange }: { value: WhyUsIcon; onChange: (v: WhyUsIcon) => void }) {
  const Icon = iconMap[value] ?? Star;
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
      </span>
      <Select value={value} onChange={(v) => onChange(v as WhyUsIcon)} options={iconOptions} className="flex-1" />
    </div>
  );
}

function WhyUsPreview({ settings, style }: { settings: WhyUsSettings; style?: SectionStyle }) {
  const section = {
    id: "preview",
    type: "whyUs",
    enabled: true,
    order: 0,
    style: style ?? {},
    settings,
  } as Extract<Section, { type: "whyUs" }>;

  return (
    <div className="pointer-events-none select-none">
      <WhyUsSection section={section} />
    </div>
  );
}

export function WhyUsEditor({
  settings,
  onChange,
  style,
}: {
  settings: WhyUsSettings;
  onChange: (next: WhyUsSettings) => void;
  style?: SectionStyle;
}) {
  const set = <K extends keyof WhyUsSettings>(key: K, value: WhyUsSettings[K]) => onChange({ ...settings, [key]: value });

  const updateItem = (i: number, patch: Partial<WhyUsItem>) => {
    set("items", settings.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const addItem = () =>
    set("items", [
      ...settings.items,
      { id: `why_${Date.now()}`, icon: "star", title: "New feature", description: "Describe the benefit here." },
    ]);
  const removeItem = (i: number) => set("items", settings.items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      {/* Exact homepage preview */}
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Live Preview</p>
          <span className="text-[11px] text-foreground-muted">Renders exactly like the homepage</span>
        </div>
        <div className="max-h-[420px] overflow-hidden">
          <WhyUsPreview settings={settings} style={style} />
        </div>
      </div>

      <FieldGrid>
        <Field label="Eyebrow">
          <TextInput value={settings.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
        </Field>
        <Field label="Title">
          <TextInput value={settings.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Subtitle" hint="Optional — shown under the title.">
          <TextInput value={settings.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <Field label="Columns">
          <Select
            value={String(settings.columns)}
            onChange={(v) => set("columns", Number(v) as 2 | 3 | 4)}
            options={[
              { label: "2 per row", value: "2" },
              { label: "3 per row", value: "3" },
              { label: "4 per row", value: "4" },
            ]}
          />
        </Field>
      </FieldGrid>

      {/* Items */}
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
          Value Cards {settings.items.length === 0 && "(add at least one)"}
        </p>
        {settings.items.map((item, i) => (
          <div key={item.id} className="space-y-2 rounded-[var(--radius-sm)] border border-border p-3">
            <div className="flex items-center gap-2">
              <IconSelect value={item.icon} onChange={(icon) => updateItem(i, { icon })} />
              <TextInput
                value={item.title}
                onChange={(e) => updateItem(i, { title: e.target.value })}
                placeholder="Card title"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label="Remove card"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border text-destructive hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <TextArea
              value={item.description}
              onChange={(e) => updateItem(i, { description: e.target.value })}
              placeholder="Short benefit description"
              rows={2}
            />
          </div>
        ))}
        <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          <Plus className="h-4 w-4" /> Add Card
        </button>
      </div>

      <FieldGrid>
        <Field label="Icon Style">
          <Select
            value={settings.iconVariant}
            onChange={(v) => set("iconVariant", v as WhyUsIconVariant)}
            options={[
              { label: "Soft (homepage default)", value: "soft" },
              { label: "Filled", value: "filled" },
              { label: "Outline", value: "outline" },
            ]}
          />
        </Field>
        <Field label="Icon Size (px)">
          <TextInput type="number" min={12} max={40} value={settings.iconSize} onChange={(e) => set("iconSize", Number(e.target.value))} />
        </Field>
      </FieldGrid>

      <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
        <Toggle checked={settings.animated} onChange={(v) => set("animated", v)} label="Animate on scroll" />
        Animate on scroll
      </label>
    </div>
  );
}