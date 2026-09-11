"use client";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import type { HeroBadge, HeroBadgeIcon } from "@/types/homepage";
import { badge as makeBadge } from "@/lib/hero";
import { getHeroBadgeIcon, HERO_BADGE_ICON_OPTIONS } from "@/components/homepage-sections/hero/hero-content";
import { Field, TextInput, Select } from "@/components/homepage-builder/fields";
import { cn } from "@/lib/utils";

export function BadgeListEditor({ badges, onChange }: { badges: HeroBadge[]; onChange: (next: HeroBadge[]) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = badges.findIndex((b) => b.id === active.id);
    const newIndex = badges.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(badges, oldIndex, newIndex));
  };

  const update = (id: string, patch: Partial<HeroBadge>) => onChange(badges.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const remove = (id: string) => onChange(badges.filter((b) => b.id !== id));
  const add = () => onChange([...badges, makeBadge("sparkles", "New badge", "")]);

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={badges.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {badges.map((badge) => (
              <SortableBadgeRow key={badge.id} badge={badge} onUpdate={(patch) => update(badge.id, patch)} onRemove={() => remove(badge.id)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {badges.length < 8 && (
        <button
          type="button"
          onClick={add}
          className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-dashed border-border py-2.5 text-[12.5px] font-semibold text-foreground-muted transition-colors hover:bg-muted"
        >
          <Plus className="h-4 w-4" /> Add badge
        </button>
      )}
    </div>
  );
}

function SortableBadgeRow({
  badge,
  onUpdate,
  onRemove,
}: {
  badge: HeroBadge;
  onUpdate: (patch: Partial<HeroBadge>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: badge.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("space-y-2 rounded-[var(--radius-sm)] border border-border p-3", isDragging && "opacity-60 shadow-lg")}
    >
      <div className="flex items-center gap-2">
        <button type="button" {...attributes} {...listeners} aria-label="Drag to reorder" className="cursor-grab text-foreground-muted active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        {getHeroBadgeIcon(badge.icon)({ className: "h-4 w-4 shrink-0 text-primary" })}
        <TextInput value={badge.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Title" className="flex-1" />
        <button type="button" onClick={onRemove} aria-label="Remove badge" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-destructive hover:bg-muted">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 pl-6">
        <Field label="Icon">
          <Select value={badge.icon} onChange={(v) => onUpdate({ icon: v as HeroBadgeIcon })} options={HERO_BADGE_ICON_OPTIONS} />
        </Field>
        <Field label="Description">
          <TextInput value={badge.description} onChange={(e) => onUpdate({ description: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}
