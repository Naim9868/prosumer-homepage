import type { CSSProperties, ComponentType } from "react";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { BLOCK_REGISTRY } from "@/registry/block-registry";
import type { CatalogData } from "@/types/catalog";
import type { CustomSection, CustomSectionLayout, Block, EditorDevice } from "@/types/homepage";
import { DEFAULT_CUSTOM_LAYOUT, DEFAULT_BLOCK_LAYOUT } from "@/types/homepage";
import { blockStyleToInline, generateSectionCSS, parseCustomAttributes } from "@/lib/style-utils";

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

function resolveLayoutForDevice(layout: CustomSectionLayout, device: EditorDevice): CustomSectionLayout {
  if (device === "desktop") return layout;
  const override = layout.responsive?.[device];
  if (!override) return layout;
  return {
    ...layout,
    ...override,
  };
}

function containerDeclarations(layout: CustomSectionLayout): string {
  if (layout.mode === "grid") {
    const ratios = layout.columnRatios;
    const hasRatios = Array.isArray(ratios) && ratios.length === layout.columns;
    const template = hasRatios ? ratios.map((r) => `${r}fr`).join(" ") : `repeat(${layout.columns}, 1fr)`;
    return [
      "display: grid !important;",
      `grid-template-columns: ${template} !important;`,
      `gap: ${layout.gap}px !important;`,
      `align-items: ${layout.alignItems} !important;`,
      `justify-items: ${layout.justifyContent} !important;`,
    ].join(" ");
  }

  if (layout.mode === "flex") {
    const dir = layout.flexDirection === "row-wrap" || layout.flexDirection === "column-wrap"
      ? layout.flexDirection === "row-wrap" ? "row" : "column"
      : layout.flexDirection;
    const wrap = layout.flexDirection === "row-wrap" || layout.flexDirection === "column-wrap" ? "wrap" : "nowrap";
    return [
      "display: flex !important;",
      `flex-direction: ${dir} !important;`,
      `flex-wrap: ${wrap} !important;`,
      `gap: ${layout.gap}px !important;`,
      `justify-content: ${layout.justifyContent} !important;`,
      `align-items: ${layout.alignItems} !important;`,
    ].join(" ");
  }

  return [
    "display: flex !important;",
    "flex-direction: column !important;",
    `gap: ${layout.gap}px !important;`,
  ].join(" ");
}

function blockDeclarations(block: Block, layout: CustomSectionLayout): string {
  const bl = block.layout ?? DEFAULT_BLOCK_LAYOUT;
  const declarations: string[] = [];

  if (layout.mode === "grid") {
    if (bl.columnSpan > 1) declarations.push(`grid-column: span ${bl.columnSpan} !important;`);
    if (bl.rowSpan > 1) declarations.push(`grid-row: span ${bl.rowSpan} !important;`);
  }

  if (layout.mode === "flex") {
    if (bl.columnSpan > 1) {
      declarations.push(`flex: 0 0 calc((100% * ${bl.columnSpan} / ${layout.columns}) - ${(bl.columnSpan - 1) * layout.gap}px) !important;`);
    }
    if (bl.order) declarations.push(`order: ${bl.order} !important;`);
  }

  if (bl.alignSelf !== "auto") {
    declarations.push(`align-self: ${bl.alignSelf} !important;`);
  }

  return declarations.join(" ");
}

function generateResponsiveLayoutCSS(sectionId: string, layout: CustomSectionLayout, blocks: Block[]): string {
  const selector = `[data-custom-layout-id="${sectionId}"]`;
  const tabletLayout = resolveLayoutForDevice(layout, "tablet");
  const mobileLayout = resolveLayoutForDevice(layout, "mobile");

  const tabletContainer = containerDeclarations(tabletLayout);
  const mobileContainer = containerDeclarations(mobileLayout);

  const responsiveBlocks = (items: Block[], parentSelector: string, currentLayout: CustomSectionLayout): string => items
    .map((block) => {
      const css = blockDeclarations(block, currentLayout);
      const ownCSS = css ? `${parentSelector} [data-block-id="${block.id}"] { ${css} }` : "";
      if (block.type !== "container") return ownCSS;
      const children = (block as Block<"container">).settings.blocks || [];
      return [
        ownCSS,
        responsiveBlocks(children, `${parentSelector} [data-block-id="${block.id}"]`, currentLayout),
      ].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n");

  const tabletBlocks = responsiveBlocks(blocks, selector, tabletLayout);
  const mobileBlocks = responsiveBlocks(blocks, selector, mobileLayout);

  const responsiveContainers = (items: Block[], parentSelector: string): string[] => items.flatMap((block) => {
    if (block.type !== "container") return [];
    const containerSelector = `${parentSelector} [data-block-id="${block.id}"] > [data-container-content-id="${block.id}"]`;
    const containerLayout = (block as Block<"container">).settings.layout ?? DEFAULT_CUSTOM_LAYOUT;
    const tabletContainerLayout = resolveLayoutForDevice(containerLayout, "tablet");
    const mobileContainerLayout = resolveLayoutForDevice(containerLayout, "mobile");
    return [
      `tablet:${containerSelector} { ${containerDeclarations(tabletContainerLayout)} }`,
      `mobile:${containerSelector} { ${containerDeclarations(mobileContainerLayout)} }`,
      ...responsiveContainers((block as Block<"container">).settings.blocks || [], `${parentSelector} [data-block-id="${block.id}"]`),
    ];
  });
  const containerRules = responsiveContainers(blocks, selector);
  const tabletContainerRules = containerRules.filter((rule) => rule.startsWith("tablet:")).map((rule) => rule.slice(8)).join("\n");
  const mobileContainerRules = containerRules.filter((rule) => rule.startsWith("mobile:")).map((rule) => rule.slice(7)).join("\n");

  return [
    `@media (max-width: 1024px) { ${selector} { ${tabletContainer} } ${tabletBlocks} ${tabletContainerRules} }`,
    `@media (max-width: 768px) { ${selector} { ${mobileContainer} } ${mobileBlocks} ${mobileContainerRules} }`,
  ].join("\n");
}

function renderBlock(block: Block, catalog: CatalogData | undefined, layoutStyle: CSSProperties): React.ReactNode {
  const customAttrs = parseCustomAttributes(block.advanced?.customAttributes);
  const Component = BLOCK_REGISTRY[block.type] as ComponentType<{ block: Block; catalog?: CatalogData }> | undefined;
  if (!Component) return null;

  if (block.type === "container") {
    const container = block as Block<"container">;
    const layout = container.settings.layout ?? DEFAULT_CUSTOM_LAYOUT;
    const children = [...(container.settings.blocks || [])].sort((a, b) => a.order - b.order);
    return (
      <div
        key={block.id}
        id={block.advanced?.cssId || undefined}
        className={block.advanced?.cssClasses || undefined}
        data-block-id={block.id}
        data-block-type={block.type}
        style={{ position: "relative", overflow: "visible", ...layoutStyle, ...blockStyleToInline(block.style, "desktop") }}
        {...customAttrs}
      >
        <div style={buildContainerStyle(layout)} data-container-content-id={block.id}>
          {children.map((child) => (
            renderBlock(
              child,
              catalog,
              buildBlockStyle(child, layout.mode, layout.columns, layout.gap)
            )
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      key={block.id}
      id={block.advanced?.cssId || undefined}
      className={block.advanced?.cssClasses || undefined}
      data-block-id={block.id}
      data-block-type={block.type}
      style={{ ...layoutStyle, ...blockStyleToInline(block.style, "desktop") }}
      {...customAttrs}
    >
      <Component block={block} catalog={catalog} />
    </div>
  );
}

function flattenBlockTree(blocks: Block[]): Block[] {
  const result: Block[] = [];
  for (const block of blocks) {
    result.push(block);
    if (block.type === "container") {
      const children = (block as Block<"container">).settings.blocks;
      if (children?.length) {
        result.push(...flattenBlockTree(children));
      }
    }
  }
  return result;
}

export function CustomSectionRenderer({
  section,
  catalog,
}: {
  section: CustomSection;
  catalog?: CatalogData;
}) {
  const blocks = [...section.blocks].sort((a, b) => a.order - b.order);
  const layout = section.settings.layout ?? DEFAULT_CUSTOM_LAYOUT;
  const allBlocks = flattenBlockTree(blocks);
  const blockCSS = generateSectionCSS(allBlocks.map((b) => ({ id: b.id, style: b.style, advanced: b.advanced })));
  const responsiveLayoutCSS = generateResponsiveLayoutCSS(section.id, layout, blocks);
  const css = `${blockCSS}\n${responsiveLayoutCSS}`;

  const containerStyle: CSSProperties = (() => {
    switch (layout.mode) {
      case "grid":
        return buildGridStyle(layout);
      case "flex":
        return buildFlexStyle(layout);
      default:
        return buildStackStyle(layout);
    }
  })();

  if (layout.mode === "grid") {
    (containerStyle as Record<string, unknown>)["--grid-cols"] = layout.columns;
  }

  return (
    <SectionWrapper style={section.style}>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: css }} />
      <div style={containerStyle} data-custom-layout-id={section.id}>
        {blocks.map((block) => {
          return renderBlock(block, catalog, buildBlockStyle(block, layout.mode, layout.columns, layout.gap));
        })}
      </div>
    </SectionWrapper>
  );
}
