"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  MeasuringStrategy,
  useSensor,
  useSensors,
  useDraggable,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Layers, Plus } from "lucide-react";
import type { Block, BlockType, BlockStyle, BlockAdvanced, BlockLayout, BlockSettingsMap, CustomSection, CustomSectionLayout } from "@/types/homepage";
import { BLOCK_TYPE_META, BLOCK_TYPES } from "@/types/homepage";
import { createDefaultBlock } from "@/lib/homepage-defaults";
import { useCatalog } from "@/components/shared/catalog-context";
import {
  EditorDeviceProvider,
  EditorThemeProvider,
  useEditorTheme,
} from "@/components/homepage-builder/editor-context";
import { DeviceSwitcher } from "@/components/homepage-builder/editor-controls/DeviceSwitcher";
import { BlockStylePanel } from "@/components/homepage-builder/editor-panels/BlockStylePanel";
import { SectionSettingsPanel } from "@/components/homepage-builder/editor-panels/SectionSettingsPanel";
import { ResponsiveCanvasRenderer, type CanvasBlockActions } from "@/components/homepage-builder/responsive-canvas";

type Selection = { kind: "section" } | { kind: "block"; id: string };

type SectionTemplate = {
  id: string;
  name: string;
  layout: CustomSectionLayout;
  blocks: Block[];
};

type GlobalWidgetTemplate = {
  id: string;
  name: string;
  settings: BlockSettingsMap["customWidget"];
  style?: BlockStyle;
  layout?: BlockLayout;
  advanced?: BlockAdvanced;
};

const SECTION_TEMPLATE_STORAGE_KEY = "homepage-builder-custom-section-templates-v1";
const GLOBAL_WIDGET_STORAGE_KEY = "homepage-builder-global-custom-widgets-v1";

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ─── Tree utilities ────────────────────────────────────────────

function isContainer(block: Block): block is Block<"container"> {
  return block.type === "container";
}

/** Find a block anywhere in the tree by its ID. Returns the block and its parent blocks array. */
function findBlockInTree(blocks: Block[], id: string): { parent: Block[]; block: Block; index: number } | null {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === id) return { parent: blocks, block: b, index: i };
    if (isContainer(b) && b.settings.blocks?.length) {
      const found = findBlockInTree(b.settings.blocks, id);
      if (found) return found;
    }
  }
  return null;
}

/** Resolve sortable IDs such as parentId--childId back to the real block ID. */
function findBlockBySortableId(blocks: Block[], sortableId: string): { parent: Block[]; block: Block; index: number } | null {
  if (!sortableId.includes("--")) return findBlockInTree(blocks, sortableId);

  const parts = sortableId.split("--");
  let current = blocks;
  let found: { parent: Block[]; block: Block; index: number } | null = null;

  for (const part of parts) {
    found = findBlockInTree(current, part);
    if (!found) return null;
    current = isContainer(found.block) ? found.block.settings.blocks || [] : [];
  }

  return found;
}

/** Find a container block that contains the given child ID. */
function findContainerForChild(blocks: Block[], childId: string): Block<"container"> | null {
  for (const block of blocks) {
    if (isContainer(block) && block.settings.blocks?.some((c) => c.id === childId)) {
      return block;
    }
    if (isContainer(block) && block.settings.blocks?.length) {
      const found = findContainerForChild(block.settings.blocks, childId);
      if (found) return found;
    }
  }
  return null;
}

/** Add a block to a container's children array. */
function addBlockToContainer(blocks: Block[], containerId: string, newBlock: Block): Block[] {
  return blocks.map((b) => {
    if (b.id === containerId && isContainer(b)) {
      const children = [...(b.settings.blocks || []), newBlock].map((c, i) => ({ ...c, order: i }));
      return { ...b, settings: { ...b.settings, blocks: children } } as Block<"container">;
    }
    if (isContainer(b) && b.settings.blocks?.length) {
      return { ...b, settings: { ...b.settings, blocks: addBlockToContainer(b.settings.blocks, containerId, newBlock) } } as Block<"container">;
    }
    return b;
  });
}

/** Remove a child from a container. */
function removeBlockFromContainer(blocks: Block[], containerId: string, childId: string): Block[] {
  return blocks.map((b) => {
    if (b.id === containerId && isContainer(b)) {
      const children = (b.settings.blocks || [])
        .filter((c) => c.id !== childId)
        .map((c: Block, i: number) => ({ ...c, order: i }));
      return { ...b, settings: { ...b.settings, blocks: children } } as Block<"container">;
    }
    if (isContainer(b) && b.settings.blocks?.length) {
      return { ...b, settings: { ...b.settings, blocks: removeBlockFromContainer(b.settings.blocks, containerId, childId) } } as Block<"container">;
    }
    return b;
  });
}

/** Reorder a child within a container. */
function moveBlockInContainer(blocks: Block[], containerId: string, childId: string, direction: "up" | "down"): Block[] {
  return blocks.map((b) => {
    if (b.id === containerId && isContainer(b)) {
      const sorted = [...(b.settings.blocks || [])].sort((a, c) => a.order - c.order);
      const idx = sorted.findIndex((c) => c.id === childId);
      if (idx < 0) return b;
      if (direction === "up" && idx === 0) return b;
      if (direction === "down" && idx === sorted.length - 1) return b;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const reordered = arrayMove(sorted, idx, targetIdx).map((c, i) => ({ ...c, order: i }));
      return { ...b, settings: { ...b.settings, blocks: reordered } } as Block<"container">;
    }
    if (isContainer(b) && b.settings.blocks?.length) {
      return { ...b, settings: { ...b.settings, blocks: moveBlockInContainer(b.settings.blocks, containerId, childId, direction) } } as Block<"container">;
    }
    return b;
  });
}

/** Update a nested block's settings/style/layout/advanced anywhere in the tree. */
function updateNestedBlock(blocks: Block[], blockId: string, updater: (prev: Block) => Block): Block[] {
  return blocks.map((b) => {
    if (b.id === blockId) return updater(b);
    if (isContainer(b) && b.settings.blocks?.length) {
      return { ...b, settings: { ...b.settings, blocks: updateNestedBlock(b.settings.blocks, blockId, updater) } } as Block<"container">;
    }
    return b;
  });
}

// ─── Section presets ───────────────────────────────────────────

type SectionPreset = {
  id: string;
  label: string;
  description: string;
  build: () => { layout: CustomSectionLayout; blocks: Block[] };
};

const SECTION_PRESETS: SectionPreset[] = [
  {
    id: "one-col",
    label: "1 Column",
    description: "Single full-width column",
    build: () => ({
      layout: { mode: "grid", columns: 1, gap: 24, flexDirection: "row-wrap", justifyContent: "flex-start", alignItems: "stretch" },
      blocks: [],
    }),
  },
  {
    id: "two-col",
    label: "2 Columns",
    description: "Balanced two-column structure",
    build: () => ({
      layout: { mode: "grid", columns: 2, gap: 24, flexDirection: "row-wrap", justifyContent: "flex-start", alignItems: "stretch" },
      blocks: [],
    }),
  },
  {
    id: "three-col",
    label: "3 Columns",
    description: "Cards/features in three columns",
    build: () => ({
      layout: { mode: "grid", columns: 3, gap: 20, flexDirection: "row-wrap", justifyContent: "flex-start", alignItems: "stretch" },
      blocks: [],
    }),
  },
  {
    id: "split-2-1",
    label: "2/3 + 1/3",
    description: "Feature plus supporting panel",
    build: () => ({
      layout: { mode: "grid", columns: 3, gap: 24, flexDirection: "row-wrap", justifyContent: "flex-start", alignItems: "stretch" },
      blocks: [],
    }),
  },
  {
    id: "flex-row",
    label: "Flex Row",
    description: "Wrapping flex layout",
    build: () => ({
      layout: { mode: "flex", columns: 3, gap: 20, flexDirection: "row-wrap", justifyContent: "flex-start", alignItems: "stretch" },
      blocks: [],
    }),
  },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useEditorTheme();
  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as "system" | "light" | "dark")}
      className="rounded-md border px-2 py-1 text-[11px] font-medium"
      style={{ borderColor: "var(--editor-border)", background: "var(--editor-card)", color: "var(--editor-text-secondary)" }}
    >
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}

export function CustomSectionEditor({
  section,
  onChange,
}: {
  section: CustomSection;
  onChange: (next: CustomSection) => void;
}) {
  return (
    <EditorThemeProvider>
      <EditorDeviceProvider>
        <CustomSectionEditorInner section={section} onChange={onChange} />
      </EditorDeviceProvider>
    </EditorThemeProvider>
  );
}

function CustomSectionEditorInner({
  section,
  onChange,
}: {
  section: CustomSection;
  onChange: (next: CustomSection) => void;
}) {
  const catalog = useCatalog();
  const [selection, setSelection] = useState<Selection>({ kind: "section" });
  const [dragType, setDragType] = useState<BlockType | null>(null);
  const [sectionTemplates, setSectionTemplates] = useState<SectionTemplate[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(SECTION_TEMPLATE_STORAGE_KEY);
      return raw ? cloneJson(JSON.parse(raw) as SectionTemplate[]) : [];
    } catch {
      return [];
    }
  });
  const [globalWidgetTemplates, setGlobalWidgetTemplates] = useState<GlobalWidgetTemplate[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(GLOBAL_WIDGET_STORAGE_KEY);
      return raw ? cloneJson(JSON.parse(raw) as GlobalWidgetTemplate[]) : [];
    } catch {
      return [];
    }
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const blocks = useMemo(() => [...section.blocks].sort((a, b) => a.order - b.order), [section.blocks]);

  /** Find the currently selected block anywhere in the tree. */
  const selectedBlock = useMemo(() => {
    if (selection.kind !== "block") return undefined;
    const found = findBlockInTree(section.blocks, selection.id);
    return found?.block;
  }, [section.blocks, selection]);

  const persistSectionTemplates = useCallback((next: SectionTemplate[]) => {
    setSectionTemplates(next);
    try { localStorage.setItem(SECTION_TEMPLATE_STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const persistGlobalWidgetTemplates = useCallback((next: GlobalWidgetTemplate[]) => {
    setGlobalWidgetTemplates(next);
    try { localStorage.setItem(GLOBAL_WIDGET_STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const updateBlocks = useCallback((next: Block[]) => onChange({ ...section, blocks: next }), [section, onChange]);

  const addBlock = useCallback((type: BlockType) => {
    const block = createDefaultBlock(type, section.blocks.length);
    updateBlocks([...section.blocks, block]);
    setSelection({ kind: "block", id: block.id });
  }, [section.blocks, updateBlocks]);

  const addEmptySection = useCallback(() => {
    const container = createDefaultBlock("container", section.blocks.length);
    if (container.type !== "container") return;

    container.settings = {
      ...container.settings,
      name: `Section ${section.blocks.length + 1}`,
      blocks: [],
    };
    updateBlocks([...section.blocks, container]);
    setSelection({ kind: "block", id: container.id });
  }, [section.blocks, updateBlocks]);

  const addBlockToContainerCb = useCallback((containerId: string, type: BlockType) => {
    const found = findBlockInTree(section.blocks, containerId);
    if (!found || !isContainer(found.block)) return;
    const container = found.block;
    const childCount = container.settings.blocks?.length ?? 0;
    const block = createDefaultBlock(type, childCount);
    updateBlocks(addBlockToContainer(section.blocks, containerId, block));
  }, [section.blocks, updateBlocks]);

  const addGlobalWidgetTemplate = useCallback((template: GlobalWidgetTemplate) => {
    const block = createDefaultBlock("customWidget", section.blocks.length);
    if (block.type === "customWidget") block.settings = cloneJson(template.settings);
    block.style = template.style ? cloneJson(template.style) : undefined;
    block.layout = template.layout ? cloneJson(template.layout) : block.layout;
    block.advanced = template.advanced ? cloneJson(template.advanced) : undefined;
    updateBlocks([...section.blocks, block]);
    setSelection({ kind: "block", id: block.id });
  }, [section.blocks, updateBlocks]);

  const addSectionPreset = useCallback((presetId: string) => {
    const preset = SECTION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const sorted = [...section.blocks].sort((a, b) => a.order - b.order);
    const built = preset.build();
    const nextBlocks = sorted.map((b, i) => ({ ...b, order: i }));
    onChange({
      ...section,
      settings: { ...section.settings, layout: built.layout },
      blocks: nextBlocks,
    });
    setSelection({ kind: "section" });
  }, [onChange, section]);

  const saveCurrentSectionAsTemplate = useCallback(() => {
    const name = window.prompt("Template name", section.settings.name || "Custom section template");
    if (!name || !name.trim()) return;
    const template: SectionTemplate = {
      id: `tpl_${Math.random().toString(36).slice(2, 10)}`,
      name: name.trim(),
      layout: cloneJson(section.settings.layout),
      blocks: cloneJson([...section.blocks].sort((a, b) => a.order - b.order)),
    };
    persistSectionTemplates([template, ...sectionTemplates]);
  }, [persistSectionTemplates, section.settings.layout, section.settings.name, section.blocks, sectionTemplates]);

  const applySectionTemplate = useCallback((template: SectionTemplate) => {
    const nextBlocks = cloneJson(template.blocks).map((b, i) => ({ ...b, order: i }));
    onChange({
      ...section,
      settings: { ...section.settings, layout: cloneJson(template.layout) },
      blocks: nextBlocks,
    });
    const first = nextBlocks[0];
    setSelection(first ? { kind: "block", id: first.id } : { kind: "section" });
  }, [onChange, section]);

  const deleteSectionTemplate = useCallback((id: string) => {
    persistSectionTemplates(sectionTemplates.filter((t) => t.id !== id));
  }, [persistSectionTemplates, sectionTemplates]);

  const saveSelectedWidgetAsGlobal = useCallback(() => {
    if (!selectedBlock || selectedBlock.type !== "customWidget") return;
    const ws = selectedBlock.settings as BlockSettingsMap["customWidget"];
    const name = window.prompt("Global widget name", ws.title || "Custom widget");
    if (!name || !name.trim()) return;
    const template: GlobalWidgetTemplate = {
      id: `gwd_${Math.random().toString(36).slice(2, 10)}`,
      name: name.trim(),
      settings: cloneJson(ws),
      style: selectedBlock.style ? cloneJson(selectedBlock.style) : undefined,
      layout: selectedBlock.layout ? cloneJson(selectedBlock.layout) : undefined,
      advanced: selectedBlock.advanced ? cloneJson(selectedBlock.advanced) : undefined,
    };
    persistGlobalWidgetTemplates([template, ...globalWidgetTemplates]);
  }, [selectedBlock, persistGlobalWidgetTemplates, globalWidgetTemplates]);

  const deleteGlobalWidgetTemplate = useCallback((id: string) => {
    persistGlobalWidgetTemplates(globalWidgetTemplates.filter((t) => t.id !== id));
  }, [persistGlobalWidgetTemplates, globalWidgetTemplates]);

  const removeBlock = useCallback((id: string) => {
    const container = findContainerForChild(section.blocks, id);
    if (container) {
      updateBlocks(removeBlockFromContainer(section.blocks, container.id, id));
    } else {
      updateBlocks(section.blocks.filter((b) => b.id !== id));
    }
    if (selection.kind === "block" && selection.id === id) setSelection({ kind: "section" });
  }, [section.blocks, updateBlocks, selection]);

  const duplicateBlock = useCallback((id: string) => {
    const found = findBlockInTree(section.blocks, id);
    if (!found) return;
    const source = found.block;
    const copy: Block = {
      ...source,
      id: `blk_${Math.random().toString(36).slice(2, 9)}`,
      settings: JSON.parse(JSON.stringify(source.settings)),
      style: source.style ? JSON.parse(JSON.stringify(source.style)) : undefined,
      layout: source.layout ? { ...source.layout } : undefined,
      advanced: source.advanced ? { ...source.advanced } : undefined,
    };

    const container = findContainerForChild(section.blocks, id);
    if (container) {
      const children = [...(container.settings.blocks || []), copy].map((c, i) => ({ ...c, order: i }));
      updateBlocks(section.blocks.map((b) =>
        b.id === container.id ? { ...b, settings: { ...b.settings, blocks: children } } : b
      ));
    } else {
      const sorted = [...section.blocks].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.id === id);
      const next = [...sorted];
      next.splice(idx + 1, 0, copy);
      updateBlocks(next.map((b, i) => ({ ...b, order: i })));
    }
    setSelection({ kind: "block", id: copy.id });
  }, [section.blocks, updateBlocks]);

  const moveBlock = useCallback((id: string, direction: "up" | "down") => {
    const container = findContainerForChild(section.blocks, id);
    if (container) {
      updateBlocks(moveBlockInContainer(section.blocks, container.id, id, direction));
    } else {
      const sorted = [...section.blocks].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.id === id);
      if (idx < 0) return;
      if (direction === "up" && idx === 0) return;
      if (direction === "down" && idx === sorted.length - 1) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      updateBlocks(arrayMove(sorted, idx, targetIdx).map((b, i) => ({ ...b, order: i })));
    }
  }, [section.blocks, updateBlocks]);

  const updateBlockSettings = useCallback((id: string, settings: BlockSettingsMap[BlockType]) => {
    updateBlocks(updateNestedBlock(section.blocks, id, (b) => ({ ...b, settings })));
  }, [section.blocks, updateBlocks]);

  const updateBlockStyle = useCallback((id: string, style: BlockStyle) => {
    updateBlocks(updateNestedBlock(section.blocks, id, (b) => ({ ...b, style })));
  }, [section.blocks, updateBlocks]);

  const updateBlockAdvanced = useCallback((id: string, advanced: BlockAdvanced) => {
    updateBlocks(updateNestedBlock(section.blocks, id, (b) => ({ ...b, advanced })));
  }, [section.blocks, updateBlocks]);

  const updateBlockLayout = useCallback((id: string, layout: BlockLayout) => {
    updateBlocks(updateNestedBlock(section.blocks, id, (b) => ({ ...b, layout })));
  }, [section.blocks, updateBlocks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith("palette-")) setDragType(id.replace("palette-", "") as BlockType);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDragType(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Palette → canvas drop
    if (activeId.startsWith("palette-")) {
      const type = activeId.replace("palette-", "") as BlockType;

      // Check if dropping into a container
      if (overId.startsWith("drop-")) {
        const containerId = overId.replace("drop-", "");
        addBlockToContainerCb(containerId, type);
        return;
      }

      addBlock(type);
      return;
    }

    // Canvas reorder — same block, skip
    if (activeId === overId) return;

    // Check if we're dropping onto a container drop zone
    if (overId.startsWith("drop-")) {
      const containerId = overId.replace("drop-", "");
      // Find the active block and move it into the container
      const found = findBlockBySortableId(section.blocks, activeId);
      if (found) {
        // Remove from current location
        const container = findContainerForChild(section.blocks, activeId);
        let nextBlocks: Block[];
        if (container) {
          nextBlocks = removeBlockFromContainer(section.blocks, container.id, activeId);
        } else {
          nextBlocks = section.blocks.filter((b) => b.id !== activeId);
        }
        // Add to target container
        const blockToAdd = found.block;
        updateBlocks(addBlockToContainer(nextBlocks, containerId, blockToAdd));
      }
      return;
    }

    // Check if both IDs are nested (contain "--") — reorder within same container
    const activeNested = activeId.includes("--");
    const overNested = overId.includes("--");

    if (activeNested && overNested) {
      const activeParent = activeId.split("--")[0];
      const overParent = overId.split("--")[0];
      const activeChildId = activeId.split("--").slice(1).join("--");
      const overChildId = overId.split("--").slice(1).join("--");

      if (activeParent === overParent) {
        // Same container — reorder
        const found = findBlockInTree(section.blocks, activeParent);
        if (found && isContainer(found.block)) {
          const container = found.block;
          const sorted = [...(container.settings.blocks || [])].sort((a, b) => a.order - b.order);
          const oldIdx = sorted.findIndex((c) => c.id === activeChildId);
          const newIdx = sorted.findIndex((c) => c.id === overChildId);
          if (oldIdx >= 0 && newIdx >= 0) {
            const reordered = arrayMove(sorted, oldIdx, newIdx).map((c, i) => ({ ...c, order: i }));
            updateBlocks(section.blocks.map((b) =>
              b.id === activeParent ? { ...b, settings: { ...b.settings, blocks: reordered } } : b
            ));
          }
        }
      }
      return;
    }

    // Top-level reorder
    const oldIndex = blocks.findIndex((b) => b.id === activeId);
    const newIndex = blocks.findIndex((b) => b.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;
    updateBlocks(arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({ ...b, order: i })));
  }, [addBlock, addBlockToContainerCb, blocks, section.blocks, updateBlocks]);

  const handleDragCancel = useCallback(() => setDragType(null), []);

  const handleCanvasDeselect = useCallback(() => setSelection({ kind: "section" }), []);

  const canvasActions: CanvasBlockActions = useMemo(() => ({
    onSelect: (id) => setSelection({ kind: "block", id }),
    onDelete: removeBlock,
    onDuplicate: duplicateBlock,
    onMoveUp: (id) => moveBlock(id, "up"),
    onMoveDown: (id) => moveBlock(id, "down"),
    onAddToContainer: addBlockToContainerCb,
    onRemoveFromContainer: (containerId, childId) => {
      updateBlocks(removeBlockFromContainer(section.blocks, containerId, childId));
    },
    onMoveInContainer: (containerId, childId, direction) => {
      updateBlocks(moveBlockInContainer(section.blocks, containerId, childId, direction));
    },
  }), [removeBlock, duplicateBlock, moveBlock, addBlockToContainerCb, section.blocks, updateBlocks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full min-h-[600px] flex-col overflow-hidden lg:flex-row" style={{ background: "var(--editor-bg)" }}>
        {/* Left -- widget palette */}
        <aside className="flex shrink-0 flex-col overflow-hidden border-r lg:w-60" style={{ borderColor: "var(--editor-border)", background: "var(--editor-panel)" }}>
          <div className="shrink-0 border-b px-3 py-2.5" style={{ borderColor: "var(--editor-border)" }}>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>
              <Layers className="h-3.5 w-3.5" /> Widgets
            </p>
            <p className="mt-0.5 text-[10px]" style={{ color: "var(--editor-text-muted)" }}>Drag or tap + to add</p>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
            <div className="mb-2 rounded-md border p-2" style={{ borderColor: "var(--editor-border)", background: "var(--editor-card)" }}>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>
                  Section Templates
                </p>
                <button
                  type="button"
                  onClick={saveCurrentSectionAsTemplate}
                  className="rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ borderColor: "var(--editor-border)", color: "var(--editor-accent)" }}
                >
                  Save
                </button>
              </div>
              <div className="space-y-1">
                {sectionTemplates.length === 0 ? (
                  <p className="text-[10px]" style={{ color: "var(--editor-text-muted)" }}>No templates yet</p>
                ) : sectionTemplates.map((template) => (
                  <div key={template.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => applySectionTemplate(template)}
                      className="flex-1 rounded border px-2 py-1 text-left text-[10px] font-medium"
                      style={{ borderColor: "var(--editor-border)", color: "var(--editor-text)", background: "var(--editor-surface)" }}
                    >
                      {template.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSectionTemplate(template.id)}
                      className="rounded border px-1.5 py-1 text-[10px]"
                      style={{ borderColor: "var(--editor-border)", color: "#ef4444" }}
                      title="Delete template"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-2 rounded-md border p-2" style={{ borderColor: "var(--editor-border)", background: "var(--editor-card)" }}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>
                Add Section
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {SECTION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => addSectionPreset(preset.id)}
                    title={preset.description}
                    className="rounded border px-2 py-1.5 text-left text-[10px] font-semibold transition-colors"
                    style={{ borderColor: "var(--editor-border)", color: "var(--editor-text)", background: "var(--editor-surface)" }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2 rounded-md border p-2" style={{ borderColor: "var(--editor-border)", background: "var(--editor-card)" }}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>
                Global Widgets
              </p>
              <div className="space-y-1">
                {globalWidgetTemplates.length === 0 ? (
                  <p className="text-[10px]" style={{ color: "var(--editor-text-muted)" }}>No global widgets saved</p>
                ) : globalWidgetTemplates.map((template) => (
                  <div key={template.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => addGlobalWidgetTemplate(template)}
                      className="flex-1 rounded border px-2 py-1 text-left text-[10px] font-medium"
                      style={{ borderColor: "var(--editor-border)", color: "var(--editor-text)", background: "var(--editor-surface)" }}
                    >
                      {template.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGlobalWidgetTemplate(template.id)}
                      className="rounded border px-1.5 py-1 text-[10px]"
                      style={{ borderColor: "var(--editor-border)", color: "#ef4444" }}
                      title="Delete global widget"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="px-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>
              Custom Widget First
            </p>
            <PaletteWidget type="customWidget" onAdd={() => addBlock("customWidget")} />

            <p className="pt-2 px-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>
              Legacy Widgets
            </p>
            {BLOCK_TYPES.filter((type) => type !== "customWidget").map((type) => (
              <PaletteWidget key={type} type={type} onAdd={() => addBlock(type)} />
            ))}
          </div>
        </aside>

        {/* Center -- canvas */}
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderColor: "var(--editor-border)", background: "var(--editor-panel)" }}>
            <div className="flex items-center gap-3">
              <DeviceSwitcher />
              <span className="text-[11px] font-medium" style={{ color: "var(--editor-text-muted)" }}>
                {blocks.length} block{blocks.length !== 1 && "s"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addEmptySection}
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[var(--editor-accent-light)]"
                style={{ borderColor: "var(--editor-accent)", color: "var(--editor-accent)", background: "var(--editor-surface)" }}
                title="Add an empty nested section"
              >
                <Plus className="h-3.5 w-3.5" /> Add Section
              </button>
              <ThemeSwitcher />
            </div>
          </div>
          <div
            className="absolute inset-0 top-10 overflow-y-auto p-6"
            style={{ background: "var(--editor-card)" }}
            onClick={handleCanvasDeselect}
          >
            <ResponsiveCanvasRenderer
              blocks={blocks}
              catalog={catalog}
              selectedBlockId={selectedBlock?.id}
              actions={canvasActions}
              layout={section.settings.layout}
                sectionStyle={section.style}
            />
          </div>
        </div>

        {/* Right -- contextual inspector */}
        <aside className="flex shrink-0 flex-col overflow-hidden border-l lg:w-80" style={{ borderColor: "var(--editor-border)", background: "var(--editor-panel)" }}>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {selectedBlock ? (
              <>
                {selectedBlock.type === "customWidget" && (
                  <div className="border-b px-3 py-2" style={{ borderColor: "var(--editor-border)" }}>
                    <button
                      type="button"
                      onClick={saveSelectedWidgetAsGlobal}
                      className="w-full rounded border px-2 py-1.5 text-[11px] font-semibold"
                      style={{ borderColor: "var(--editor-border)", color: "var(--editor-accent)", background: "var(--editor-card)" }}
                    >
                      Save As Global Widget
                    </button>
                  </div>
                )}
                <BlockStylePanel
                  block={selectedBlock}
                  onSettingsUpdate={(settings) => updateBlockSettings(selectedBlock.id, settings)}
                  onStyleUpdate={(style) => updateBlockStyle(selectedBlock.id, style)}
                  onAdvancedUpdate={(adv) => updateBlockAdvanced(selectedBlock.id, adv)}
                  onLayoutUpdate={(layout) => updateBlockLayout(selectedBlock.id, layout)}
                  onBack={() => setSelection({ kind: "section" })}
                />
              </>
            ) : (
              <SectionSettingsPanel section={section} onChange={onChange} />
            )}
          </div>
        </aside>
      </div>

      <DragOverlay>
        {dragType && (
          <div className="rounded-md border px-3 py-2 text-[13px] font-semibold shadow-lg" style={{ borderColor: "var(--editor-accent)", background: "var(--editor-surface)", color: "var(--editor-text)" }}>
            {BLOCK_TYPE_META[dragType].label}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function PaletteWidget({ type, onAdd }: { type: BlockType; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette-${type}` });
  const meta = BLOCK_TYPE_META[type];
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="flex cursor-grab items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left transition-colors active:cursor-grabbing"
      style={{
        borderColor: isDragging ? "var(--editor-accent)" : "var(--editor-border)",
        background: "var(--editor-surface)",
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <div className="min-w-0">
        <p className="text-[12px] font-semibold" style={{ color: "var(--editor-text)" }}>{meta.label}</p>
        <p className="truncate text-[10px]" style={{ color: "var(--editor-text-muted)" }}>{meta.description}</p>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        aria-label={`Add ${meta.label}`}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[var(--editor-accent)]"
        style={{ borderColor: "var(--editor-border)", color: "var(--editor-accent)" }}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
