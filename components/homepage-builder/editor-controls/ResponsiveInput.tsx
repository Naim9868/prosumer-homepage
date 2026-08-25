"use client";
import { useEditorDevice } from "@/components/homepage-builder/editor-context";
import type { ResponsiveValue, EditorDevice } from "@/types/homepage";
import { cn } from "@/lib/utils";

const DEVICE_ICONS: Record<EditorDevice, string> = { desktop: "🖥", tablet: "📱", mobile: "📱" };

export function ResponsiveInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  units,
}: {
  label: string;
  value: ResponsiveValue<string>;
  onChange: (v: ResponsiveValue<string>) => void;
  placeholder?: string;
  type?: "text" | "number";
  min?: number;
  max?: number;
  units?: string[];
}) {
  const { device } = useEditorDevice();
  const currentValue = value?.[device] ?? "";

  const handleChange = (v: string) => {
    onChange({ ...value, [device]: v });
  };

  const clearDevice = () => {
    const next = { ...value };
    delete next[device];
    onChange(next);
  };

  const hasOverride = value?.[device] !== undefined && value[device] !== "";

  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>
          {label} {DEVICE_ICONS[device]}
        </span>
        {hasOverride && device !== "desktop" && (
          <button type="button" onClick={clearDevice} className="text-[9px] font-medium" style={{ color: "var(--editor-accent)" }}>
            Reset
          </button>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        <input
          type={type}
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder || "auto"}
          min={min}
          max={max}
          className="w-full rounded border px-2 py-1.5 text-[12px]"
          style={{ 
            borderColor: "var(--editor-input-border)", 
            background: "var(--editor-input-bg)", 
            color: "var(--editor-text)" 
          }}
        />
        {units && currentValue && !units.some((u) => currentValue.endsWith(u)) && (
          <select
            value=""
            onChange={(e) => handleChange(currentValue + e.target.value)}
            className="rounded border px-1 py-1.5 text-[11px]"
            style={{ 
              borderColor: "var(--editor-input-border)", 
              background: "var(--editor-input-bg)", 
              color: "var(--editor-text)" 
            }}
          >
            <option value="">unit</option>
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        )}
      </div>
    </label>
  );
}
