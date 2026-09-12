"use client";

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Plus, Trash2 } from "lucide-react";
import type { HeroSlide } from "@/types/homepage";
import { Toggle, TextInput } from "@/components/homepage-builder/fields";
import { cn } from "@/lib/utils";

function SlideRow({
  slide,
  index,
  selected,
  onSelect,
  onToggleEnabled,
  onDuplicate,
  onDelete,
  onRename,
}: {
  slide: HeroSlide;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(slide.name);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== slide.name) onRename(draft.trim());
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 rounded-[var(--radius-sm)] border bg-card px-1.5 py-1 transition-colors",
        selected ? "border-primary shadow-sm" : "border-border",
        isDragging && "opacity-60 shadow-lg",
        !slide.enabled && "opacity-60"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder slide"
        className="cursor-grab p-0.5 text-foreground-muted active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3" />
      </button>

      <div className="min-w-0 flex-1 cursor-pointer text-left" onClick={onSelect} onDoubleClick={() => setEditing(true)} title="Double-click to rename">
        <span className="mr-1 text-[9px] font-bold text-foreground-muted">#{index + 1}</span>
        {editing ? (
          <TextInput
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(slide.name);
                setEditing(false);
              }
            }}
            className="inline w-24 px-1.5 py-0 text-[11px]"
          />
        ) : (
          <span className={cn("truncate text-[11px] font-semibold", selected ? "text-primary" : "text-foreground")}>
            {slide.name || "Untitled slide"}
          </span>
        )}
      </div>

      <Toggle checked={slide.enabled} onChange={onToggleEnabled} label="Enable slide" />
      <button
        type="button"
        onClick={onDuplicate}
        aria-label="Duplicate slide"
        className="flex h-5 w-5 items-center justify-center rounded text-foreground-muted hover:bg-muted"
      >
        <Copy className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete slide"
        className="flex h-5 w-5 items-center justify-center rounded text-destructive hover:bg-muted"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export function HeroSlideList({
  slides,
  selectedId,
  onSelect,
  onReorder,
  onToggleEnabled,
  onDuplicate,
  onDelete,
  onRename,
  onAdd,
}: {
  slides: HeroSlide[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (next: HeroSlide[]) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAdd: () => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(slides, oldIndex, newIndex));
  };

  return (
    <div className="space-y-1.5">
      <DndContext id="hero-slide-list" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {slides.map((slide, i) => (
              <SlideRow
                key={slide.id}
                slide={slide}
                index={i}
                selected={selectedId === slide.id}
                onSelect={() => onSelect(slide.id)}
                onToggleEnabled={(enabled) => onToggleEnabled(slide.id, enabled)}
                onDuplicate={() => onDuplicate(slide.id)}
                onDelete={() => onDelete(slide.id)}
                onRename={(name) => onRename(slide.id, name)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-1 rounded-[var(--radius-sm)] border border-dashed border-border py-1.5 text-[10.5px] font-semibold text-foreground-muted transition-colors hover:bg-muted"
      >
        <Plus className="h-3 w-3" /> Add Slide
      </button>
    </div>
  );
}
