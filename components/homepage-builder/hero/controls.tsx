"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Field, TextInput } from "@/components/homepage-builder/fields";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[var(--radius-md)] border border-border bg-muted/40 p-4"
    >
      <summary className="flex cursor-pointer select-none list-none items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
        {title}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  );
}

export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
            active === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground-muted hover:bg-muted/70"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-border bg-background p-1"
        />
        <TextInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
      </div>
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <TextInput
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
      />
    </Field>
  );
}

export function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
        {label}
        <span className="font-mono text-[11.5px] normal-case tracking-normal">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--primary)]"
      />
    </label>
  );
}
