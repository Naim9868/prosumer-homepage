"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function EditorSection({
  title,
  defaultOpen = false,
  children,
  advanced = false,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  advanced?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-card">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          {title}
          {advanced && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
              Advanced
            </span>
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-foreground-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-4 border-t border-border p-4">{children}</div>}
    </div>
  );
}
