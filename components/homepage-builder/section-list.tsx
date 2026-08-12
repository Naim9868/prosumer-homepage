"use client";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { Section } from "@/types/homepage";
import { SectionCard } from "@/components/homepage-builder/section-card";

export function SectionList({
  sections,
  selectedId,
  onSelect,
  onReorder,
  onToggleEnabled,
  onDuplicate,
  onDelete,
}: {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (next: Section[]) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((s) => s.id === active.id);
    const newIndex = sorted.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
    onReorder(reordered);
  };

  return (
    <DndContext id="section-list" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sorted.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sorted.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              selected={selectedId === section.id}
              onSelect={() => onSelect(section.id)}
              onToggleEnabled={(enabled) => onToggleEnabled(section.id, enabled)}
              onDuplicate={() => onDuplicate(section.id)}
              onDelete={() => onDelete(section.id)}
            />
          ))}
          {sorted.length === 0 && (
            <p className="rounded-[var(--radius-md)] border border-dashed border-border p-6 text-center text-[13px] text-foreground-muted">
              No sections yet. Click &ldquo;Add Section&rdquo; to build your homepage.
            </p>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
