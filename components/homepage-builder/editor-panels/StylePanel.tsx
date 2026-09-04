"use client";
import { useRef, useEffect } from "react";
import type { Block, BlockStyle, BlockBreakpointStyle, ResponsiveBlockStyles, SectionTheme } from "@/types/homepage";
import { useEditorDevice, useEditorTheme } from "@/components/homepage-builder/editor-context";
import { SectionHeader } from "@/components/homepage-builder/editor-controls/SectionHeader";
import { ResponsiveInput } from "@/components/homepage-builder/editor-controls/ResponsiveInput";
import { SelectControl } from "@/components/homepage-builder/editor-controls/SelectControl";
import { ColorPicker } from "@/components/homepage-builder/editor-controls/ColorPicker";
import {
  DISPLAY_OPTIONS, POSITION_OPTIONS, OVERFLOW_OPTIONS,
  FONT_WEIGHT_OPTIONS, FONT_FAMILY_OPTIONS, TEXT_TRANSFORM_OPTIONS, TEXT_DECORATION_OPTIONS,
  computeStyleDelta,
} from "@/lib/style-utils";

/** The update payload sent from StylePanel to the parent. */
export type BlockStyleUpdate = {
  responsiveStyles?: ResponsiveBlockStyles;
};

type StyleUpdater = (update: BlockStyleUpdate) => void;

/** Deep-merge two BlockBreakpointStyle objects, merging nested category objects instead of replacing them. */
function deepMergeBreakpoint(prev: BlockBreakpointStyle, next: BlockBreakpointStyle): BlockBreakpointStyle {
  const result: Record<string, unknown> = {};
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of allKeys) {
    const prevVal = (prev as Record<string, unknown>)[key];
    const nextVal = (next as Record<string, unknown>)[key];
    if (prevVal && nextVal && typeof prevVal === "object" && typeof nextVal === "object" && !Array.isArray(prevVal) && !Array.isArray(nextVal)) {
      result[key] = { ...(prevVal as Record<string, unknown>), ...(nextVal as Record<string, unknown>) };
    } else if (nextVal !== undefined) {
      result[key] = nextVal;
    } else {
      result[key] = prevVal;
    }
  }
  return result as BlockBreakpointStyle;
}

/** Resolve the full effective breakpoint by deep-merging legacy base with responsive delta. */
function resolveBreakpoint(base: BlockBreakpointStyle, current: BlockBreakpointStyle): BlockBreakpointStyle {
  return deepMergeBreakpoint(base, current);
}

function LayoutControls({ block, onUpdate }: { block: Block; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const { resolvedTheme } = useEditorTheme();
  const theme = resolvedTheme as SectionTheme;
  const blockRef = useRef(block);
  useEffect(() => { blockRef.current = block; }, [block]);

  const getCurrentBreakpoint = (): BlockBreakpointStyle => {
    return block.responsiveStyles?.[theme]?.[device] ?? block.style?.[device] ?? {};
  };

  const bp = (key: string) => getCurrentBreakpoint().layout?.[key as keyof import("@/types/homepage").LayoutProps] ?? "";
  const set = (key: string, val: string) => {
    const b = blockRef.current;
    const base = b.style?.[device] ?? {};
    const current = b.responsiveStyles?.[theme]?.[device] ?? {};
    const resolved = resolveBreakpoint(base, current);
    const layout = { ...(resolved.layout || {}), [key]: val };
    const updatedBreakpoint = { ...resolved, layout };
    const delta = computeStyleDelta(base, updatedBreakpoint as any);
    onUpdate({
      responsiveStyles: {
        ...b.responsiveStyles,
        [theme]: {
          ...b.responsiveStyles?.[theme],
          [device]: delta as any,
        },
      },
    });
  };
  const units = ["px", "rem", "em", "%", "vw", "vh", "auto", "none"];

  const responsiveVal = (key: string) => {
    const val = getCurrentBreakpoint().layout?.[key as keyof import("@/types/homepage").LayoutProps];
    return val ? { [device]: val } : {};
  };

  return (
    <SectionHeader title="Layout">
      <ResponsiveInput label="Width" value={responsiveVal("width")} onChange={(v) => set("width", v[device] || "")} placeholder="auto" units={["px", "rem", "%", "vw"]} />
      <ResponsiveInput label="Height" value={responsiveVal("height")} onChange={(v) => set("height", v[device] || "")} placeholder="auto" units={["px", "rem", "%", "vh"]} />
      <ResponsiveInput label="Min Width" value={responsiveVal("minWidth")} onChange={(v) => set("minWidth", v[device] || "")} placeholder="none" units={["px", "rem", "%"]} />
      <ResponsiveInput label="Max Width" value={responsiveVal("maxWidth")} onChange={(v) => set("maxWidth", v[device] || "")} placeholder="none" units={["px", "rem", "%"]} />
      <ResponsiveInput label="Margin" value={responsiveVal("margin")} onChange={(v) => set("margin", v[device] || "")} placeholder="0" units={["px", "rem", "%", "auto"]} />
      <ResponsiveInput label="Padding" value={responsiveVal("padding")} onChange={(v) => set("padding", v[device] || "")} placeholder="0" units={["px", "rem", "%"]} />
      <SelectControl label="Display" value={bp("display")} onChange={(v) => set("display", v)} options={[{ label: "Default", value: "" }, ...DISPLAY_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <SelectControl label="Position" value={bp("position")} onChange={(v) => set("position", v)} options={[{ label: "Default", value: "" }, ...POSITION_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <div className="grid grid-cols-2 gap-2">
        <ResponsiveInput label="Top" value={responsiveVal("top")} onChange={(v) => set("top", v[device] || "")} placeholder="auto" units={units} />
        <ResponsiveInput label="Right" value={responsiveVal("right")} onChange={(v) => set("right", v[device] || "")} placeholder="auto" units={units} />
        <ResponsiveInput label="Bottom" value={responsiveVal("bottom")} onChange={(v) => set("bottom", v[device] || "")} placeholder="auto" units={units} />
        <ResponsiveInput label="Left" value={responsiveVal("left")} onChange={(v) => set("left", v[device] || "")} placeholder="auto" units={units} />
      </div>
      <ResponsiveInput label="Z-Index" value={responsiveVal("zIndex")} onChange={(v) => set("zIndex", v[device] || "")} placeholder="auto" />
      <SelectControl label="Overflow" value={bp("overflow")} onChange={(v) => set("overflow", v)} options={[{ label: "Default", value: "" }, ...OVERFLOW_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <ResponsiveInput label="Gap" value={responsiveVal("gap")} onChange={(v) => set("gap", v[device] || "")} placeholder="0" units={["px", "rem"]} />
      <SelectControl label="Align Items" value={bp("alignItems")} onChange={(v) => set("alignItems", v)} options={[{ label: "Default", value: "" }, { label: "Stretch", value: "stretch" }, { label: "Center", value: "center" }, { label: "Start", value: "flex-start" }, { label: "End", value: "flex-end" }]} />
      <SelectControl label="Justify Content" value={bp("justifyContent")} onChange={(v) => set("justifyContent", v)} options={[{ label: "Default", value: "" }, { label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }, { label: "Space Between", value: "space-between" }]} />
    </SectionHeader>
  );
}

function TypographyControls({ block, onUpdate }: { block: Block; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const { resolvedTheme } = useEditorTheme();
  const theme = resolvedTheme as SectionTheme;
  const blockRef = useRef(block);
  useEffect(() => { blockRef.current = block; }, [block]);

  const getCurrentBreakpoint = (): BlockBreakpointStyle => {
    return block.responsiveStyles?.[theme]?.[device] ?? block.style?.[device] ?? {};
  };

  const bp = (key: string) => getCurrentBreakpoint().typography?.[key as keyof import("@/types/homepage").TypographyProps] ?? "";
  const set = (key: string, val: string) => {
    const b = blockRef.current;
    const base = b.style?.[device] ?? {};
    const current = b.responsiveStyles?.[theme]?.[device] ?? {};
    const resolved = resolveBreakpoint(base, current);
    const typography = { ...(resolved.typography || {}), [key]: val };
    const updatedBreakpoint = { ...resolved, typography };
    const delta = computeStyleDelta(base, updatedBreakpoint as any);
    onUpdate({
      responsiveStyles: {
        ...b.responsiveStyles,
        [theme]: {
          ...b.responsiveStyles?.[theme],
          [device]: delta as any,
        },
      },
    });
  };

  const responsiveVal = (key: string) => {
    const val = getCurrentBreakpoint().typography?.[key as keyof import("@/types/homepage").TypographyProps];
    return val ? { [device]: val } : {};
  };

  return (
    <SectionHeader title="Typography">
      <SelectControl label="Font Family" value={bp("fontFamily")} onChange={(v) => set("fontFamily", v)} options={FONT_FAMILY_OPTIONS} />
      <ResponsiveInput label="Font Size" value={responsiveVal("fontSize")} onChange={(v) => set("fontSize", v[device] || "")} placeholder="inherit" units={["px", "rem", "em", "vw"]} />
      <SelectControl label="Font Weight" value={bp("fontWeight")} onChange={(v) => set("fontWeight", v)} options={[{ label: "Inherit", value: "" }, ...FONT_WEIGHT_OPTIONS.map((w) => ({ label: w, value: w }))]} />
      <ResponsiveInput label="Line Height" value={responsiveVal("lineHeight")} onChange={(v) => set("lineHeight", v[device] || "")} placeholder="normal" units={["px", "rem", "em"]} />
      <ResponsiveInput label="Letter Spacing" value={responsiveVal("letterSpacing")} onChange={(v) => set("letterSpacing", v[device] || "")} placeholder="normal" units={["px", "em"]} />
      <SelectControl label="Text Transform" value={bp("textTransform")} onChange={(v) => set("textTransform", v)} options={[{ label: "None", value: "" }, ...TEXT_TRANSFORM_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <SelectControl label="Text Decoration" value={bp("textDecoration")} onChange={(v) => set("textDecoration", v)} options={[{ label: "None", value: "" }, ...TEXT_DECORATION_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <SelectControl label="Text Align" value={bp("textAlign")} onChange={(v) => set("textAlign", v)} options={[{ label: "Default", value: "" }, { label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }, { label: "Justify", value: "justify" }]} />
    </SectionHeader>
  );
}

function ColorControls({ block, onUpdate }: { block: Block; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const { resolvedTheme } = useEditorTheme();
  const theme = resolvedTheme as SectionTheme;
  const blockRef = useRef(block);
  useEffect(() => { blockRef.current = block; }, [block]);

  const getCurrentBreakpoint = (): BlockBreakpointStyle => {
    return block.responsiveStyles?.[theme]?.[device] ?? block.style?.[device] ?? {};
  };

  const colors = getCurrentBreakpoint().colors || {};
  const set = (key: string, val: string) => {
    const b = blockRef.current;
    const base = b.style?.[device] ?? {};
    const current = b.responsiveStyles?.[theme]?.[device] ?? {};
    const resolved = resolveBreakpoint(base, current);
    const colorsObj = { ...(resolved.colors || {}), [key]: val };
    const updatedBreakpoint = { ...resolved, colors: colorsObj };
    const delta = computeStyleDelta(base, updatedBreakpoint as any);
    onUpdate({
      responsiveStyles: {
        ...b.responsiveStyles,
        [theme]: {
          ...b.responsiveStyles?.[theme],
          [device]: delta as any,
        },
      },
    });
  };

  return (
    <SectionHeader title="Colors">
      <ColorPicker label="Text Color" value={colors.color || ""} onChange={(v) => set("color", v)} />
      <ColorPicker label="Background Color" value={colors.backgroundColor || ""} onChange={(v) => set("backgroundColor", v)} />
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>Gradient Background</span>
        <input
          type="text"
          value={colors.backgroundGradient || ""}
          onChange={(e) => set("backgroundGradient", e.target.value)}
          placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          className="mt-1.5 w-full rounded border px-2 py-1.5 text-[12px]"
          style={{ borderColor: "var(--editor-input-border)", background: "var(--editor-input-bg)", color: "var(--editor-text)" }}
        />
      </label>
      <ResponsiveInput label="Opacity" value={colors.opacity ? { [device]: colors.opacity } : {}} onChange={(v) => set("opacity", v[device] || "")} placeholder="1" />
    </SectionHeader>
  );
}

function BorderControls({ block, onUpdate }: { block: Block; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const { resolvedTheme } = useEditorTheme();
  const theme = resolvedTheme as SectionTheme;
  const blockRef = useRef(block);
  useEffect(() => { blockRef.current = block; }, [block]);

  const getCurrentBreakpoint = (): BlockBreakpointStyle => {
    return block.responsiveStyles?.[theme]?.[device] ?? block.style?.[device] ?? {};
  };

  const border = getCurrentBreakpoint().border || {};
  const set = (key: string, val: string) => {
    const b = blockRef.current;
    const base = b.style?.[device] ?? {};
    const current = b.responsiveStyles?.[theme]?.[device] ?? {};
    const resolved = resolveBreakpoint(base, current);
    const borderObj = { ...(resolved.border || {}), [key]: val };
    const updatedBreakpoint = { ...resolved, border: borderObj };
    const delta = computeStyleDelta(base, updatedBreakpoint as any);
    onUpdate({
      responsiveStyles: {
        ...b.responsiveStyles,
        [theme]: {
          ...b.responsiveStyles?.[theme],
          [device]: delta as any,
        },
      },
    });
  };

  return (
    <SectionHeader title="Border">
      <SelectControl label="Border Type" value={border.borderType || ""} onChange={(v) => set("borderType", v)} options={[{ label: "None", value: "" }, { label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }]} />
      <ResponsiveInput label="Border Width" value={border.borderWidth ? { [device]: border.borderWidth } : {}} onChange={(v) => set("borderWidth", v[device] || "")} placeholder="0" units={["px", "rem"]} />
      <ColorPicker label="Border Color" value={border.borderColor || ""} onChange={(v) => set("borderColor", v)} />
      <ResponsiveInput label="Border Radius" value={border.borderRadius ? { [device]: border.borderRadius } : {}} onChange={(v) => set("borderRadius", v[device] || "")} placeholder="0" units={["px", "rem", "%"]} />
    </SectionHeader>
  );
}

function ShadowControls({ block, onUpdate }: { block: Block; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const { resolvedTheme } = useEditorTheme();
  const theme = resolvedTheme as SectionTheme;
  const blockRef = useRef(block);
  useEffect(() => { blockRef.current = block; }, [block]);

  const getCurrentBreakpoint = (): BlockBreakpointStyle => {
    return block.responsiveStyles?.[theme]?.[device] ?? block.style?.[device] ?? {};
  };

  const shadow = getCurrentBreakpoint().shadow || {};
  const set = (key: string, val: string) => {
    const b = blockRef.current;
    const base = b.style?.[device] ?? {};
    const current = b.responsiveStyles?.[theme]?.[device] ?? {};
    const resolved = resolveBreakpoint(base, current);
    const shadowObj = { ...(resolved.shadow || {}), [key]: val };
    const updatedBreakpoint = { ...resolved, shadow: shadowObj };
    const delta = computeStyleDelta(base, updatedBreakpoint as any);
    onUpdate({
      responsiveStyles: {
        ...b.responsiveStyles,
        [theme]: {
          ...b.responsiveStyles?.[theme],
          [device]: delta as any,
        },
      },
    });
  };

  return (
    <SectionHeader title="Shadow" defaultOpen={false}>
      <ResponsiveInput label="X Offset" value={shadow.shadowX ? { [device]: shadow.shadowX } : {}} onChange={(v) => set("shadowX", v[device] || "")} placeholder="0" units={["px", "rem"]} />
      <ResponsiveInput label="Y Offset" value={shadow.shadowY ? { [device]: shadow.shadowY } : {}} onChange={(v) => set("shadowY", v[device] || "")} placeholder="0" units={["px", "rem"]} />
      <ResponsiveInput label="Blur" value={shadow.shadowBlur ? { [device]: shadow.shadowBlur } : {}} onChange={(v) => set("shadowBlur", v[device] || "")} placeholder="0" units={["px", "rem"]} />
      <ResponsiveInput label="Spread" value={shadow.shadowSpread ? { [device]: shadow.shadowSpread } : {}} onChange={(v) => set("shadowSpread", v[device] || "")} placeholder="0" units={["px", "rem"]} />
      <ColorPicker label="Shadow Color" value={shadow.shadowColor || ""} onChange={(v) => set("shadowColor", v)} />
    </SectionHeader>
  );
}

export function StylePanel({ block, onUpdate }: { block: Block; onUpdate: (update: BlockStyleUpdate) => void }) {
  return (
    <div className="space-y-0">
      <LayoutControls block={block} onUpdate={onUpdate} />
      <TypographyControls block={block} onUpdate={onUpdate} />
      <ColorControls block={block} onUpdate={onUpdate} />
      <BorderControls block={block} onUpdate={onUpdate} />
      <ShadowControls block={block} onUpdate={onUpdate} />
    </div>
  );
}
