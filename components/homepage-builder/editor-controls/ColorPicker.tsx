"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PRESETS = [
  "#000000", "#ffffff", "#14161a", "#565c64", "#8a6a2e", "#c9a44c",
  "#234a5c", "#4c7a92", "#2f6b4d", "#a5352c", "#935c1e", "transparent",
];

export function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>{label}</span>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value && value !== "transparent" && !value.includes("gradient") ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border p-0.5"
            style={{ borderColor: "var(--editor-input-border)", background: "var(--editor-input-bg)" }}
          />
        </div>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="transparent, #hex, rgb..."
          className="flex-1 rounded border px-2 py-1.5 text-[12px]"
          style={{ 
            borderColor: "var(--editor-input-border)", 
            background: "var(--editor-input-bg)", 
            color: "var(--editor-text)" 
          }}
        />
      </div>
      {open && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { onChange(c); setOpen(false); }}
              className="h-6 w-6 rounded border"
              style={{ 
                background: c, 
                borderColor: value === c ? "var(--editor-accent)" : "var(--editor-border)" 
              }}
            />
          ))}
        </div>
      )}
      <button type="button" onClick={() => setOpen(!open)} className="mt-1 text-[10px] font-medium" style={{ color: "var(--editor-accent)" }}>
        {open ? "Hide swatches" : "Show swatches"}
      </button>
    </label>
  );
}
