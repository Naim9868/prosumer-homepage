"use client";

import { useMemo } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Settings2, Plus } from "lucide-react";
import type { Block, BlockType, EditorDevice, CustomSectionLayout, SectionStyle } from "@/types/homepage";
import type { CatalogData } from "@/types/catalog";
import { BLOCK_REGISTRY } from "@/registry/block-registry";
import { BLOCK_TYPE_META } from "@/types/homepage";
import { useEditorDevice } from "@/components/homepage-builder/editor-context";
import { blockStyleToInline, generateSectionCSS, parseCustomAttributes } from "@/lib/style-utils";
import { DEFAULT_CUSTOM_LAYOUT, DEFAULT_BLOCK_LAYOUT } from "@/types/homepage";

const DEVICE_WIDTHS: Record<EditorDevice, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const DEVICE_LABELS: Record<EditorDevice, string> = {
  desktop: "Desktop",
  tablet: "Tablet (768px)",
  mobile: "Mobile (375px)",
};

function BlockRenderer({ block, catalog }: { block: Block; catalog?: CatalogData }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = BLOCK_REGISTRY[block.type] as any;
  if (!Component) return null;
  return <Component block={block} catalog={catalog} />;
}

export interface CanvasBlockActions {
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onAddToContainer?: (containerId: string, type: BlockType) => void;
  onRemoveFromContainer?: (containerId: string, childId: string) => void;
  onMoveInContainer?: (containerId: string, childId: string, direction: "up" | "down") => void;
}

function buildPreviewGridStyle(layout: CustomSectionLayout): React.CSSProperties {
  const ratios = layout.columnRatios;
  const hasRatios = Array.isArray(ratios) && ratios.length === layout.columns;
  const template = hasRatios ? ratios.map((r) => `${r}fr`).join(" ") : `repeat(${layout.columns}, 1fr)`;
  return {
    display: "grid",
    gridTemplateColumns: template,
    gap: layout.gap,
    alignItems: layout.alignItems,
    justifyItems: layout.justifyContent,
  };
}

function buildPreviewFlexStyle(layout: CustomSectionLayout): React.CSSProperties {
  const dir = layout.flexDirection === "row-wrap" || layout.flexDirection === "column-wrap"
    ? layout.flexDirection === "row-wrap" ? "row" : "column"
    : layout.flexDirection;
  const wrap = layout.flexDirection === "row-wrap" || layout.flexDirection === "column-wrap" ? "wrap" : "nowrap";
  return {
    display: "flex",
    flexDirection: dir,
    flexWrap: wrap,
    gap: layout.gap,
    justifyContent: layout.justifyContent,
    alignItems: layout.alignItems,
  };
}

function buildPreviewStackStyle(layout: CustomSectionLayout): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    gap: layout.gap,
  };
}

function resolveLayoutForDevice(layout: CustomSectionLayout, device: EditorDevice): CustomSectionLayout {
  if (device === "desktop") return layout;
  const override = layout.responsive?.[device];
  if (!override) return layout;
  return { ...layout, ...override };
}

function buildPreviewBlockStyle(block: Block, layoutMode: string, columns: number, gap?: number): React.CSSProperties {
  const bl = block.layout ?? DEFAULT_BLOCK_LAYOUT;
  const style: React.CSSProperties = {};

  if (layoutMode === "grid") {
    style.gridColumn = bl.columnSpan > 1 ? `span ${bl.columnSpan}` : undefined;
    style.gridRow = bl.rowSpan > 1 ? `span ${bl.rowSpan}` : undefined;
  } else if (layoutMode === "flex") {
    style.order = bl.order || undefined;
    if (bl.columnSpan > 1) {
      style.flex = `0 0 calc((100% * ${bl.columnSpan} / ${columns}) - ${(bl.columnSpan - 1) * (gap ?? 24)}px)`;
    }
  }

  if (bl.alignSelf !== "auto") {
    style.alignSelf = bl.alignSelf as React.CSSProperties["alignSelf"];
  }

  return style;
}

function buildContainerLayoutStyle(layout: CustomSectionLayout): React.CSSProperties {
  switch (layout.mode) {
    case "grid":
      return buildPreviewGridStyle(layout);
    case "flex":
      return buildPreviewFlexStyle(layout);
    default:
      return buildPreviewStackStyle(layout);
  }
}

const CONTAINER_PALETTE_TYPES: BlockType[] = ["customWidget", "container", "heading", "paragraph", "image", "button", "spacer", "divider", "icon"];

function NestedContainerContent({
  block,
  catalog,
  selectedBlockId,
  actions,
  parentPath,
}: {
  block: Block<"container">;
  catalog?: CatalogData;
  selectedBlockId?: string;
  actions: CanvasBlockActions;
  parentPath: string[];
}) {
  const { device } = useEditorDevice();
  const baseLayout = block.settings.layout ?? DEFAULT_CUSTOM_LAYOUT;
  const layout = resolveLayoutForDevice(baseLayout, device);
  const children = [...(block.settings.blocks || [])].sort((a, b) => a.order - b.order);
  const childIds = useMemo(() => children.map((c) => `${block.id}--${c.id}`), [children, block.id]);
  const containerLayoutStyle = buildContainerLayoutStyle(layout);

  const { setNodeRef, isOver } = useDroppable({ id: `drop-${block.id}` });

  return (
    <div
      ref={setNodeRef}
      className="relative rounded-md border border-dashed p-2 pt-8 transition-colors"
      style={{
        borderColor: isOver ? "var(--editor-accent)" : "var(--editor-border)",
        background: isOver ? "var(--editor-accent-light, rgba(59,130,246,0.05))" : "transparent",
        minHeight: children.length === 0 ? 80 : undefined,
      }}
    >
      {children.length === 0 && (
        <div className="flex flex-col items-center justify-center py-4 text-center" style={{ color: "var(--editor-text-muted)" }}>
          <Plus className="mb-1 h-4 w-4 opacity-40" />
          <p className="text-[11px] font-medium">Drop widgets here or use + below</p>
        </div>
      )}

      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        <div style={containerLayoutStyle}>
          {children.map((child) => (
            <SortableBlock
              key={child.id}
              block={child}
              catalog={catalog}
              isSelected={selectedBlockId === child.id}
              actions={actions}
              blockStyle={buildPreviewBlockStyle(child, layout.mode, layout.columns, layout.gap)}
              userStyles={{}}
              parentPath={[...parentPath, block.id]}
              selectedBlockId={selectedBlockId}
            />
          ))}
        </div>
      </SortableContext>

      {/* Mini palette for adding children */}
      <div className="mt-2 flex flex-wrap gap-1 border-t pt-2" style={{ borderColor: "var(--editor-border)" }}>
        {CONTAINER_PALETTE_TYPES.map((type) => {
          const meta = BLOCK_TYPE_META[type];
          return (
            <button
              key={type}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                actions.onAddToContainer?.(block.id, type);
              }}
              className="rounded border px-1.5 py-0.5 text-[9px] font-semibold transition-colors hover:opacity-80"
              style={{ borderColor: "var(--editor-border)", color: "var(--editor-accent)", background: "var(--editor-surface)" }}
              title={`Add ${meta.label}`}
            >
              + {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SortableBlock({
  block,
  catalog,
  isSelected,
  actions,
  blockStyle,
  userStyles,
  parentPath = [],
  selectedBlockId,
}: {
  block: Block;
  catalog?: CatalogData;
  isSelected: boolean;
  actions: CanvasBlockActions;
  blockStyle: React.CSSProperties;
  userStyles: React.CSSProperties;
  parentPath?: string[];
  selectedBlockId?: string;
}) {
  const sortId = parentPath.length > 0 ? `${parentPath[parentPath.length - 1]}--${block.id}` : block.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortId });

  const customAttrs = parseCustomAttributes(block.advanced?.customAttributes);
  const blockClasses = ["group relative", isDragging ? "z-50" : "", block.advanced?.cssClasses || ""]
    .filter(Boolean)
    .join(" ");
  const isContainer = block.type === "container";

  const wrapperStyle: React.CSSProperties = {
    ...(isContainer ? { position: "relative", overflow: "visible" } : {}),
    ...blockStyle,
    ...userStyles,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      data-block-id={block.id}
      data-block-type={block.type}
      id={block.advanced?.cssId || undefined}
      className={blockClasses}
      {...customAttrs}
    >
      {/* Selection ring */}
      <div
        className="pointer-events-none absolute -inset-1 rounded transition-all"
        style={{
          boxShadow: isSelected
            ? isContainer
              ? "0 0 0 2px #3b82f6"
              : "0 0 0 2px var(--editor-accent)"
            : "none",
          borderStyle: isContainer ? "dashed" : "solid",
          opacity: isSelected ? 1 : 0,
        }}
      />

      {/* Elementor-like hover toolbar */}
      <div
        className="absolute -top-9 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-md border px-1 py-0.5 shadow-lg transition-all"
        style={{
          borderColor: "var(--editor-border)",
          background: "var(--editor-panel)",
          opacity: isSelected ? 1 : 0,
          pointerEvents: isSelected ? "auto" : "none",
        }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded transition-colors hover:bg-[var(--editor-accent-light)] active:cursor-grabbing"
          style={{ color: "var(--editor-text-muted)" }}
          title="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <div className="mx-0.5 h-4 w-px" style={{ background: "var(--editor-border)" }} />

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); actions.onMoveUp(block.id); }}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-[var(--editor-accent-light)]"
          style={{ color: "var(--editor-text-muted)" }}
          title="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); actions.onMoveDown(block.id); }}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-[var(--editor-accent-light)]"
          style={{ color: "var(--editor-text-muted)" }}
          title="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        <div className="mx-0.5 h-4 w-px" style={{ background: "var(--editor-border)" }} />

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); actions.onDuplicate(block.id); }}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-[var(--editor-accent-light)]"
          style={{ color: "var(--editor-text-muted)" }}
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); actions.onSelect(block.id); }}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-[var(--editor-accent-light)]"
          style={{ color: "var(--editor-accent)" }}
          title="Edit settings"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>

        <div className="mx-0.5 h-4 w-px" style={{ background: "var(--editor-border)" }} />

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); actions.onDelete(block.id); }}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
          style={{ color: "#ef4444" }}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Block type label */}
      {(isSelected || isDragging) && (
        <div className="pointer-events-none absolute -top-5 left-0 z-20">
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
            style={{ background: isContainer ? "#3b82f6" : "var(--editor-accent)", color: "white" }}>
            {block.type}
            {(block.layout?.columnSpan ?? 1) > 1 && ` · ${block.layout!.columnSpan}col`}
          </span>
        </div>
      )}

      {/* Clickable block content */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          actions.onSelect(block.id);
        }}
        className="cursor-pointer"
      >
        {isContainer ? (
          <NestedContainerContent
            block={block as Block<"container">}
            catalog={catalog}
            selectedBlockId={selectedBlockId}
            actions={actions}
            parentPath={parentPath}
          />
        ) : (
          <BlockRenderer block={block} catalog={catalog} />
        )}
      </div>
    </div>
  );
}

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

function isContainerBlock(block: Block): block is Block<"container"> {
  return block.type === "container";
}

/** Recursively collect all block IDs including nested container children. */
function collectAllBlockIds(blocks: Block[], parentPath: string[] = []): string[] {
  const ids: string[] = [];
  for (const block of blocks) {
    const sortId = parentPath.length > 0 ? `${parentPath[parentPath.length - 1]}--${block.id}` : block.id;
    ids.push(sortId);
    if (isContainerBlock(block)) {
      const children = block.settings.blocks;
      if (children?.length) {
        ids.push(...collectAllBlockIds(children, [...parentPath, block.id]));
      }
    }
  }
  return ids;
}

export function ResponsiveCanvasRenderer({
  blocks,
  catalog,
  selectedBlockId,
  actions,
  layout,
  sectionStyle,
}: {
  blocks: Block[];
  catalog?: CatalogData;
  selectedBlockId?: string;
  actions: CanvasBlockActions;
  layout?: CustomSectionLayout;
  sectionStyle?: SectionStyle;
}) {
  const { device } = useEditorDevice();
  const baseLayout = layout ?? DEFAULT_CUSTOM_LAYOUT;
  const effectiveLayout = useMemo(() => resolveLayoutForDevice(baseLayout, device), [baseLayout, device]);

  const css = useMemo(() => {
    const allBlocks = flattenBlockTree(blocks);
    return generateSectionCSS(
      allBlocks.map((b) => ({ id: b.id, style: b.style, advanced: b.advanced }))
    );
  }, [blocks]);

  const visibleBlocks = useMemo(() => {
    return blocks.filter((block) => {
      const vis = block.advanced?.visibility;
      if (!vis) return true;
      if (device === "desktop" && vis.desktop === false) return false;
      if (device === "tablet" && vis.tablet === false) return false;
      if (device === "mobile" && vis.mobile === false) return false;
      return true;
    });
  }, [blocks, device]);

  const containerStyle: React.CSSProperties = (() => {
    switch (effectiveLayout.mode) {
      case "grid":
        return buildPreviewGridStyle(effectiveLayout);
      case "flex":
        return buildPreviewFlexStyle(effectiveLayout);
      default:
        return buildPreviewStackStyle(effectiveLayout);
    }
  })();

  const blockIds = useMemo(() => collectAllBlockIds(visibleBlocks), [visibleBlocks]);
  const deviceWidth = DEVICE_WIDTHS[device];

  return (
    <div className="relative">
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: css }} />
      <div
        className="mx-auto transition-all duration-300"
        style={{ maxWidth: deviceWidth }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ borderColor: "var(--editor-accent)", color: "var(--editor-accent)", background: "var(--editor-accent-light)" }}>
            {DEVICE_LABELS[device]}
          </span>
          <span className="text-[10px] font-mono" style={{ color: "var(--editor-text-muted)" }}>
            {device === "desktop" ? "100%" : device === "tablet" ? "768px" : "375px"} wide
          </span>
        </div>

        <div className="relative overflow-visible rounded-lg border border-dashed"
          style={{
            borderColor: "var(--editor-accent)",
            backgroundColor: sectionStyle?.backgroundColor && sectionStyle.backgroundColor !== "transparent"
              ? sectionStyle.backgroundColor
              : "var(--editor-card)",
            backgroundImage: sectionStyle?.backgroundImage ? `url(${sectionStyle.backgroundImage})` : undefined,
            backgroundSize: sectionStyle?.backgroundImage ? "cover" : undefined,
            backgroundPosition: sectionStyle?.backgroundImage ? "center" : undefined,
            position: sectionStyle?.position ?? "relative",
            minHeight: sectionStyle?.minHeight,
            overflow: sectionStyle?.overflow ?? "visible",
            zIndex: sectionStyle?.zIndex,
            marginTop: sectionStyle?.marginTop,
            marginBottom: sectionStyle?.marginBottom,
            borderRadius: sectionStyle?.borderRadius,
          }}>

          <div
            className="relative min-h-[200px]"
            style={{
              paddingTop: sectionStyle?.paddingTop ?? 80,
              paddingBottom: sectionStyle?.paddingBottom ?? 80,
              paddingLeft: sectionStyle?.paddingLeft ?? 24,
              paddingRight: sectionStyle?.paddingRight ?? 24,
              textAlign: sectionStyle?.textAlign,
            }}
          >
            {effectiveLayout.mode !== "stack" && (
              <div className="absolute right-2 top-2 z-10">
                <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                  style={{ background: "var(--editor-accent)", color: "white" }}>
                  {effectiveLayout.mode === "grid" ? `${effectiveLayout.columns}-col grid` : "flex"}
                </span>
              </div>
            )}

            <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
              <div style={containerStyle}>
                {visibleBlocks.map((block) => {
                  const layoutStyle = buildPreviewBlockStyle(block, effectiveLayout.mode, effectiveLayout.columns, effectiveLayout.gap);
                  const userStyles = blockStyleToInline(block.style, device);
                  return (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      catalog={catalog}
                      isSelected={selectedBlockId === block.id}
                      actions={actions}
                      blockStyle={layoutStyle}
                      userStyles={userStyles}
                      selectedBlockId={selectedBlockId}
                    />
                  );
                })}
              </div>
            </SortableContext>

            {visibleBlocks.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-20 text-center"
                style={{ borderColor: "var(--editor-border)" }}>
                <LayersIcon className="h-7 w-7" style={{ color: "var(--editor-text-muted)" }} />
                <div>
                  <p className="text-[13.5px] font-semibold" style={{ color: "var(--editor-text)" }}>This section is empty</p>
                  <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed" style={{ color: "var(--editor-text-muted)" }}>
                    Drag a widget from the left panel, or tap the + button.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Flatten all blocks including nested container children for CSS generation. */
function flattenBlockTree(blocks: Block[]): Block[] {
  const result: Block[] = [];
  for (const block of blocks) {
    result.push(block);
    if (isContainerBlock(block)) {
      const children = block.settings.blocks;
      if (children?.length) {
        result.push(...flattenBlockTree(children));
      }
    }
  }
  return result;
}
