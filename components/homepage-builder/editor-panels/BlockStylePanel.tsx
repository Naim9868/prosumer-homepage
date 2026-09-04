"use client";
import { useState } from "react";
import { Paintbrush, Settings2, ChevronLeft, LayoutGrid, FileText } from "lucide-react";
import type { Block, BlockType, BlockStyle, BlockAdvanced, BlockLayout, BlockSettingsMap, ResponsiveBlockStyles, ResponsiveBlockLayout, ResponsiveBlockAdvanced, ResponsiveBlockSettings, SectionTheme } from "@/types/homepage";
import { BLOCK_TYPE_META, DEFAULT_BLOCK_LAYOUT } from "@/types/homepage";
import { BLOCK_EDITOR_REGISTRY } from "@/components/homepage-builder/block-editor-registry";
import { cn } from "@/lib/utils";
import { StylePanel, type BlockStyleUpdate } from "./StylePanel";
import { AdvancedPanel } from "./AdvancedPanel";
import { Field, FieldGrid, TextInput, Select } from "@/components/homepage-builder/fields";
import { useEditorDevice, useEditorTheme } from "@/components/homepage-builder/editor-context";

type Tab = "content" | "style" | "layout" | "advanced";

function ContentTab({
  block,
  onUpdate,
  onResponsiveUpdate,
}: {
  block: Block;
  onUpdate: (settings: BlockSettingsMap[BlockType]) => void;
  onResponsiveUpdate?: (update: { responsiveSettings?: ResponsiveBlockSettings }) => void;
}) {
  const { device } = useEditorDevice();
  const { resolvedTheme } = useEditorTheme();
  const theme = resolvedTheme as SectionTheme;

  const currentSettings = (block.responsiveSettings?.[theme]?.[device] ?? block.settings) as BlockSettingsMap[BlockType];
  const Editor = BLOCK_EDITOR_REGISTRY[block.type] as any;
  if (!Editor) return null;

  return (
    <div className="p-3">
      <Editor
        settings={currentSettings}
        onChange={(next: BlockSettingsMap[BlockType]) => {
          if (onResponsiveUpdate) {
            onResponsiveUpdate({
              responsiveSettings: {
                ...block.responsiveSettings,
                [theme]: {
                  ...block.responsiveSettings?.[theme],
                  [device]: next as unknown as Record<string, unknown>,
                },
              },
            });
          } else {
            onUpdate(next);
          }
        }}
      />
    </div>
  );
}

function LayoutTab({
  block,
  onLayoutUpdate,
  onResponsiveLayoutUpdate,
}: {
  block: Block;
  onLayoutUpdate: (layout: BlockLayout) => void;
  onResponsiveLayoutUpdate: (update: { responsiveLayout?: ResponsiveBlockLayout }) => void;
}) {
  const { device } = useEditorDevice();
  const { resolvedTheme } = useEditorTheme();
  const theme = resolvedTheme as SectionTheme;

  const layout = block.responsiveLayout?.[theme]?.[device] ?? block.layout ?? DEFAULT_BLOCK_LAYOUT;

  const handleLayoutChange = (patch: Partial<BlockLayout>) => {
    const updated = { ...layout, ...patch };
    onResponsiveLayoutUpdate({
      responsiveLayout: {
        ...block.responsiveLayout,
        [theme]: {
          ...block.responsiveLayout?.[theme],
          [device]: updated,
        },
      },
    });
  };

  return (
    <div className="space-y-4 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>
        Block Positioning
      </p>
      <FieldGrid>
        <Field label="Column Span">
          <Select
            value={String(layout.columnSpan)}
            onChange={(v) => handleLayoutChange({ columnSpan: Number(v) as BlockLayout["columnSpan"] })}
            options={Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))}
          />
        </Field>
        <Field label="Row Span">
          <Select
            value={String(layout.rowSpan)}
            onChange={(v) => handleLayoutChange({ rowSpan: Number(v) as BlockLayout["rowSpan"] })}
            options={Array.from({ length: 6 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))}
          />
        </Field>
      </FieldGrid>
      <FieldGrid>
        <Field label="Order">
          <TextInput
            type="number"
            min={0}
            max={100}
            value={layout.order}
            onChange={(e) => handleLayoutChange({ order: Number(e.target.value) })}
          />
        </Field>
        <Field label="Align Self">
          <Select
            value={layout.alignSelf}
            onChange={(v) => handleLayoutChange({ alignSelf: v })}
            options={[
              { label: "Auto", value: "auto" },
              { label: "Stretch", value: "stretch" },
              { label: "Start", value: "start" },
              { label: "Center", value: "center" },
              { label: "End", value: "end" },
            ]}
          />
        </Field>
      </FieldGrid>
      <p className="text-[10px] leading-relaxed" style={{ color: "var(--editor-text-muted)" }}>
        Column span controls how many grid columns this block occupies. Order controls the visual sequence in flex/grid.
      </p>
    </div>
  );
}

export function BlockStylePanel({
  block,
  onSettingsUpdate,
  onStyleUpdate,
  onAdvancedUpdate,
  onLayoutUpdate,
  onResponsiveLayoutUpdate,
  onResponsiveSettingsUpdate,
  onResponsiveAdvancedUpdate,
  onBack,
}: {
  block: Block;
  onSettingsUpdate: (settings: BlockSettingsMap[BlockType]) => void;
  onStyleUpdate: (update: BlockStyleUpdate) => void;
  onAdvancedUpdate: (advanced: BlockAdvanced) => void;
  onLayoutUpdate?: (layout: BlockLayout) => void;
  onResponsiveLayoutUpdate?: (update: { responsiveLayout?: ResponsiveBlockLayout }) => void;
  onResponsiveSettingsUpdate?: (update: { responsiveSettings?: ResponsiveBlockSettings }) => void;
  onResponsiveAdvancedUpdate?: (update: { responsiveAdvanced?: ResponsiveBlockAdvanced }) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>("content");
  const meta = BLOCK_TYPE_META[block.type];

  const tabs: { value: Tab; label: string; icon: typeof Paintbrush }[] = [
    { value: "content", label: "Content", icon: FileText },
    { value: "style", label: "Style", icon: Paintbrush },
    ...(onLayoutUpdate || onResponsiveLayoutUpdate ? [{ value: "layout" as Tab, label: "Layout", icon: LayoutGrid }] : []),
    { value: "advanced", label: "Advanced", icon: Settings2 },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: "var(--editor-border)", background: "var(--editor-panel)" }}>
        <button
          type="button"
          onClick={onBack}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors"
          style={{ color: "var(--editor-text-muted)" }}
          title="Back to section settings"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-accent)" }}>
            {meta.label}
          </p>
          <p className="truncate text-[10px]" style={{ color: "var(--editor-text-muted)" }}>Content, Style & Advanced</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 border-b" style={{ borderColor: "var(--editor-border)" }}>
        {tabs.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2 text-[10px] font-semibold transition-colors"
            )}
            style={{
              borderColor: tab === value ? "var(--editor-accent)" : "transparent",
              color: tab === value ? "var(--editor-accent)" : "var(--editor-text-muted)",
              background: tab === value ? "var(--editor-accent-light)" : "transparent",
            }}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "content" && (
          <ContentTab
            block={block}
            onUpdate={onSettingsUpdate}
            onResponsiveUpdate={onResponsiveSettingsUpdate}
          />
        )}
        {tab === "style" && <StylePanel block={block} onUpdate={onStyleUpdate} />}
        {tab === "layout" && (onLayoutUpdate || onResponsiveLayoutUpdate) && (
          <LayoutTab
            block={block}
            onLayoutUpdate={onLayoutUpdate || (() => {})}
            onResponsiveLayoutUpdate={onResponsiveLayoutUpdate || (() => {})}
          />
        )}
        {tab === "advanced" && (
          <AdvancedPanel
            block={block}
            onUpdate={onAdvancedUpdate}
            onResponsiveUpdate={onResponsiveAdvancedUpdate}
          />
        )}
      </div>
    </div>
  );
}
