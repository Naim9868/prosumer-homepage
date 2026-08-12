"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, Settings2 } from "lucide-react";
import type { Section } from "@/types/homepage";
import { SECTION_TYPE_META } from "@/types/homepage";
import { Toggle } from "@/components/homepage-builder/fields";
import { cn } from "@/lib/utils";

function sectionLabel(section: Section) {
  if (section.type === "custom") return section.settings.name || "Custom Section";
  return SECTION_TYPE_META[section.type].label;
}

export function SectionCard({
  section,
  selected,
  onSelect,
  onToggleEnabled,
  onDuplicate,
  onDelete,
}: {
  section: Section;
  selected: boolean;
  onSelect: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-[var(--radius-md)] border bg-card px-2 py-2.5 transition-colors",
        selected ? "border-primary shadow-sm" : "border-border",
        isDragging && "opacity-60 shadow-lg",
        !section.enabled && "opacity-60"
      )}
    >
      <button type="button" {...attributes} {...listeners} aria-label="Drag to reorder" className="cursor-grab p-1 text-foreground-muted active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>

      <button type="button" onClick={onSelect} className="flex flex-1 items-center gap-2 text-left">
        <Settings2 className={cn("h-3.5 w-3.5 shrink-0", selected ? "text-primary" : "text-foreground-muted")} />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">{sectionLabel(section)}</p>
          {section.type === "custom" && <p className="text-[10.5px] text-foreground-muted">Custom · {section.blocks.length} blocks</p>}
        </div>
      </button>

      <Toggle checked={section.enabled} onChange={onToggleEnabled} label="Enable section" />
      <button type="button" onClick={onDuplicate} aria-label="Duplicate section" className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-foreground-muted hover:bg-muted">
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onDelete} aria-label="Delete section" className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-destructive hover:bg-muted">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
