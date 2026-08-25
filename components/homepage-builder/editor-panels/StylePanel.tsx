"use client";
import type { Block, BlockStyle, BlockBreakpointStyle } from "@/types/homepage";
import { useEditorDevice } from "@/components/homepage-builder/editor-context";
import { SectionHeader } from "@/components/homepage-builder/editor-controls/SectionHeader";
import { ResponsiveInput } from "@/components/homepage-builder/editor-controls/ResponsiveInput";
import { SelectControl } from "@/components/homepage-builder/editor-controls/SelectControl";
import { ColorPicker } from "@/components/homepage-builder/editor-controls/ColorPicker";
import {
  DISPLAY_OPTIONS, POSITION_OPTIONS, OVERFLOW_OPTIONS,
  FONT_WEIGHT_OPTIONS, FONT_FAMILY_OPTIONS, TEXT_TRANSFORM_OPTIONS, TEXT_DECORATION_OPTIONS,
} from "@/lib/style-utils";

type StyleUpdater = (style: BlockStyle) => void;

function LayoutControls({ style, onUpdate }: { style: BlockStyle; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const bp = (key: string) => style[device]?.layout?.[key as keyof import("@/types/homepage").LayoutProps] ?? "";
  const set = (key: string, val: string) => {
    const current = style[device] || {};
    const layout = { ...(current.layout || {}), [key]: val };
    onUpdate({ ...style, [device]: { ...current, layout } });
  };
  const units = ["px", "rem", "em", "%", "vw", "vh", "auto", "none"];

  return (
    <SectionHeader title="Layout">
      <ResponsiveInput label="Width" value={style[device]?.layout?.width ? { [device]: style[device]!.layout!.width } : {}} onChange={(v) => set("width", v[device] || "")} placeholder="auto" units={["px", "rem", "%", "vw"]} />
      <ResponsiveInput label="Height" value={style[device]?.layout?.height ? { [device]: style[device]!.layout!.height } : {}} onChange={(v) => set("height", v[device] || "")} placeholder="auto" units={["px", "rem", "%", "vh"]} />
      <ResponsiveInput label="Min Width" value={style[device]?.layout?.minWidth ? { [device]: style[device]!.layout!.minWidth } : {}} onChange={(v) => set("minWidth", v[device] || "")} placeholder="none" units={["px", "rem", "%"]} />
      <ResponsiveInput label="Max Width" value={style[device]?.layout?.maxWidth ? { [device]: style[device]!.layout!.maxWidth } : {}} onChange={(v) => set("maxWidth", v[device] || "")} placeholder="none" units={["px", "rem", "%"]} />
      <ResponsiveInput label="Margin" value={style[device]?.layout?.margin ? { [device]: style[device]!.layout!.margin } : {}} onChange={(v) => set("margin", v[device] || "")} placeholder="0" units={["px", "rem", "%", "auto"]} />
      <ResponsiveInput label="Padding" value={style[device]?.layout?.padding ? { [device]: style[device]!.layout!.padding } : {}} onChange={(v) => set("padding", v[device] || "")} placeholder="0" units={["px", "rem", "%"]} />
      <SelectControl label="Display" value={bp("display")} onChange={(v) => set("display", v)} options={[{ label: "Default", value: "" }, ...DISPLAY_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <SelectControl label="Position" value={bp("position")} onChange={(v) => set("position", v)} options={[{ label: "Default", value: "" }, ...POSITION_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <ResponsiveInput label="Z-Index" value={style[device]?.layout?.zIndex ? { [device]: style[device]!.layout!.zIndex } : {}} onChange={(v) => set("zIndex", v[device] || "")} placeholder="auto" />
      <SelectControl label="Overflow" value={bp("overflow")} onChange={(v) => set("overflow", v)} options={[{ label: "Default", value: "" }, ...OVERFLOW_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <ResponsiveInput label="Gap" value={style[device]?.layout?.gap ? { [device]: style[device]!.layout!.gap } : {}} onChange={(v) => set("gap", v[device] || "")} placeholder="0" units={["px", "rem"]} />
      <SelectControl label="Align Items" value={bp("alignItems")} onChange={(v) => set("alignItems", v)} options={[{ label: "Default", value: "" }, { label: "Stretch", value: "stretch" }, { label: "Center", value: "center" }, { label: "Start", value: "flex-start" }, { label: "End", value: "flex-end" }]} />
      <SelectControl label="Justify Content" value={bp("justifyContent")} onChange={(v) => set("justifyContent", v)} options={[{ label: "Default", value: "" }, { label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }, { label: "Space Between", value: "space-between" }]} />
    </SectionHeader>
  );
}

function TypographyControls({ style, onUpdate }: { style: BlockStyle; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const bp = (key: string) => style[device]?.typography?.[key as keyof import("@/types/homepage").TypographyProps] ?? "";
  const set = (key: string, val: string) => {
    const current = style[device] || {};
    const typography = { ...(current.typography || {}), [key]: val };
    onUpdate({ ...style, [device]: { ...current, typography } });
  };

  return (
    <SectionHeader title="Typography">
      <SelectControl label="Font Family" value={bp("fontFamily")} onChange={(v) => set("fontFamily", v)} options={FONT_FAMILY_OPTIONS} />
      <ResponsiveInput label="Font Size" value={style[device]?.typography?.fontSize ? { [device]: style[device]!.typography!.fontSize } : {}} onChange={(v) => set("fontSize", v[device] || "")} placeholder="inherit" units={["px", "rem", "em", "vw"]} />
      <SelectControl label="Font Weight" value={bp("fontWeight")} onChange={(v) => set("fontWeight", v)} options={[{ label: "Inherit", value: "" }, ...FONT_WEIGHT_OPTIONS.map((w) => ({ label: w, value: w }))]} />
      <ResponsiveInput label="Line Height" value={style[device]?.typography?.lineHeight ? { [device]: style[device]!.typography!.lineHeight } : {}} onChange={(v) => set("lineHeight", v[device] || "")} placeholder="normal" units={["px", "rem", "em"]} />
      <ResponsiveInput label="Letter Spacing" value={style[device]?.typography?.letterSpacing ? { [device]: style[device]!.typography!.letterSpacing } : {}} onChange={(v) => set("letterSpacing", v[device] || "")} placeholder="normal" units={["px", "em"]} />
      <SelectControl label="Text Transform" value={bp("textTransform")} onChange={(v) => set("textTransform", v)} options={[{ label: "None", value: "" }, ...TEXT_TRANSFORM_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <SelectControl label="Text Decoration" value={bp("textDecoration")} onChange={(v) => set("textDecoration", v)} options={[{ label: "None", value: "" }, ...TEXT_DECORATION_OPTIONS.map((o) => ({ label: o, value: o }))]} />
      <SelectControl label="Text Align" value={bp("textAlign")} onChange={(v) => set("textAlign", v)} options={[{ label: "Default", value: "" }, { label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }, { label: "Justify", value: "justify" }]} />
    </SectionHeader>
  );
}

function ColorControls({ style, onUpdate }: { style: BlockStyle; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const colors = style[device]?.colors || {};
  const set = (key: string, val: string) => {
    const current = style[device] || {};
    const colorsObj = { ...(current.colors || {}), [key]: val };
    onUpdate({ ...style, [device]: { ...current, colors: colorsObj } });
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

function BorderControls({ style, onUpdate }: { style: BlockStyle; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const border = style[device]?.border || {};
  const set = (key: string, val: string) => {
    const current = style[device] || {};
    const borderObj = { ...(current.border || {}), [key]: val };
    onUpdate({ ...style, [device]: { ...current, border: borderObj } });
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

function ShadowControls({ style, onUpdate }: { style: BlockStyle; onUpdate: StyleUpdater }) {
  const { device } = useEditorDevice();
  const shadow = style[device]?.shadow || {};
  const set = (key: string, val: string) => {
    const current = style[device] || {};
    const shadowObj = { ...(current.shadow || {}), [key]: val };
    onUpdate({ ...style, [device]: { ...current, shadow: shadowObj } });
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

export function StylePanel({ block, onUpdate }: { block: Block; onUpdate: (style: BlockStyle) => void }) {
  const style = block.style || {};
  return (
    <div className="space-y-0">
      <LayoutControls style={style} onUpdate={onUpdate} />
      <TypographyControls style={style} onUpdate={onUpdate} />
      <ColorControls style={style} onUpdate={onUpdate} />
      <BorderControls style={style} onUpdate={onUpdate} />
      <ShadowControls style={style} onUpdate={onUpdate} />
    </div>
  );
}
