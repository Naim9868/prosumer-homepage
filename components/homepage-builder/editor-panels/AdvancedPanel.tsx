"use client";
import type { Block, BlockAdvanced, BlockVisibility, BlockAnimation, BlockAnimationType } from "@/types/homepage";
import { useEditorDevice } from "@/components/homepage-builder/editor-context";
import { SectionHeader } from "@/components/homepage-builder/editor-controls/SectionHeader";
import { ToggleControl } from "@/components/homepage-builder/editor-controls/ToggleControl";
import { SelectControl } from "@/components/homepage-builder/editor-controls/SelectControl";
import { ResponsiveInput } from "@/components/homepage-builder/editor-controls/ResponsiveInput";
import { ANIMATION_TYPES, EASING_OPTIONS } from "@/lib/style-utils";

function VisibilityControls({ visibility, onChange }: { visibility: BlockVisibility; onChange: (v: BlockVisibility) => void }) {
  return (
    <SectionHeader title="Responsive Visibility">
      <ToggleControl label="Hide on Desktop" checked={visibility.desktop === false} onChange={(v) => onChange({ ...visibility, desktop: !v })} />
      <ToggleControl label="Hide on Tablet" checked={visibility.tablet === false} onChange={(v) => onChange({ ...visibility, tablet: !v })} />
      <ToggleControl label="Hide on Mobile" checked={visibility.mobile === false} onChange={(v) => onChange({ ...visibility, mobile: !v })} />
    </SectionHeader>
  );
}

function AttributeControls({ advanced, onChange }: { advanced: BlockAdvanced; onChange: (v: BlockAdvanced) => void }) {
  return (
    <SectionHeader title="Attributes">
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>HTML ID</span>
        <input
          type="text"
          value={advanced.cssId || ""}
          onChange={(e) => onChange({ ...advanced, cssId: e.target.value })}
          placeholder="my-element"
          className="mt-1.5 w-full rounded border px-2 py-1.5 text-[12px]"
          style={{ borderColor: "var(--editor-input-border)", background: "var(--editor-input-bg)", color: "var(--editor-text)" }}
        />
      </label>
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>CSS Classes</span>
        <input
          type="text"
          value={advanced.cssClasses || ""}
          onChange={(e) => onChange({ ...advanced, cssClasses: e.target.value })}
          placeholder="class1 class2"
          className="mt-1.5 w-full rounded border px-2 py-1.5 text-[12px]"
          style={{ borderColor: "var(--editor-input-border)", background: "var(--editor-input-bg)", color: "var(--editor-text)" }}
        />
      </label>
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>Custom Attributes</span>
        <input
          type="text"
          value={advanced.customAttributes || ""}
          onChange={(e) => onChange({ ...advanced, customAttributes: e.target.value })}
          placeholder='data-key="value"'
          className="mt-1.5 w-full rounded border px-2 py-1.5 text-[12px]"
          style={{ borderColor: "var(--editor-input-border)", background: "var(--editor-input-bg)", color: "var(--editor-text)" }}
        />
      </label>
    </SectionHeader>
  );
}

function AnimationControls({ animation, onChange }: { animation: BlockAnimation; onChange: (v: BlockAnimation) => void }) {
  return (
    <SectionHeader title="Animation">
      <SelectControl label="Animation Type" value={animation.type || "none"} onChange={(v) => onChange({ ...animation, type: v as BlockAnimationType })} options={ANIMATION_TYPES} />
      {animation.type && animation.type !== "none" && (
        <>
          <ResponsiveInput label="Duration (ms)" value={animation.duration ? { desktop: String(animation.duration) } : {}} onChange={(v) => onChange({ ...animation, duration: Number(v.desktop) || 500 })} placeholder="500" type="number" />
          <ResponsiveInput label="Delay (ms)" value={animation.delay ? { desktop: String(animation.delay) } : {}} onChange={(v) => onChange({ ...animation, delay: Number(v.desktop) || 0 })} placeholder="0" type="number" />
          <SelectControl label="Easing" value={animation.easing || ""} onChange={(v) => onChange({ ...animation, easing: v })} options={[{ label: "Default", value: "" }, ...EASING_OPTIONS]} />
        </>
      )}
    </SectionHeader>
  );
}

function CustomCSSControl({ css, onChange }: { css: string; onChange: (v: string) => void }) {
  return (
    <SectionHeader title="Custom CSS" defaultOpen={false}>
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--editor-text-muted)" }}>Custom CSS for this element</span>
        <textarea
          value={css}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="color: red; font-size: 20px;"
          className="mt-1.5 w-full resize-y rounded border px-2 py-1.5 font-mono text-[12px]"
          style={{ borderColor: "var(--editor-input-border)", background: "var(--editor-input-bg)", color: "var(--editor-text)" }}
        />
      </label>
    </SectionHeader>
  );
}

export function AdvancedPanel({ block, onUpdate }: { block: Block; onUpdate: (advanced: BlockAdvanced) => void }) {
  const advanced = block.advanced || {};
  return (
    <div className="space-y-0">
      <VisibilityControls visibility={advanced.visibility || {}} onChange={(v) => onUpdate({ ...advanced, visibility: v })} />
      <AttributeControls advanced={advanced} onChange={onUpdate} />
      <AnimationControls animation={advanced.animation || {}} onChange={(v) => onUpdate({ ...advanced, animation: v })} />
      <CustomCSSControl css={advanced.customCSS || ""} onChange={(v) => onUpdate({ ...advanced, customCSS: v })} />
    </div>
  );
}
