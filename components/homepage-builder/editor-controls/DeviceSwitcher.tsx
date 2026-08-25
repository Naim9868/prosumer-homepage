"use client";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { useEditorDevice } from "@/components/homepage-builder/editor-context";
import type { EditorDevice } from "@/types/homepage";
import { cn } from "@/lib/utils";

const DEVICES: { value: EditorDevice; icon: typeof Monitor; label: string }[] = [
  { value: "desktop", icon: Monitor, label: "Desktop" },
  { value: "tablet", icon: Tablet, label: "Tablet" },
  { value: "mobile", icon: Smartphone, label: "Mobile" },
];

export function DeviceSwitcher() {
  const { device, setDevice } = useEditorDevice();
  return (
    <div className="flex items-center gap-0.5 rounded-lg border p-0.5" style={{ borderColor: "var(--editor-border)", background: "var(--editor-card)" }}>
      {DEVICES.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setDevice(value)}
          title={label}
          className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-colors")}
          style={{
            background: device === value ? "var(--editor-accent)" : "transparent",
            color: device === value ? "#fff" : "var(--editor-text-muted)",
          }}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
