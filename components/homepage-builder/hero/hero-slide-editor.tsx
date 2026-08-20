"use client";

import { Moon, Sun, Monitor, Smartphone, Tablet, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import type {
  HeroBlockWidths,
  HeroBreakpoint,
  HeroBreakpointData,
  HeroBreakpointStyling,
  HeroColors,
  HeroEditMode,
  HeroEntrance,
  HeroLayout,
  HeroMedia,
  HeroPreset,
  HeroSlide,
  HeroTextPosition,
  HeroTextPositions,
  HeroThemeData,
} from "@/types/homepage";
import { HERO_LAYOUTS, applyHeroPreset, applyHeroTheme, createDefaultHeroSlide, materializeHeroSlide } from "@/lib/hero";
import { Field, FieldGrid, TextInput, TextArea, Select } from "@/components/homepage-builder/fields";
import { ColorField } from "@/components/homepage-builder/hero/controls";
import { EditorSection } from "@/components/homepage-builder/hero/editor-section";
import { PresetPicker } from "@/components/homepage-builder/hero/preset-picker";
import { BadgeListEditor } from "@/components/homepage-builder/hero/badge-list-editor";
import { MediaEditor } from "@/components/homepage-builder/hero/media-editor";
import { HeroResponsiveEditor } from "@/components/homepage-builder/hero/hero-responsive-editor";
import { ButtonSizeEditor } from "@/components/homepage-builder/hero/button-size-editor";
import { BlockWidthsEditor } from "@/components/homepage-builder/hero/block-widths-editor";
import { cn } from "@/lib/utils";

const BUTTON_STYLE_OPTIONS = [
  { label: "Filled", value: "filled" },
  { label: "Outline", value: "outline" },
  { label: "Ghost", value: "ghost" },
];

const ENTRANCE_OPTIONS: { label: string; value: HeroEntrance }[] = [
  { label: "Fade Up", value: "fade-up" },
  { label: "Fade In", value: "fade" },
  { label: "Fade Down", value: "fade-down" },
  { label: "Scale", value: "scale" },
  { label: "None", value: "none" },
];

const DEVICE_TABS: { id: HeroBreakpoint; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

const POSITION_STEP = 4;

function PositionControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: HeroTextPosition;
  onChange: (value: HeroTextPosition) => void;
}) {
  const nudge = (axis: "x" | "y", delta: number) => onChange({ ...value, [axis]: value[axis] + delta });
  const buttonClass =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border text-foreground-muted transition-colors hover:bg-muted hover:text-foreground";

  return (
    <div className="rounded-[var(--radius-sm)] border border-border p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">{label}</p>
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label={`${label} left`} onClick={() => nudge("x", -POSITION_STEP)} className={buttonClass}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <TextInput
            type="number"
            step={1}
            value={value.x}
            onChange={(e) => onChange({ ...value, x: Number(e.target.value) })}
            aria-label={`${label} horizontal offset`}
          />
          <button type="button" aria-label={`${label} right`} onClick={() => nudge("x", POSITION_STEP)} className={buttonClass}>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <span className="w-4 text-center text-[11px] font-bold text-foreground-muted">X</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label={`${label} up`} onClick={() => nudge("y", -POSITION_STEP)} className={buttonClass}>
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <TextInput
            type="number"
            step={1}
            value={value.y}
            onChange={(e) => onChange({ ...value, y: Number(e.target.value) })}
            aria-label={`${label} vertical offset`}
          />
          <button type="button" aria-label={`${label} down`} onClick={() => nudge("y", POSITION_STEP)} className={buttonClass}>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <span className="w-4 text-center text-[11px] font-bold text-foreground-muted">Y</span>
        </div>
      </div>
    </div>
  );
}

/** Heuristic: which preset a slide currently matches, if any. */
function presetFor(slide: HeroSlide): HeroPreset | null {
  if (slide.layout === "cinematic" && slide.theme === "dark") return "cinematic-dark";
  return null;
}

export function HeroSlideEditor({
  slide,
  onChange,
  mode,
  breakpoint,
  onBreakpointChange,
}: {
  slide: HeroSlide;
  onChange: (next: HeroSlide) => void;
  mode: HeroEditMode;
  breakpoint: HeroBreakpoint;
  onBreakpointChange: (bp: HeroBreakpoint) => void;
}) {
  const advanced = mode === "advanced";
  const theme = slide.theme;
  const data = slide.themes[theme];
  const bpData = data.breakpoints[breakpoint];
  const device = DEVICE_TABS.find((d) => d.id === breakpoint) ?? DEVICE_TABS[0];

  /** Patch the active theme (colors or any breakpoint). */
  const setTheme = (patch: Partial<HeroThemeData>) =>
    onChange(materializeHeroSlide({ ...slide, themes: { ...slide.themes, [theme]: { ...data, ...patch } } }, theme));

  /** Patch the active device's full dataset. */
  const setBreakpointData = (patch: Partial<HeroBreakpointData>) =>
    setTheme({ breakpoints: { ...data.breakpoints, [breakpoint]: { ...bpData, ...patch } } });

  /** Patch the active device's styling. */
  const setBreakpointStyling = (patch: Partial<HeroBreakpointStyling>) =>
    setBreakpointData({ styling: { ...bpData.styling, ...patch } });

  const setColors = (patch: Partial<HeroColors>) => setTheme({ colors: { ...data.colors, ...patch } });
  const setContent = (patch: Partial<HeroSlide["content"]>) => setBreakpointData({ content: { ...bpData.content, ...patch } });
  const setButton = (which: "primary" | "secondary", patch: Partial<HeroSlide["buttons"]["primary"]>) =>
    setBreakpointData({
      buttons: {
        ...bpData.buttons,
        [which]: {
          ...bpData.buttons[which],
          ...patch,
          size: { ...bpData.buttons[which].size, ...patch.size },
        },
      },
    });
  const setMedia = (patch: Partial<HeroMedia>) => setBreakpointData({ media: { ...bpData.media, ...patch } });
  const setTypography = (patch: Partial<HeroThemeData["breakpoints"]["desktop"]["styling"]["typography"]>) =>
    setBreakpointStyling({ typography: { ...bpData.styling.typography, ...patch } });
  const setSpacing = (patch: Partial<HeroThemeData["breakpoints"]["desktop"]["styling"]["spacing"]>) =>
    setBreakpointStyling({ spacing: { ...bpData.styling.spacing, ...patch } });
  const setOverlayOpacity = (overlayOpacity: number) => setBreakpointStyling({ overlayOpacity });
  const setTextPositions = (patch: Partial<HeroTextPositions>) =>
    setBreakpointStyling({ textPositions: { ...bpData.styling.textPositions, ...patch } });
  const setBlockWidths = (blockWidths: HeroBlockWidths) => setBreakpointStyling({ blockWidths });
  const setAnimation = (patch: Partial<HeroSlide["animation"]>) => onChange({ ...slide, animation: { ...slide.animation, ...patch } });
  const setLayout = (layout: HeroLayout) => onChange({ ...slide, layout });

  return (
    <div className="space-y-3">
      {/* Device tabs — choose which device's independent setup to edit */}
      <div className="rounded-[var(--radius-md)] border border-border bg-card p-3">
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {DEVICE_TABS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onBreakpointChange(d.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[12px] font-semibold transition-colors",
                breakpoint === d.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <d.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-foreground-muted/70">
          Editing <span className="font-semibold text-foreground">{device.label}</span> for the{" "}
          <span className="font-semibold text-foreground">{theme === "dark" ? "Dark" : "Light"}</span> theme. Every
          device stores its own text, buttons, badges, images, and layout independently.
        </p>
      </div>

      {/* Layout, theme, preset */}
      <EditorSection title="Layout & Theme" defaultOpen>
        <FieldGrid>
          <Field label="Layout">
            <Select
              value={slide.layout}
              onChange={(v) => setLayout(v as HeroLayout)}
              options={HERO_LAYOUTS.map((l) => ({ label: l.label, value: l.value }))}
            />
          </Field>
          <Field label="Theme Mode">
            <div className="flex rounded-full bg-muted p-1">
              <button
                type="button"
                onClick={() => onChange(applyHeroTheme(slide, "dark"))}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                  theme === "dark" ? "bg-foreground text-background shadow-sm" : "text-foreground-muted hover:text-foreground"
                )}
              >
                <Moon className="h-3.5 w-3.5" /> Dark
              </button>
              <button
                type="button"
                onClick={() => onChange(applyHeroTheme(slide, "light"))}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                  theme === "light" ? "bg-foreground text-background shadow-sm" : "text-foreground-muted hover:text-foreground"
                )}
              >
                <Sun className="h-3.5 w-3.5" /> Light
              </button>
            </div>
          </Field>
        </FieldGrid>
        <p className="text-[11px] text-foreground-muted/70">
          Each theme stores its own copy of every device&apos;s text, buttons, badges, images, colors, and layout. Switching
          shows that theme&apos;s setup.
        </p>
        <PresetPicker
          current={presetFor(slide)}
          onApply={(preset) => onChange(applyHeroPreset(slide, preset))}
          onReset={() => onChange({ ...createDefaultHeroSlide(slide.order), id: slide.id, name: slide.name })}
        />
      </EditorSection>

      {/* Text content */}
      <EditorSection title="Text Content" defaultOpen>
        <Field label="Eyebrow">
          <TextInput value={bpData.content.eyebrow} onChange={(e) => setContent({ eyebrow: e.target.value })} placeholder="OPTICAL-GRADE MOBILE LENSES" />
        </Field>
        <Field label="Heading" hint="Wrap a word with {accent}…{/accent} to highlight it in the accent color.">
          <TextInput value={bpData.content.heading} onChange={(e) => setContent({ heading: e.target.value })} placeholder="See what your phone can't." />
        </Field>
        <Field label="Description">
          <TextArea value={bpData.content.description} onChange={(e) => setContent({ description: e.target.value })} rows={3} />
        </Field>
        <p className="text-[11px] text-foreground-muted/70">
          Leave a field empty to hide it — only filled-in text is shown. This text is stored only for the{" "}
          {device.label.toLowerCase()} device you&apos;re editing.
        </p>
      </EditorSection>

      {/* Text position */}
      <EditorSection title="Text Position" defaultOpen>
        <div className="space-y-3">
          <PositionControl
            label="Eyebrow"
            value={bpData.styling.textPositions.eyebrow}
            onChange={(v) => setTextPositions({ eyebrow: v })}
          />
          <PositionControl
            label="Heading"
            value={bpData.styling.textPositions.heading}
            onChange={(v) => setTextPositions({ heading: v })}
          />
          <PositionControl
            label="Description"
            value={bpData.styling.textPositions.description}
            onChange={(v) => setTextPositions({ description: v })}
          />
          <PositionControl
            label="Buttons"
            value={bpData.styling.textPositions.buttons}
            onChange={(v) => setTextPositions({ buttons: v })}
          />
          <PositionControl
            label="Badges"
            value={bpData.styling.textPositions.badges}
            onChange={(v) => setTextPositions({ badges: v })}
          />
        </div>
        <p className="text-[11px] text-foreground-muted/70">
          Move each text element freely with the arrow buttons or type exact pixel offsets. Use a fixed banner height for
          predictable results. Offsets are stored per device.
        </p>
      </EditorSection>

      {/* Text block widths */}
      <EditorSection title="Text Block Widths">
        <BlockWidthsEditor widths={bpData.styling.blockWidths} onChange={setBlockWidths} />
        <p className="text-[11px] text-foreground-muted/70">
          Set a max width (px) for each text block on this device. 0 = auto (fills the column).
        </p>
      </EditorSection>

      {/* Buttons */}
      <EditorSection title="Buttons">
        {(["primary", "secondary"] as const).map((which) => (
          <div key={which} className="space-y-3 rounded-[var(--radius-sm)] border border-border p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
              {which === "primary" ? "Primary Button" : "Secondary Button"}
            </p>
            <FieldGrid>
              <Field label="Label">
                <TextInput value={bpData.buttons[which].text} onChange={(e) => setButton(which, { text: e.target.value })} />
              </Field>
              <Field label="URL">
                <TextInput value={bpData.buttons[which].url} onChange={(e) => setButton(which, { url: e.target.value })} placeholder="#shop-by-lens" />
              </Field>
              <Field label="Style">
                <Select value={bpData.buttons[which].style} onChange={(v) => setButton(which, { style: v as HeroSlide["buttons"]["primary"]["style"] })} options={BUTTON_STYLE_OPTIONS} />
              </Field>
              <ColorField
                label="Text Color"
                value={bpData.buttons[which].textColor || "#000000"}
                onChange={(v) => setButton(which, { textColor: v })}
              />
              <ColorField
                label="Background Color"
                value={bpData.buttons[which].backgroundColor || "#000000"}
                onChange={(v) => setButton(which, { backgroundColor: v })}
              />
              <ColorField
                label="Border Color"
                value={bpData.buttons[which].borderColor || "#000000"}
                onChange={(v) => setButton(which, { borderColor: v })}
              />
            </FieldGrid>
            <ButtonSizeEditor size={bpData.buttons[which].size} onChange={(size) => setButton(which, { size })} />
          </div>
        ))}
        <p className="text-[11px] text-foreground-muted/70">
          Button size settings are stored per device — the {device.label.toLowerCase()} button setup is independent from
          other devices.
        </p>
      </EditorSection>

      {/* Trust badges */}
      <EditorSection title="Trust Badges">
        <BadgeListEditor badges={bpData.badges} onChange={(badges) => setBreakpointData({ badges })} />
      </EditorSection>

      {/* Media */}
      <EditorSection title="Images & Product">
        <MediaEditor media={bpData.media} onChange={setMedia} advanced={advanced} />
      </EditorSection>

      {/* Colors */}
      <EditorSection title="Colors" defaultOpen={!advanced}>
        <FieldGrid>
          <ColorField label="Background" value={data.colors.background} onChange={(v) => setColors({ background: v })} />
          <ColorField label="Heading / Foreground" value={data.colors.foreground} onChange={(v) => setColors({ foreground: v })} />
          <ColorField label="Body / Muted Text" value={data.colors.muted} onChange={(v) => setColors({ muted: v })} />
          <ColorField label="Accent" value={data.colors.accent} onChange={(v) => setColors({ accent: v })} />
        </FieldGrid>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-medium text-foreground-muted">Image Overlay ({device.label})</span>
            <span className="text-[11.5px] font-semibold text-foreground">{Math.round((bpData.styling.overlayOpacity ?? 0) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round((bpData.styling.overlayOpacity ?? 0) * 100)}
            onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
            className="mt-1 w-full accent-[var(--primary)]"
          />
          <p className="mt-1 text-[11px] text-foreground-muted">
            Darkens the background image so text stays readable. 0% keeps the image fully visible. Colors are shared
            across devices; the overlay is per device.
          </p>
        </div>
        {advanced && (
          <FieldGrid>
            <ColorField label="Border" value={data.colors.border} onChange={(v) => setColors({ border: v })} />
            <ColorField label="Card" value={data.colors.card} onChange={(v) => setColors({ card: v })} />
            <ColorField label="Overlay" value={data.colors.overlay} onChange={(v) => setColors({ overlay: v })} />
          </FieldGrid>
        )}
      </EditorSection>

      {/* Per-device layout */}
      <EditorSection title="Device Layout" defaultOpen={!advanced}>
        <HeroResponsiveEditor styling={bpData.styling} onChange={setBreakpointStyling} />
      </EditorSection>

      {/* Typography */}
      <EditorSection title="Typography" advanced={!advanced}>
        {advanced && (
          <>
            <FieldGrid>
              <Field label="Heading Weight">
                <TextInput type="number" min={400} max={900} step={100} value={bpData.styling.typography.headingWeight} onChange={(e) => setTypography({ headingWeight: Number(e.target.value) })} />
              </Field>
              <Field label="Heading Line Height">
                <TextInput type="number" min={0.9} max={1.6} step={0.02} value={bpData.styling.typography.headingLineHeight} onChange={(e) => setTypography({ headingLineHeight: Number(e.target.value) })} />
              </Field>
              <Field label="Heading Letter Spacing (px)">
                <TextInput type="number" min={-3} max={5} step={0.1} value={bpData.styling.typography.headingLetterSpacing} onChange={(e) => setTypography({ headingLetterSpacing: Number(e.target.value) })} />
              </Field>
              <Field label="Eyebrow Letter Spacing (px)">
                <TextInput type="number" min={0} max={6} step={0.1} value={bpData.styling.typography.eyebrowLetterSpacing} onChange={(e) => setTypography({ eyebrowLetterSpacing: Number(e.target.value) })} />
              </Field>
              <Field label="Button Font Size (px)">
                <TextInput type="number" min={11} max={20} value={bpData.styling.typography.buttonFontSize} onChange={(e) => setTypography({ buttonFontSize: Number(e.target.value) })} />
              </Field>
              <Field label="Button Weight">
                <TextInput type="number" min={400} max={900} step={100} value={bpData.styling.typography.buttonWeight} onChange={(e) => setTypography({ buttonWeight: Number(e.target.value) })} />
              </Field>
            </FieldGrid>
            <p className="text-[11px] text-foreground-muted/70">
              Heading, description and eyebrow sizes are set per device in the Device Layout / typography defaults for
              each breakpoint.
            </p>
          </>
        )}
      </EditorSection>

      {/* Spacing */}
      {advanced && (
        <EditorSection title="Spacing" advanced>
          <FieldGrid>
            <Field label="Container Max Width (px)">
              <TextInput type="number" min={600} max={1920} value={bpData.styling.spacing.containerMaxWidth} onChange={(e) => setSpacing({ containerMaxWidth: Number(e.target.value) })} />
            </Field>
            <Field label="Padding Top (px)">
              <TextInput type="number" min={0} max={240} value={bpData.styling.spacing.paddingTop} onChange={(e) => setSpacing({ paddingTop: Number(e.target.value) })} />
            </Field>
            <Field label="Padding Bottom (px)">
              <TextInput type="number" min={0} max={240} value={bpData.styling.spacing.paddingBottom} onChange={(e) => setSpacing({ paddingBottom: Number(e.target.value) })} />
            </Field>
            <Field label="Side Spacing (px)">
              <TextInput type="number" min={0} max={160} value={bpData.styling.spacing.paddingX} onChange={(e) => setSpacing({ paddingX: Number(e.target.value) })} />
            </Field>
            <Field label="Element Gap (px)">
              <TextInput type="number" min={0} max={80} value={bpData.styling.spacing.elementGap} onChange={(e) => setSpacing({ elementGap: Number(e.target.value) })} />
            </Field>
            <Field label="Media Offset (px)">
              <TextInput type="number" min={-200} max={200} value={bpData.styling.spacing.mediaOffset} onChange={(e) => setSpacing({ mediaOffset: Number(e.target.value) })} />
            </Field>
            <Field label="Product Image Offset (px)">
              <TextInput type="number" min={-200} max={200} value={bpData.styling.spacing.productImageOffset} onChange={(e) => setSpacing({ productImageOffset: Number(e.target.value) })} />
            </Field>
          </FieldGrid>
        </EditorSection>
      )}

      {/* Animation */}
      {advanced && (
        <EditorSection title="Animation" advanced>
          <FieldGrid>
            <Field label="Content Entrance">
              <Select value={slide.animation.contentEntrance} onChange={(v) => setAnimation({ contentEntrance: v as HeroEntrance })} options={ENTRANCE_OPTIONS} />
            </Field>
            <Field label="Image Entrance">
              <Select value={slide.animation.imageEntrance} onChange={(v) => setAnimation({ imageEntrance: v as HeroEntrance })} options={ENTRANCE_OPTIONS} />
            </Field>
            <Field label="Badge Entrance">
              <Select value={slide.animation.badgeEntrance} onChange={(v) => setAnimation({ badgeEntrance: v as HeroEntrance })} options={ENTRANCE_OPTIONS} />
            </Field>
            <Field label="CTA Entrance">
              <Select value={slide.animation.ctaEntrance} onChange={(v) => setAnimation({ ctaEntrance: v as HeroEntrance })} options={ENTRANCE_OPTIONS} />
            </Field>
            <Field label="Duration (ms)">
              <TextInput type="number" min={0} max={3000} step={50} value={slide.animation.duration} onChange={(e) => setAnimation({ duration: Number(e.target.value) })} />
            </Field>
            <Field label="Delay (ms)">
              <TextInput type="number" min={0} max={2000} step={50} value={slide.animation.delay} onChange={(e) => setAnimation({ delay: Number(e.target.value) })} />
            </Field>
            <Field label="Stagger (ms)">
              <TextInput type="number" min={0} max={500} step={10} value={slide.animation.stagger} onChange={(e) => setAnimation({ stagger: Number(e.target.value) })} />
            </Field>
          </FieldGrid>
        </EditorSection>
      )}
    </div>
  );
}