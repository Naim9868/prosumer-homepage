"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ChevronDown, Plus } from "lucide-react";
import type { Block, BlockType } from "@/types/homepage";
import { BLOCK_TYPE_META, BLOCK_TYPES } from "@/types/homepage";
import { BLOCK_EDITOR_REGISTRY } from "@/components/homepage-builder/block-editor-registry";
import { createDefaultBlock } from "@/lib/homepage-defaults";
import { cn } from "@/lib/utils";

export function BlockList({ blocks, onChange }: { blocks: Block[]; onChange: (next: Block[]) => void }) {
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((b) => b.id === active.id);
    const newIndex = sorted.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }));
    onChange(reordered);
  };

  const updateBlock = (id: string, settings: Block["settings"]) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, settings } : b)));
  };
  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
    if (openBlockId === id) setOpenBlockId(null);
  };
  const addBlock = (type: BlockType) => {
    const next = createDefaultBlock(type, blocks.length);
    onChange([...blocks, next]);
    setOpenBlockId(next.id);
    setPickerOpen(false);
  };

  return (
    <div className="space-y-3">
      <DndContext id="block-list" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {sorted.map((block) => (
            <SortableBlockCard
              key={block.id}
              block={block}
              isOpen={openBlockId === block.id}
              onToggle={() => setOpenBlockId(openBlockId === block.id ? null : block.id)}
              onRemove={() => removeBlock(block.id)}
              onChange={(settings) => updateBlock(block.id, settings)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <p className="rounded-[var(--radius-md)] border border-dashed border-border p-6 text-center text-[13px] text-foreground-muted">
          No blocks yet. Add one below to start building this section.
        </p>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-[13px] font-semibold text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4" /> Add Block
        </button>
        {pickerOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-[var(--radius-md)] border border-border bg-card p-2 shadow-lg">
            {BLOCK_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="flex w-full flex-col items-start rounded-[var(--radius-sm)] px-3 py-2 text-left hover:bg-muted"
              >
                <span className="text-[13px] font-semibold text-foreground">{BLOCK_TYPE_META[type].label}</span>
                <span className="text-[11.5px] text-foreground-muted">{BLOCK_TYPE_META[type].description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SortableBlockCard({
  block,
  isOpen,
  onToggle,
  onRemove,
  onChange,
}: {
  block: Block;
  isOpen: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (settings: Block["settings"]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Editor = BLOCK_EDITOR_REGISTRY[block.type] as any;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-[var(--radius-md)] border border-border bg-card", isDragging && "opacity-60 shadow-lg")}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" {...attributes} {...listeners} aria-label="Drag to reorder" className="cursor-grab text-foreground-muted active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={onToggle} className="flex flex-1 items-center justify-between gap-2 text-left">
          <span className="text-[13px] font-semibold text-foreground">{BLOCK_TYPE_META[block.type].label}</span>
          <ChevronDown className={cn("h-4 w-4 text-foreground-muted transition-transform", isOpen && "rotate-180")} />
        </button>
        <button type="button" onClick={onRemove} aria-label="Delete block" className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-destructive hover:bg-muted">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {isOpen && Editor && (
        <div className="border-t border-border p-4">
          <Editor settings={block.settings} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
