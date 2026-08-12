"use client";

import { X } from "lucide-react";
import { PREDEFINED_SECTION_TYPES, SECTION_TYPE_META, type PredefinedSectionType } from "@/types/homepage";

export function AddSectionModal({
  open,
  onClose,
  onAddPredefined,
  onAddCustom,
}: {
  open: boolean;
  onClose: () => void;
  onAddPredefined: (type: PredefinedSectionType) => void;
  onAddCustom: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-lg"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Add Section</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onAddCustom}
            className="flex flex-col items-start gap-1 rounded-[var(--radius-md)] border-2 border-dashed border-primary/50 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
          >
            <span className="text-[13.5px] font-semibold text-primary">{SECTION_TYPE_META.custom.label}</span>
            <span className="text-[12px] text-foreground-muted">{SECTION_TYPE_META.custom.description}</span>
          </button>

          {PREDEFINED_SECTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onAddPredefined(type)}
              className="flex flex-col items-start gap-1 rounded-[var(--radius-md)] border border-border p-4 text-left transition-colors hover:bg-muted"
            >
              <span className="text-[13.5px] font-semibold text-foreground">{SECTION_TYPE_META[type].label}</span>
              <span className="text-[12px] text-foreground-muted">{SECTION_TYPE_META[type].description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
