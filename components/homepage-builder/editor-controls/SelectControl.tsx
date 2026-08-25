"use client";
import { cn } from "@/lib/utils";

export function SelectControl({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>{label}</span>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full appearance-none rounded border px-2 py-1.5 text-[12px]"
        style={{ 
          borderColor: "var(--editor-input-border)", 
          background: "var(--editor-input-bg)", 
          color: "var(--editor-text)" 
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
