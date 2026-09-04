"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import type { Block, BlockType, BlockStyle, BlockAdvanced, BlockLayout, BlockSettingsMap, CustomSection, CustomSectionLayout, ResponsiveBlockStyles, ResponsiveBlockLayout, ResponsiveBlockSettings, ResponsiveBlockAdvanced, SectionTheme } from "@/types/homepage";
import { BLOCK_TYPE_META, BLOCK_TYPES, DEFAULT_BLOCK_LAYOUT } from "@/types/homepage";
import { createDefaultBlock } from "@/lib/homepage-defaults";
import { useCatalog } from "@/components/shared/catalog-context";
import {
  EditorDeviceProvider,
  EditorThemeProvider,
  useEditorTheme,
  useEditorDevice,
} from "@/components/homepage-builder/editor-context";
import { DeviceSwitcher } from "@/components/homepage-builder/editor-controls/DeviceSwitcher";
import { BlockStylePanel } from "@/components/homepage-builder/editor-panels/BlockStylePanel";
import { SectionSettingsPanel } from "@/components/homepage-builder/editor-panels/SectionSettingsPanel";
import { ResponsiveCanvasRenderer, type CanvasBlockActions } from "@/components/homepage-builder/responsive-canvas";
import { createResponsiveSectionStyles, resolveSectionStyle } from "@/lib/style-utils";

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
  responsiveStyles?: ResponsiveBlockStyles;
  responsiveLayout?: ResponsiveBlockLayout;
  responsiveSettings?: ResponsiveBlockSettings;
  responsiveAdvanced?: ResponsiveBlockAdvanced;
};

const SECTION_TEMPLATE_STORAGE_KEY = "homepage-builder-custom-section-templates-v1";
const GLOBAL_WIDGET_STORAGE_KEY = "homepage-builder-global-custom-widgets-v1";

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ─── Tree utilities ────────────────────────────────────────────

type TreeDevice = "desktop" | "tablet" | "mobile";

function isContainer(block: Block): block is Block<"container"> {
  return block.type === "container";
}

/**
 * Get the effective children of a container, considering responsive overrides.
 * When theme+device are provided, responsiveSettings[theme][device].blocks takes priority.
 * Otherwise falls back to settings.blocks.
 */
function getEffectiveContainerChildren(block: Block, theme?: SectionTheme, device?: TreeDevice): Block[] | undefined {
  if (!isContainer(block)) return undefined;
  if (theme && device) {
    const responsive = block.responsiveSettings?.[theme]?.[device];
    if (responsive && typeof responsive === "object" && "blocks" in responsive && Array.isArray((responsive as Record<string, unknown>).blocks)) {
      return (responsive as Record<string, unknown>).blocks as Block[];
    }
  }
  return block.settings.blocks;
}

/**
 * Write the effective children back to the correct location on a container.
 * If responsiveSettings[theme][device].blocks existed, updates there.
 * Otherwise updates settings.blocks.
 */
function setEffectiveContainerChildren(block: Block, children: Block[], theme?: SectionTheme, device?: TreeDevice): Block {
  if (!isContainer(block)) return block;
  if (theme && device) {
    const responsive = block.responsiveSettings?.[theme]?.[device];
    if (responsive && typeof responsive === "object" && "blocks" in responsive && Array.isArray((responsive as Record<string, unknown>).blocks)) {
      return {
        ...block,
        responsiveSettings: {
          ...block.responsiveSettings,
          [theme]: {
            ...block.responsiveSettings?.[theme],
            [device]: { ...responsive, blocks: children },
          },
        },
      } as Block;
    }
  }
  return { ...block, settings: { ...block.settings, blocks: children } } as Block<"container">;
}

/** Find a block anywhere in the tree by its ID. Returns the block and its parent blocks array. */
function findBlockInTree(blocks: Block[], id: string, theme?: SectionTheme, device?: TreeDevice): { parent: Block[]; block: Block; index: number } | null {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === id) return { parent: blocks, block: b, index: i };
    const children = getEffectiveContainerChildren(b, theme, device);
    if (children?.length) {
      const found = findBlockInTree(children, id, theme, device);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Resolve sortable IDs such as parentId--childId back to the real block.
 *
 * Sortable IDs follow the pattern: parentId--childId (or grandparentId--parentId--childId
 * for deeply nested blocks). The actual block ID is always the last segment.
 * We search the entire tree for it, which handles cases where the parent itself
 * is nested inside another container.
 */
function findBlockBySortableId(blocks: Block[], sortableId: string, theme?: SectionTheme, device?: TreeDevice): { parent: Block[]; block: Block; index: number } | null {
  if (!sortableId.includes("--")) return findBlockInTree(blocks, sortableId, theme, device);

  // Extract the actual block ID — it's always the last segment after the last --
  const lastSep = sortableId.lastIndexOf("--");
  const blockId = sortableId.substring(lastSep + 2);

  return findBlockInTree(blocks, blockId, theme, device);
}

/** Find a container block that contains the given child ID. */
function findContainerForChild(blocks: Block[], childId: string, theme?: SectionTheme, device?: TreeDevice): Block<"container"> | null {
  for (const block of blocks) {
    const children = getEffectiveContainerChildren(block, theme, device);
    if (children?.some((c) => c.id === childId)) {
      return block as Block<"container">;
    }
    if (children?.length) {
      const found = findContainerForChild(children, childId, theme, device);
      if (found) return found;
    }
  }
  return null;
}

/** Add a block to a container's children array. */
function addBlockToContainer(blocks: Block[], containerId: string, newBlock: Block, theme?: SectionTheme, device?: TreeDevice): Block[] {
  return blocks.map((b) => {
    if (b.id === containerId && isContainer(b)) {
      const existing = getEffectiveContainerChildren(b, theme, device) || [];
      const children = [...existing, newBlock].map((c, i) => ({ ...c, order: i }));
      return setEffectiveContainerChildren(b, children, theme, device);
    }
    const children = getEffectiveContainerChildren(b, theme, device);
    if (children?.length) {
      return setEffectiveContainerChildren(b, addBlockToContainer(children, containerId, newBlock, theme, device), theme, device);
    }
    return b;
  });
}

/** Remove a child from a container. */
function removeBlockFromContainer(blocks: Block[], containerId: string, childId: string, theme?: SectionTheme, device?: TreeDevice): Block[] {
  return blocks.map((b) => {
    if (b.id === containerId && isContainer(b)) {
      const existing = getEffectiveContainerChildren(b, theme, device) || [];
      const children = existing
        .filter((c) => c.id !== childId)
        .map((c: Block, i: number) => ({ ...c, order: i }));
      return setEffectiveContainerChildren(b, children, theme, device);
    }
    const children = getEffectiveContainerChildren(b, theme, device);
    if (children?.length) {
      return setEffectiveContainerChildren(b, removeBlockFromContainer(children, containerId, childId, theme, device), theme, device);
    }
    return b;
  });
}

/** Reorder a child within a container. */
function moveBlockInContainer(blocks: Block[], containerId: string, childId: string, direction: "up" | "down", theme?: SectionTheme, device?: TreeDevice): Block[] {
  return blocks.map((b) => {
    if (b.id === containerId && isContainer(b)) {
      const existing = getEffectiveContainerChildren(b, theme, device) || [];
      const sorted = [...existing].sort((a, c) => a.order - c.order);
      const idx = sorted.findIndex((c) => c.id === childId);
      if (idx < 0) return b;
      if (direction === "up" && idx === 0) return b;
      if (direction === "down" && idx === sorted.length - 1) return b;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const reordered = arrayMove(sorted, idx, targetIdx).map((c, i) => ({ ...c, order: i }));
      return setEffectiveContainerChildren(b, reordered, theme, device);
    }
    const children = getEffectiveContainerChildren(b, theme, device);
    if (children?.length) {
      return setEffectiveContainerChildren(b, moveBlockInContainer(children, containerId, childId, direction, theme, device), theme, device);
    }
    return b;
  });
}

/** Update a nested block's settings/style/layout/advanced anywhere in the tree. */
function updateNestedBlock(blocks: Block[], blockId: string, updater: (prev: Block) => Block, theme?: SectionTheme, device?: TreeDevice): Block[] {
  return blocks.map((b) => {
    if (b.id === blockId) return updater(b);
    const children = getEffectiveContainerChildren(b, theme, device);
    if (children?.length) {
      const updated = updateNestedBlock(children, blockId, updater, theme, device);
      if (updated !== children) {
        return setEffectiveContainerChildren(b, updated, theme, device);
      }
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
  const { resolvedTheme } = useEditorTheme();
  const { device } = useEditorDevice();
  const currentTheme = resolvedTheme as SectionTheme;

  useEffect(() => {
    if (section.responsiveStyles) return;
    onChange({ ...section, responsiveStyles: createResponsiveSectionStyles(section.style) });
  }, [onChange, section]);
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

  const latestBlocksRef = useRef(section.blocks);
  useEffect(() => { latestBlocksRef.current = section.blocks; }, [section.blocks]);

  const blocks = useMemo(() => [...section.blocks].sort((a, b) => a.order - b.order), [section.blocks]);

  /** Find the currently selected block anywhere in the tree. */
  const selectedBlock = useMemo(() => {
    if (selection.kind !== "block") return undefined;
    const found = findBlockInTree(section.blocks, selection.id, currentTheme, device);
    return found?.block;
  }, [section.blocks, selection, currentTheme, device]);

  const persistSectionTemplates = useCallback((next: SectionTemplate[]) => {
    setSectionTemplates(next);
    try { localStorage.setItem(SECTION_TEMPLATE_STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const persistGlobalWidgetTemplates = useCallback((next: GlobalWidgetTemplate[]) => {
    setGlobalWidgetTemplates(next);
    try { localStorage.setItem(GLOBAL_WIDGET_STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const updateBlocks = useCallback((next: Block[] | ((prev: Block[]) => Block[])) => {
    const resolved = typeof next === "function" ? (next as (prev: Block[]) => Block[])(latestBlocksRef.current) : next;
    latestBlocksRef.current = resolved;
    onChange({ ...section, blocks: resolved });
  }, [section, onChange]);

  const addBlock = useCallback((type: BlockType) => {
    const block = createDefaultBlock(type, latestBlocksRef.current.length);
    updateBlocks((prev) => [...prev, block]);
    setSelection({ kind: "block", id: block.id });
  }, [updateBlocks]);

  const addEmptySection = useCallback(() => {
    const container = createDefaultBlock("container", latestBlocksRef.current.length);
    if (container.type !== "container") return;

    container.settings = {
      ...container.settings,
      name: `Section ${latestBlocksRef.current.length + 1}`,
      blocks: [],
    };
    updateBlocks((prev) => [...prev, container]);
    setSelection({ kind: "block", id: container.id });
  }, [updateBlocks]);

  const addBlockToContainerCb = useCallback((containerId: string, type: BlockType) => {
    try {
      if (!containerId || !type) {
        console.warn("addBlockToContainerCb: Missing containerId or type");
        return;
      }
      const found = findBlockInTree(latestBlocksRef.current, containerId, currentTheme, device);
      if (!found || !isContainer(found.block)) {
        console.warn(`addBlockToContainerCb: Container ${containerId} not found or not a container`);
        return;
      }
      const container = found.block;
      const effectiveChildren = getEffectiveContainerChildren(container, currentTheme, device) || [];
      const childCount = effectiveChildren.length;
      const block = createDefaultBlock(type, childCount);
      updateBlocks((prev) => addBlockToContainer(prev, containerId, block, currentTheme, device));
    } catch (err) {
      console.error("Error adding block to container:", err);
    }
  }, [updateBlocks, currentTheme, device]);

  const addGlobalWidgetTemplate = useCallback((template: GlobalWidgetTemplate) => {
    const block = createDefaultBlock("customWidget", latestBlocksRef.current.length);
    if (block.type === "customWidget") block.settings = cloneJson(template.settings);
    block.style = template.style ? cloneJson(template.style) : undefined;
    block.layout = template.layout ? cloneJson(template.layout) : block.layout;
    block.advanced = template.advanced ? cloneJson(template.advanced) : undefined;
    block.responsiveStyles = template.responsiveStyles ? cloneJson(template.responsiveStyles) : undefined;
    block.responsiveLayout = template.responsiveLayout ? cloneJson(template.responsiveLayout) : undefined;
    block.responsiveSettings = template.responsiveSettings ? cloneJson(template.responsiveSettings) : undefined;
    block.responsiveAdvanced = template.responsiveAdvanced ? cloneJson(template.responsiveAdvanced) : undefined;
    updateBlocks((prev) => [...prev, block]);
    setSelection({ kind: "block", id: block.id });
  }, [updateBlocks]);

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
      responsiveStyles: selectedBlock.responsiveStyles ? cloneJson(selectedBlock.responsiveStyles) : undefined,
      responsiveLayout: selectedBlock.responsiveLayout ? cloneJson(selectedBlock.responsiveLayout) : undefined,
      responsiveSettings: selectedBlock.responsiveSettings ? cloneJson(selectedBlock.responsiveSettings) : undefined,
      responsiveAdvanced: selectedBlock.responsiveAdvanced ? cloneJson(selectedBlock.responsiveAdvanced) : undefined,
    };
    persistGlobalWidgetTemplates([template, ...globalWidgetTemplates]);
  }, [selectedBlock, persistGlobalWidgetTemplates, globalWidgetTemplates]);

  const deleteGlobalWidgetTemplate = useCallback((id: string) => {
    persistGlobalWidgetTemplates(globalWidgetTemplates.filter((t) => t.id !== id));
  }, [persistGlobalWidgetTemplates, globalWidgetTemplates]);

  const removeBlock = useCallback((id: string) => {
    try {
      if (!id) {
        console.warn("removeBlock: Missing block id");
        return;
      }
      const container = findContainerForChild(latestBlocksRef.current, id, currentTheme, device);
      if (container) {
        updateBlocks((prev) => removeBlockFromContainer(prev, container.id, id, currentTheme, device));
      } else {
        updateBlocks((prev) => prev.filter((b) => b.id !== id));
      }
      if (selection.kind === "block" && selection.id === id) setSelection({ kind: "section" });
    } catch (err) {
      console.error("Error removing block:", err);
    }
  }, [updateBlocks, selection, currentTheme, device]);

  const duplicateBlock = useCallback((id: string) => {
    try {
      if (!id) {
        console.warn("duplicateBlock: Missing block id");
        return;
      }
      const found = findBlockInTree(latestBlocksRef.current, id, currentTheme, device);
      if (!found) {
        console.warn(`duplicateBlock: Block ${id} not found`);
        return;
      }
      const source = found.block;
      const copy: Block = {
        ...source,
        id: `blk_${Math.random().toString(36).slice(2, 9)}`,
        order: (source.order ?? 0) + 1,
        settings: JSON.parse(JSON.stringify(source.settings)),
        style: source.style ? JSON.parse(JSON.stringify(source.style)) : undefined,
        layout: source.layout ? { ...source.layout } : undefined,
        advanced: source.advanced ? { ...source.advanced } : undefined,
        responsiveStyles: source.responsiveStyles ? JSON.parse(JSON.stringify(source.responsiveStyles)) : undefined,
        responsiveLayout: source.responsiveLayout ? JSON.parse(JSON.stringify(source.responsiveLayout)) : undefined,
        responsiveSettings: source.responsiveSettings ? JSON.parse(JSON.stringify(source.responsiveSettings)) : undefined,
        responsiveAdvanced: source.responsiveAdvanced ? JSON.parse(JSON.stringify(source.responsiveAdvanced)) : undefined,
      };

      const container = findContainerForChild(latestBlocksRef.current, id, currentTheme, device);
      if (container) {
        updateBlocks((prev) => {
          const existing = getEffectiveContainerChildren(container, currentTheme, device) || [];
          const children = [...existing, copy].map((c, i) => ({ ...c, order: i }));
          return updateNestedBlock(prev, container.id, (b) => setEffectiveContainerChildren(b, children, currentTheme, device), currentTheme, device);
        });
      } else {
        updateBlocks((prev) => {
          const sorted = [...prev].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const idx = sorted.findIndex((b) => b.id === id);
          if (idx < 0) return prev;
          const next = [...sorted];
          next.splice(idx + 1, 0, copy);
          return next.map((b, i) => ({ ...b, order: i }));
        });
      }
      setSelection({ kind: "block", id: copy.id });
    } catch (err) {
      console.error("Error duplicating block:", err);
    }
  }, [updateBlocks, currentTheme, device]);

  const moveBlock = useCallback((id: string, direction: "up" | "down") => {
    try {
      if (!id || !["up", "down"].includes(direction)) {
        console.warn("moveBlock: Invalid id or direction");
        return;
      }
      const container = findContainerForChild(latestBlocksRef.current, id, currentTheme, device);
      if (container) {
        updateBlocks((prev) => moveBlockInContainer(prev, container.id, id, direction, currentTheme, device));
      } else {
        updateBlocks((prev) => {
          const sorted = [...prev].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const idx = sorted.findIndex((b) => b.id === id);
          if (idx < 0) return prev;
          if (direction === "up" && idx === 0) return prev;
          if (direction === "down" && idx === sorted.length - 1) return prev;
          const targetIdx = direction === "up" ? idx - 1 : idx + 1;
          return arrayMove(sorted, idx, targetIdx).map((b, i) => ({ ...b, order: i }));
        });
      }
    } catch (err) {
      console.error("Error moving block:", err);
    }
  }, [updateBlocks, currentTheme, device]);

  const updateBlockSettings = useCallback((id: string, settings: BlockSettingsMap[BlockType]) => {
    try {
      if (!id || !settings) {
        console.warn("updateBlockSettings: Missing id or settings");
        return;
      }
      updateBlocks((prevBlocks) => updateNestedBlock(prevBlocks, id, (b) => ({ ...b, settings }), currentTheme, device));
    } catch (err) {
      console.error("Error updating block settings:", err);
    }
  }, [updateBlocks, currentTheme, device]);

  const updateBlockStyle = useCallback((id: string, update: { responsiveStyles?: ResponsiveBlockStyles }) => {
    try {
      if (!id || !update) {
        console.warn("updateBlockStyle: Missing id or update");
        return;
      }
      updateBlocks((prevBlocks) => updateNestedBlock(prevBlocks, id, (b) => {
        if (!update.responsiveStyles) return b;
        const prev = b.responsiveStyles ?? {};
      const next: ResponsiveBlockStyles = {};
      for (const th of Object.keys(update.responsiveStyles) as Array<keyof ResponsiveBlockStyles>) {
        const themeUpdate = update.responsiveStyles[th];
        if (!themeUpdate) continue;
        const prevTheme = prev[th] ?? {};
        const merged: Record<string, import("@/types/homepage").BlockBreakpointStyle> = { ...prevTheme };
        for (const dev of Object.keys(themeUpdate) as Array<keyof typeof themeUpdate>) {
          const prevBP = prevTheme[dev];
          const newBP = themeUpdate[dev];
          if (!prevBP && !newBP) continue;
          if (!prevBP || !newBP) {
            merged[dev] = (newBP ?? prevBP) as import("@/types/homepage").BlockBreakpointStyle;
            continue;
          }
          const deepMerged: Record<string, unknown> = {};
          const allCatKeys = new Set([...Object.keys(prevBP), ...Object.keys(newBP)]);
          for (const cat of allCatKeys) {
            const prevVal = (prevBP as Record<string, unknown>)[cat];
            const newVal = (newBP as Record<string, unknown>)[cat];
            if (prevVal && newVal && typeof prevVal === "object" && typeof newVal === "object" && !Array.isArray(prevVal) && !Array.isArray(newVal)) {
              deepMerged[cat] = { ...(prevVal as Record<string, unknown>), ...(newVal as Record<string, unknown>) };
            } else if (newVal !== undefined) {
              deepMerged[cat] = newVal;
            } else {
              deepMerged[cat] = prevVal;
            }
          }
          merged[dev] = deepMerged as import("@/types/homepage").BlockBreakpointStyle;
        }
        next[th] = merged as ResponsiveBlockStyles[typeof th];
      }
      return { ...b, responsiveStyles: { ...prev, ...next } };
    }, currentTheme, device));
    } catch (err) {
      console.error("Error updating block style:", err);
    }
  }, [updateBlocks, currentTheme, device]);

  const updateBlockAdvanced = useCallback((id: string, advanced: BlockAdvanced) => {
    updateBlocks((prevBlocks) => updateNestedBlock(prevBlocks, id, (b) => ({ ...b, advanced }), currentTheme, device));
  }, [updateBlocks, currentTheme, device]);

  const updateBlockLayout = useCallback((id: string, layout: BlockLayout) => {
    updateBlocks((prevBlocks) => updateNestedBlock(prevBlocks, id, (b) => ({ ...b, layout }), currentTheme, device));
  }, [updateBlocks, currentTheme, device]);

  const updateBlockLayoutResponsive = useCallback((id: string, update: { responsiveLayout?: ResponsiveBlockLayout }) => {
    updateBlocks((prevBlocks) => updateNestedBlock(prevBlocks, id, (b) => {
      if (!update.responsiveLayout) return b;
      const prev = b.responsiveLayout ?? {};
      const next: ResponsiveBlockLayout = {};
      for (const th of Object.keys(update.responsiveLayout) as Array<keyof ResponsiveBlockLayout>) {
        const themeUpdate = update.responsiveLayout[th];
        if (!themeUpdate) continue;
        const prevTheme = prev[th] ?? {};
        const merged: Record<string, BlockLayout> = { ...prevTheme };
        for (const dev of Object.keys(themeUpdate) as Array<keyof typeof themeUpdate>) {
          merged[dev] = { ...DEFAULT_BLOCK_LAYOUT, ...(prevTheme[dev] ?? {}), ...(themeUpdate[dev] ?? {}) };
        }
        next[th] = merged as ResponsiveBlockLayout[typeof th];
      }
      return { ...b, responsiveLayout: { ...prev, ...next } };
    }, currentTheme, device));
  }, [updateBlocks, currentTheme, device]);

  const updateBlockSettingsResponsive = useCallback((id: string, update: { responsiveSettings?: ResponsiveBlockSettings }) => {
    updateBlocks((prevBlocks) => updateNestedBlock(prevBlocks, id, (b) => {
      if (!update.responsiveSettings) return b;
      const prev = b.responsiveSettings ?? {};
      const next: ResponsiveBlockSettings = {};
      for (const th of Object.keys(update.responsiveSettings) as Array<keyof ResponsiveBlockSettings>) {
        const themeUpdate = update.responsiveSettings[th];
        if (!themeUpdate) continue;
        const prevTheme = prev[th] ?? {};
        const merged: Record<string, Record<string, unknown>> = { ...prevTheme };
        for (const dev of Object.keys(themeUpdate) as Array<keyof typeof themeUpdate>) {
          merged[dev] = { ...(prevTheme[dev] ?? {}), ...themeUpdate[dev] };
        }
        next[th] = merged as ResponsiveBlockSettings[typeof th];
      }
      return { ...b, responsiveSettings: { ...prev, ...next } };
    }, currentTheme, device));
  }, [updateBlocks, currentTheme, device]);

  const updateBlockAdvancedResponsive = useCallback((id: string, update: { responsiveAdvanced?: ResponsiveBlockAdvanced }) => {
    updateBlocks((prevBlocks) => updateNestedBlock(prevBlocks, id, (b) => {
      if (!update.responsiveAdvanced) return b;
      const prev = b.responsiveAdvanced ?? {};
      const next: ResponsiveBlockAdvanced = {};
      for (const th of Object.keys(update.responsiveAdvanced) as Array<keyof ResponsiveBlockAdvanced>) {
        const themeUpdate = update.responsiveAdvanced[th];
        if (!themeUpdate) continue;
        const prevTheme = prev[th] ?? {};
        const merged: Record<string, BlockAdvanced> = { ...prevTheme };
        for (const dev of Object.keys(themeUpdate) as Array<keyof typeof themeUpdate>) {
          merged[dev] = { ...(prevTheme[dev] ?? {}), ...themeUpdate[dev] };
        }
        next[th] = merged as ResponsiveBlockAdvanced[typeof th];
      }
      return { ...b, responsiveAdvanced: { ...prev, ...next } };
    }, currentTheme, device));
  }, [updateBlocks, currentTheme, device]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    try {
      const id = String(event.active.id);
      if (id?.startsWith("palette-")) {
        const type = id.replace("palette-", "") as BlockType;
        if (BLOCK_TYPES.includes(type)) {
          setDragType(type);
        }
      }
    } catch (err) {
      console.error('Drag start error:', err);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDragType(null);
    const th = currentTheme;
    const dev = device;
    
    try {
      if (!over || !active) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      if (!activeId || !overId) return;

      // Palette → canvas drop
      if (activeId.startsWith("palette-")) {
        const type = activeId.replace("palette-", "") as BlockType;
        if (!BLOCK_TYPES.includes(type)) return;

        // Check if dropping into a container
        if (overId.startsWith("drop-")) {
          const containerId = overId.replace("drop-", "");
          if (containerId && latestBlocksRef.current.some(b => b.id === containerId || findBlockInTree(latestBlocksRef.current, containerId, th, dev))) {
            addBlockToContainerCb(containerId, type);
          }
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
        const found = findBlockBySortableId(latestBlocksRef.current, activeId, th, dev);
        if (found) {
          const blockToAdd = cloneJson(found.block);
          const actualBlockId = found.block.id;
          updateBlocks((prev) => {
            try {
              const container = findContainerForChild(prev, actualBlockId, th, dev);
              let nextBlocks: Block[];
              if (container) {
                nextBlocks = removeBlockFromContainer(prev, container.id, actualBlockId, th, dev);
              } else {
                nextBlocks = prev.filter((b) => b.id !== actualBlockId);
              }
              return addBlockToContainer(nextBlocks, containerId, blockToAdd, th, dev);
            } catch (err) {
              console.error('Error moving block to container:', err);
              return prev;
            }
          });
        }
        return;
      }

      // Check if both IDs are nested (contain "--") — reorder within same container
      const activeNested = activeId.includes("--");
      const overNested = overId.includes("--");

      if (activeNested && overNested) {
        // Find the actual blocks using their real IDs (last segment after --)
        const activeFound = findBlockBySortableId(latestBlocksRef.current, activeId, th, dev);
        const overFound = findBlockBySortableId(latestBlocksRef.current, overId, th, dev);

        if (activeFound && overFound) {
          const activeChildId = activeFound.block.id;
          const overChildId = overFound.block.id;

          // Find the parent container for the active block
          const activeParentContainer = findContainerForChild(latestBlocksRef.current, activeChildId, th, dev);
          // Find the parent container for the over block
          const overParentContainer = findContainerForChild(latestBlocksRef.current, overChildId, th, dev);

          // Only reorder if both blocks are in the same container
          if (activeParentContainer && overParentContainer && activeParentContainer.id === overParentContainer.id) {
            updateBlocks((prev) => {
              try {
                const found = findBlockInTree(prev, activeParentContainer.id, th, dev);
                if (found && isContainer(found.block)) {
                  const existing = getEffectiveContainerChildren(found.block, th, dev) || [];
                  const sorted = [...existing].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                  const oldIdx = sorted.findIndex((c) => c.id === activeChildId);
                  const newIdx = sorted.findIndex((c) => c.id === overChildId);
                  if (oldIdx >= 0 && newIdx >= 0 && oldIdx !== newIdx) {
                    const reordered = arrayMove(sorted, oldIdx, newIdx).map((c, i) => ({ ...c, order: i }));
                    return updateNestedBlock(prev, activeParentContainer.id, (b) => setEffectiveContainerChildren(b, reordered, th, dev), th, dev);
                  }
                }
                return prev;
              } catch (err) {
                console.error('Error reordering nested blocks:', err);
                return prev;
              }
            });
          }
        }
        return;
      }

      // Cross-level: nested block → top-level block (move out of container to root)
      if (activeNested && !overNested) {
        const activeFound = findBlockBySortableId(latestBlocksRef.current, activeId, th, dev);
        if (activeFound) {
          const blockToMove = cloneJson(activeFound.block);
          updateBlocks((prev) => {
            try {
              const container = findContainerForChild(prev, activeFound.block.id, th, dev);
              if (!container) return prev;
              const removed = removeBlockFromContainer(prev, container.id, activeFound.block.id, th, dev);
              // Insert near the over block
              const overIdx = removed.findIndex((b) => b.id === overId);
              if (overIdx < 0) {
                return [...removed, blockToMove].map((b, i) => ({ ...b, order: i }));
              }
              const next = [...removed];
              next.splice(overIdx, 0, blockToMove);
              return next.map((b, i) => ({ ...b, order: i }));
            } catch (err) {
              console.error('Error moving nested block to root:', err);
              return prev;
            }
          });
        }
        return;
      }

      // Cross-level: top-level block → nested block (move into that block's parent container)
      if (!activeNested && overNested) {
        const overFound = findBlockBySortableId(latestBlocksRef.current, overId, th, dev);
        if (overFound) {
          const container = findContainerForChild(latestBlocksRef.current, overFound.block.id, th, dev);
          if (container) {
            const blockToAdd = latestBlocksRef.current.find((b) => b.id === activeId);
            if (blockToAdd) {
              updateBlocks((prev) => {
                try {
                  const removed = prev.filter((b) => b.id !== activeId);
                  return addBlockToContainer(removed, container.id, cloneJson(blockToAdd), th, dev);
                } catch (err) {
                  console.error('Error moving root block into container:', err);
                  return prev;
                }
              });
            }
          }
        }
        return;
      }

      // Top-level reorder
      updateBlocks((prev) => {
        try {
          const sorted = [...prev].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const oldIndex = sorted.findIndex((b) => b.id === activeId);
          const newIndex = sorted.findIndex((b) => b.id === overId);
          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;
          return arrayMove(sorted, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }));
        } catch (err) {
          console.error('Error reordering top-level blocks:', err);
          return prev;
        }
      });
    } catch (err) {
      console.error('Drag end error:', err);
    }
  }, [addBlock, addBlockToContainerCb, updateBlocks, currentTheme, device]);

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
      updateBlocks((prev) => removeBlockFromContainer(prev, containerId, childId, currentTheme, device));
    },
    onMoveInContainer: (containerId, childId, direction) => {
      updateBlocks((prev) => moveBlockInContainer(prev, containerId, childId, direction, currentTheme, device));
    },
  }), [removeBlock, duplicateBlock, moveBlock, addBlockToContainerCb, updateBlocks, currentTheme, device]);

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
              sectionStyle={resolveSectionStyle(section.style, section.responsiveStyles, resolvedTheme, device)}
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
                  onStyleUpdate={(update) => updateBlockStyle(selectedBlock.id, update)}
                  onAdvancedUpdate={(adv) => updateBlockAdvanced(selectedBlock.id, adv)}
                  onLayoutUpdate={(layout) => updateBlockLayout(selectedBlock.id, layout)}
                  onResponsiveLayoutUpdate={(update) => updateBlockLayoutResponsive(selectedBlock.id, update)}
                  onResponsiveSettingsUpdate={(update) => updateBlockSettingsResponsive(selectedBlock.id, update)}
                  onResponsiveAdvancedUpdate={(update) => updateBlockAdvancedResponsive(selectedBlock.id, update)}
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
