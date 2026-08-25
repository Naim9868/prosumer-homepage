import type { CSSProperties, ComponentType } from "react";
import type { Block, CustomSectionLayout } from "@/types/homepage";
import type { CatalogData } from "@/types/catalog";
import { BLOCK_REGISTRY } from "@/registry/block-registry";
import { DEFAULT_CUSTOM_LAYOUT } from "@/types/homepage";

function buildGridStyle(layout: CustomSectionLayout): CSSProperties {
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

function buildFlexStyle(layout: CustomSectionLayout): CSSProperties {
  const dir =
    layout.flexDirection === "row-wrap" || layout.flexDirection === "column-wrap"
      ? layout.flexDirection === "row-wrap"
        ? "row"
        : "column"
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

function buildStackStyle(layout: CustomSectionLayout): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    gap: layout.gap,
  };
}

function buildContainerStyle(layout: CustomSectionLayout): CSSProperties {
  switch (layout.mode) {
    case "grid":
      return buildGridStyle(layout);
    case "flex":
      return buildFlexStyle(layout);
    default:
      return buildStackStyle(layout);
  }
}

export function ContainerBlock({
  block,
  catalog,
}: {
  block: Block<"container">;
  catalog?: CatalogData;
}) {
  const layout = block.settings.layout ?? DEFAULT_CUSTOM_LAYOUT;
  const children = [...(block.settings.blocks || [])].sort((a, b) => a.order - b.order);
  const containerStyle = buildContainerStyle(layout);

  if (children.length === 0) {
    return (
      <div
        className="rounded-lg border-2 border-dashed p-6 text-center text-sm"
        style={{ borderColor: "var(--editor-border, #e2e8f0)", background: "var(--editor-card, #f8fafc)", color: "var(--editor-text-muted, #94a3b8)" }}
      >
        <p className="font-semibold" style={{ color: "var(--editor-text, #1e293b)" }}>
          {block.settings.name || "Container"}
        </p>
        <p className="mt-1">Drop widgets here</p>
      </div>
    );
  }

  return (
    <div className="relative" data-block-id={block.id} data-block-type="container">
      {block.settings.name && (
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-50">
          {block.settings.name}
        </div>
      )}
      <div style={containerStyle}>
        {children.map((child) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Component = BLOCK_REGISTRY[child.type] as any;
          if (!Component) return null;
          return (
            <div key={child.id} data-block-id={child.id} data-block-type={child.type}>
              <Component block={child} catalog={catalog} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
