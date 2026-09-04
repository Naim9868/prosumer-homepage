import type { CSSProperties, ComponentType } from "react";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { BLOCK_REGISTRY } from "@/registry/block-registry";
import type { CatalogData } from "@/types/catalog";
import type { CustomSection, CustomSectionLayout, Block, EditorDevice, SectionTheme } from "@/types/homepage";
import { DEFAULT_CUSTOM_LAYOUT, DEFAULT_BLOCK_LAYOUT } from "@/types/homepage";
import { blockStyleToInlineEditor, generateResponsiveSectionCSS, generateSectionCSS, parseCustomAttributes, resolveSectionStyle } from "@/lib/style-utils";

const DEVICES: EditorDevice[] = ["desktop", "tablet", "mobile"];

function resolveBlockForDevice(block: Block, theme: SectionTheme, device: EditorDevice): Block {
  const responsiveSettings = block.responsiveSettings?.[theme]?.[device];
  const resolvedSettings = responsiveSettings ? { ...block.settings, ...responsiveSettings } as typeof block.settings : block.settings;
  const responsiveLayout = block.responsiveLayout?.[theme]?.[device];
  const resolvedLayout = responsiveLayout ?? block.layout;
  const responsiveAdvanced = block.responsiveAdvanced?.[theme]?.[device];
  const resolvedAdvanced = responsiveAdvanced ? { ...block.advanced, ...responsiveAdvanced } : block.advanced;
  return { ...block, settings: resolvedSettings, layout: resolvedLayout, advanced: resolvedAdvanced };
}

function resolveBlockForPublic(block: Block): Block {
  return resolveBlockForDevice(block, "light", "desktop");
}

function getContainerChildrenForDevice(container: Block<"container">, theme: SectionTheme, device: EditorDevice): Block[] {
  const responsive = container.responsiveSettings?.[theme]?.[device];
  if (responsive && typeof responsive === "object" && "blocks" in responsive && Array.isArray((responsive as Record<string, unknown>).blocks)) {
    return (responsive as Record<string, unknown>).blocks as Block[];
  }
  return container.settings.blocks ?? [];
}

function getContainerLayoutForDevice(container: Block<"container">, theme: SectionTheme, device: EditorDevice): CustomSectionLayout {
  const responsive = container.responsiveSettings?.[theme]?.[device];
  const responsiveLayout = responsive && typeof responsive === "object" && "layout" in responsive
    ? (responsive as Record<string, unknown>).layout as CustomSectionLayout | undefined
    : undefined;
  return responsiveLayout ?? container.settings.layout ?? DEFAULT_CUSTOM_LAYOUT;
}

function resolveLayoutForDevice(layout: CustomSectionLayout, device: EditorDevice): CustomSectionLayout {
  if (device === "desktop") return layout;
  const override = layout.responsive?.[device];
  if (!override) return layout;
  return { ...layout, ...override };
}

// ─── Layout helpers ─────────────────────────────────────────────

function buildGridStyle(layout: CustomSectionLayout): CSSProperties {
  const ratios = layout.columnRatios;
  const hasRatios = Array.isArray(ratios) && ratios.length === layout.columns;
  const template = hasRatios ? ratios.map((r) => `${r}fr`).join(" ") : `repeat(${layout.columns}, 1fr)`;
  return { display: "grid", gridTemplateColumns: template, gap: layout.gap, alignItems: layout.alignItems, justifyItems: layout.justifyContent };
}

function buildFlexStyle(layout: CustomSectionLayout): CSSProperties {
  const dir = layout.flexDirection === "row-wrap" || layout.flexDirection === "column-wrap" ? (layout.flexDirection === "row-wrap" ? "row" : "column") : layout.flexDirection;
  const wrap = layout.flexDirection === "row-wrap" || layout.flexDirection === "column-wrap" ? "wrap" : "nowrap";
  return { display: "flex", flexDirection: dir, flexWrap: wrap, gap: layout.gap, justifyContent: layout.justifyContent, alignItems: layout.alignItems };
}

function buildStackStyle(): CSSProperties {
  return { display: "flex", flexDirection: "column", gap: 24 };
}

function buildContainerStyle(layout: CustomSectionLayout): CSSProperties {
  switch (layout.mode) {
    case "grid": return buildGridStyle(layout);
    case "flex": return buildFlexStyle(layout);
    default: return buildStackStyle();
  }
}

function buildBlockStyle(block: Block, layoutMode: string, columns: number, gap: number): CSSProperties {
  const bl = block.layout ?? DEFAULT_BLOCK_LAYOUT;
  const style: CSSProperties = {};
  if (layoutMode === "grid") {
    style.gridColumn = bl.columnSpan > 1 ? `span ${bl.columnSpan}` : undefined;
    style.gridRow = bl.rowSpan > 1 ? `span ${bl.rowSpan}` : undefined;
  } else if (layoutMode === "flex") {
    style.flex = bl.columnSpan > 1 ? `0 0 calc((100% * ${bl.columnSpan} / ${columns}) - ${(bl.columnSpan - 1) * gap}px)` : undefined;
    style.order = bl.order || undefined;
  }
  if (bl.alignSelf !== "auto") {
    style.alignSelf = bl.alignSelf as CSSProperties["alignSelf"];
  }
  return style;
}

// ─── Section container responsive layout CSS ─────────────────────

function sectionContainerLayoutCSS(sectionId: string, layout: CustomSectionLayout): string {
  const sel = `[data-custom-layout-id="${sectionId}"]`;
  const tablet = resolveLayoutForDevice(layout, "tablet");
  const mobile = resolveLayoutForDevice(layout, "mobile");
  const rules: string[] = [];

  function decl(l: CustomSectionLayout): string {
    if (l.mode === "grid") {
      const ratios = l.columnRatios;
      const hasRatios = Array.isArray(ratios) && ratios.length === l.columns;
      const template = hasRatios ? ratios.map((r) => `${r}fr`).join(" ") : `repeat(${l.columns}, 1fr)`;
      return `display:grid !important;grid-template-columns:${template} !important;gap:${l.gap}px !important;align-items:${l.alignItems} !important;justify-items:${l.justifyContent} !important;`;
    }
    if (l.mode === "flex") {
      const dir = l.flexDirection === "row-wrap" || l.flexDirection === "column-wrap" ? (l.flexDirection === "row-wrap" ? "row" : "column") : l.flexDirection;
      const wrap = l.flexDirection === "row-wrap" || l.flexDirection === "column-wrap" ? "wrap" : "nowrap";
      return `display:flex !important;flex-direction:${dir} !important;flex-wrap:${wrap} !important;gap:${l.gap}px !important;justify-content:${l.justifyContent} !important;align-items:${l.alignItems} !important;`;
    }
    return `display:flex !important;flex-direction:column !important;gap:${l.gap}px !important;`;
  }

  if (JSON.stringify(tablet) !== JSON.stringify(layout)) {
    rules.push(`@media (max-width:1024px){${sel}{${decl(tablet)}}}`);
  }
  if (JSON.stringify(mobile) !== JSON.stringify(layout)) {
    rules.push(`@media (max-width:768px){${sel}{${decl(mobile)}}}`);
  }
  return rules.join("\n");
}

// ─── Device variant show/hide CSS ────────────────────────────────

const DEVICE_VARIANT_CSS = `
@media (min-width: 1025px) {
  [data-device-variant="tablet"], [data-device-variant="mobile"] { display: none !important; }
}
@media (min-width: 769px) and (max-width: 1024px) {
  [data-device-variant="desktop"], [data-device-variant="mobile"] { display: none !important; }
}
@media (max-width: 768px) {
  [data-device-variant="desktop"], [data-device-variant="tablet"] { display: none !important; }
}
`;

// ─── Block rendering ────────────────────────────────────────────

function renderResolvedBlock(
  resolved: Block,
  catalog: CatalogData | undefined,
  layoutStyle: CSSProperties,
  device: EditorDevice = "desktop",
): React.ReactNode {
  const customAttrs = parseCustomAttributes(resolved.advanced?.customAttributes);
  const Component = BLOCK_REGISTRY[resolved.type] as ComponentType<{ block: Block; catalog?: CatalogData }> | undefined;
  if (!Component) return null;
  const inlineStyle = blockStyleToInlineEditor(resolved.responsiveStyles, "light", device);

  if (resolved.type === "container") {
    const container = resolved as Block<"container">;
    const layout = getContainerLayoutForDevice(container, "light", device);
    const children = [...getContainerChildrenForDevice(container, "light", device)].sort((a, b) => a.order - b.order);
    return (
      <div
        key={resolved.id}
        id={resolved.advanced?.cssId || undefined}
        className={resolved.advanced?.cssClasses || undefined}
        data-block-id={resolved.id}
        data-block-type={resolved.type}
        style={{ position: "relative", overflow: "visible", ...layoutStyle, ...inlineStyle }}
        {...customAttrs}
      >
        <div style={buildContainerStyle(layout)} data-container-content-id={resolved.id}>
          {children.map((child) => {
            const childResolved = resolveBlockForDevice(child, "light", device);
            return renderResolvedBlock(childResolved, catalog, buildBlockStyle(childResolved, layout.mode, layout.columns, layout.gap), device);
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      key={resolved.id}
      id={resolved.advanced?.cssId || undefined}
      className={resolved.advanced?.cssClasses || undefined}
      data-block-id={resolved.id}
      data-block-type={resolved.type}
      style={{ ...layoutStyle, ...inlineStyle }}
      {...customAttrs}
    >
      <Component block={resolved} catalog={catalog} />
    </div>
  );
}

function renderDeviceVariant(
  rawBlock: Block,
  catalog: CatalogData | undefined,
  sectionLayout: CustomSectionLayout,
  device: EditorDevice,
): React.ReactNode {
  const deviceLayout = resolveLayoutForDevice(sectionLayout, device);
  const resolved = resolveBlockForDevice(rawBlock, "light", device);
  return (
    <div key={`${rawBlock.id}-${device}`} data-device-variant={device}>
      {renderResolvedBlock(resolved, catalog, buildBlockStyle(resolved, deviceLayout.mode, deviceLayout.columns, deviceLayout.gap), device)}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────

export function CustomSectionRenderer({ section, catalog }: { section: CustomSection; catalog?: CatalogData }) {
  const blocks = [...section.blocks].sort((a, b) => a.order - b.order);
  const layout = section.settings.layout ?? DEFAULT_CUSTOM_LAYOUT;
  const resolvedSectionStyle = resolveSectionStyle(section.style, section.responsiveStyles, "light", "desktop");

  const allBlocks = flattenBlockTree(blocks);
  const blockCSS = generateSectionCSS(allBlocks.map((b) => ({
    id: b.id,
    style: b.style,
    advanced: b.advanced,
    responsiveStyles: b.responsiveStyles,
    responsiveAdvanced: b.responsiveAdvanced,
    responsiveLayout: b.responsiveLayout,
  })));
  const sectionCSS = generateResponsiveSectionCSS(section.id, section.style, section.responsiveStyles);
  const sectionLayoutCSS = sectionContainerLayoutCSS(section.id, layout);
  const css = `${sectionCSS}\n${blockCSS}\n${sectionLayoutCSS}\n${DEVICE_VARIANT_CSS}`;

  const containerStyle: CSSProperties = (() => {
    switch (layout.mode) {
      case "grid": return buildGridStyle(layout);
      case "flex": return buildFlexStyle(layout);
      default: return buildStackStyle();
    }
  })();
  if (layout.mode === "grid") {
    (containerStyle as Record<string, unknown>)["--grid-cols"] = layout.columns;
  }

  return (
    <SectionWrapper style={resolvedSectionStyle} dataCustomSectionId={section.id} disableVisibilityClasses>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: css }} />
      <div style={containerStyle} data-custom-layout-id={section.id}>
        {blocks.map((block) => DEVICES.map((device) => renderDeviceVariant(block, catalog, layout, device)))}
      </div>
    </SectionWrapper>
  );
}

function flattenBlockTree(blocks: Block[]): Block[] {
  const result: Block[] = [];
  for (const block of blocks) {
    const resolved = resolveBlockForPublic(block);
    result.push(resolved);
    if (resolved.type === "container") {
      const children = getContainerChildrenForDevice(resolved as Block<"container">, "light", "desktop");
      if (children.length) {
        result.push(...flattenBlockTree(children));
      }
    }
  }
  return result;
}
