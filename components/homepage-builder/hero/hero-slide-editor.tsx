"use client";

import { Moon, Sun, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import type {
  HeroEditMode,
  HeroEntrance,
  HeroLayout,
  HeroMedia,
  HeroPreset,
  HeroResponsive,
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
}: {
  slide: HeroSlide;
  onChange: (next: HeroSlide) => void;
  mode: HeroEditMode;
}) {
  const advanced = mode === "advanced";
  const theme = slide.theme;
  const data = slide.themes[theme];

  /** Update the active theme's dataset, then re-materialize the top-level mirror. */
  const setThemeData = (patch: Partial<HeroThemeData>) =>
    onChange(materializeHeroSlide({ ...slide, themes: { ...slide.themes, [theme]: { ...data, ...patch } } }, theme));

  const setContent = (patch: Partial<HeroSlide["content"]>) => setThemeData({ content: { ...data.content, ...patch } });
  const setButton = (which: "primary" | "secondary", patch: Partial<HeroSlide["buttons"]["primary"]>) =>
    setThemeData({ buttons: { ...data.buttons, [which]: { ...data.buttons[which], ...patch } } });
  const setMedia = (patch: Partial<HeroMedia>) => setThemeData({ media: { ...data.media, ...patch } });
  const setColors = (patch: Partial<HeroThemeData["styling"]["colors"]>) =>
    setThemeData({ styling: { ...data.styling, colors: { ...data.styling.colors, ...patch } } });
  const setTypography = (patch: Partial<HeroThemeData["styling"]["typography"]>) =>
    setThemeData({ styling: { ...data.styling, typography: { ...data.styling.typography, ...patch } } });
  const setSpacing = (patch: Partial<HeroThemeData["styling"]["spacing"]>) =>
    setThemeData({ styling: { ...data.styling, spacing: { ...data.styling.spacing, ...patch } } });
  const setOverlayOpacity = (overlayOpacity: number) =>
    setThemeData({ styling: { ...data.styling, overlayOpacity } });
  const setTextPositions = (patch: Partial<HeroTextPositions>) =>
    setThemeData({ styling: { ...data.styling, textPositions: { ...data.styling.textPositions, ...patch } } });
  const setResponsive = (responsive: HeroResponsive) => setThemeData({ responsive });
  const setAnimation = (patch: Partial<HeroSlide["animation"]>) => onChange({ ...slide, animation: { ...slide.animation, ...patch } });
  const setLayout = (layout: HeroLayout) => onChange({ ...slide, layout });

  return (
    <div className="space-y-3">
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
          Each theme stores its own text, buttons, badges, image, colors, and responsive settings. Switching shows that theme&apos;s copy.
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
          <TextInput value={data.content.eyebrow} onChange={(e) => setContent({ eyebrow: e.target.value })} placeholder="OPTICAL-GRADE MOBILE LENSES" />
        </Field>
        <Field label="Heading" hint="Wrap a word with {accent}…{/accent} to highlight it in the accent color.">
          <TextInput value={data.content.heading} onChange={(e) => setContent({ heading: e.target.value })} placeholder="See what your phone can't." />
        </Field>
        <Field label="Description">
          <TextArea value={data.content.description} onChange={(e) => setContent({ description: e.target.value })} rows={3} />
        </Field>
        <p className="text-[11px] text-foreground-muted/70">
          Leave a field empty to hide it — only filled-in text is shown.
        </p>
      </EditorSection>

      {/* Text position */}
      <EditorSection title="Text Position" defaultOpen>
        <div className="space-y-3">
          <PositionControl
            label="Eyebrow"
            value={data.styling.textPositions.eyebrow}
            onChange={(v) => setTextPositions({ eyebrow: v })}
          />
          <PositionControl
            label="Heading"
            value={data.styling.textPositions.heading}
            onChange={(v) => setTextPositions({ heading: v })}
          />
          <PositionControl
            label="Description"
            value={data.styling.textPositions.description}
            onChange={(v) => setTextPositions({ description: v })}
          />
          <PositionControl
            label="Buttons"
            value={data.styling.textPositions.buttons}
            onChange={(v) => setTextPositions({ buttons: v })}
          />
          <PositionControl
            label="Badges"
            value={data.styling.textPositions.badges}
            onChange={(v) => setTextPositions({ badges: v })}
          />
        </div>
        <p className="text-[11px] text-foreground-muted/70">
          Move each text element freely with the arrow buttons or type exact pixel offsets. Use a fixed banner height for predictable results.
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
                <TextInput value={data.buttons[which].text} onChange={(e) => setButton(which, { text: e.target.value })} />
              </Field>
              <Field label="URL">
                <TextInput value={data.buttons[which].url} onChange={(e) => setButton(which, { url: e.target.value })} placeholder="#shop-by-lens" />
              </Field>
              <Field label="Style">
                <Select value={data.buttons[which].style} onChange={(v) => setButton(which, { style: v as HeroSlide["buttons"]["primary"]["style"] })} options={BUTTON_STYLE_OPTIONS} />
              </Field>
            </FieldGrid>
          </div>
        ))}
      </EditorSection>

      {/* Trust badges */}
      <EditorSection title="Trust Badges">
        <BadgeListEditor badges={data.badges} onChange={(badges) => setThemeData({ badges })} />
      </EditorSection>

      {/* Media */}
      <EditorSection title="Images & Product">
        <MediaEditor media={data.media} onChange={setMedia} advanced={advanced} />
      </EditorSection>

      {/* Colors */}
      <EditorSection title="Colors" defaultOpen={!advanced}>
        <FieldGrid>
          <ColorField label="Background" value={data.styling.colors.background} onChange={(v) => setColors({ background: v })} />
          <ColorField label="Heading / Foreground" value={data.styling.colors.foreground} onChange={(v) => setColors({ foreground: v })} />
          <ColorField label="Body / Muted Text" value={data.styling.colors.muted} onChange={(v) => setColors({ muted: v })} />
          <ColorField label="Accent" value={data.styling.colors.accent} onChange={(v) => setColors({ accent: v })} />
        </FieldGrid>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-medium text-foreground-muted">Image Overlay</span>
            <span className="text-[11.5px] font-semibold text-foreground">{Math.round((data.styling.overlayOpacity ?? 0) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round((data.styling.overlayOpacity ?? 0) * 100)}
            onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
            className="mt-1 w-full accent-[var(--primary)]"
          />
          <p className="mt-1 text-[11px] text-foreground-muted">
            Darkens the background image so text stays readable. 0% keeps the image fully visible.
          </p>
        </div>
        {advanced && (
          <FieldGrid>
            <ColorField label="Border" value={data.styling.colors.border} onChange={(v) => setColors({ border: v })} />
            <ColorField label="Card" value={data.styling.colors.card} onChange={(v) => setColors({ card: v })} />
            <ColorField label="Overlay" value={data.styling.colors.overlay} onChange={(v) => setColors({ overlay: v })} />
          </FieldGrid>
        )}
      </EditorSection>

      {/* Responsive / mobile overrides */}
      <EditorSection title="Responsive" defaultOpen={!advanced}>
        <HeroResponsiveEditor responsive={data.responsive} onChange={setResponsive} />
      </EditorSection>

      {/* Typography */}
      <EditorSection title="Typography" advanced={!advanced}>
        {advanced && (
          <>
            <FieldGrid>
              <Field label="Heading Weight">
                <TextInput type="number" min={400} max={900} step={100} value={data.styling.typography.headingWeight} onChange={(e) => setTypography({ headingWeight: Number(e.target.value) })} />
              </Field>
              <Field label="Heading Line Height">
                <TextInput type="number" min={0.9} max={1.6} step={0.02} value={data.styling.typography.headingLineHeight} onChange={(e) => setTypography({ headingLineHeight: Number(e.target.value) })} />
              </Field>
              <Field label="Heading Letter Spacing (px)">
                <TextInput type="number" min={-3} max={5} step={0.1} value={data.styling.typography.headingLetterSpacing} onChange={(e) => setTypography({ headingLetterSpacing: Number(e.target.value) })} />
              </Field>
              <Field label="Eyebrow Letter Spacing (px)">
                <TextInput type="number" min={0} max={6} step={0.1} value={data.styling.typography.eyebrowLetterSpacing} onChange={(e) => setTypography({ eyebrowLetterSpacing: Number(e.target.value) })} />
              </Field>
              <Field label="Button Font Size (px)">
                <TextInput type="number" min={11} max={20} value={data.styling.typography.buttonFontSize} onChange={(e) => setTypography({ buttonFontSize: Number(e.target.value) })} />
              </Field>
              <Field label="Button Weight">
                <TextInput type="number" min={400} max={900} step={100} value={data.styling.typography.buttonWeight} onChange={(e) => setTypography({ buttonWeight: Number(e.target.value) })} />
              </Field>
            </FieldGrid>
            <p className="text-[11px] text-foreground-muted/70">
              Heading, description and eyebrow sizes are set per device in the Responsive section.
            </p>
          </>
        )}
      </EditorSection>

      {/* Spacing */}
      {advanced && (
        <EditorSection title="Spacing" advanced>
          <FieldGrid>
            <Field label="Container Max Width (px)">
              <TextInput type="number" min={600} max={1920} value={data.styling.spacing.containerMaxWidth} onChange={(e) => setSpacing({ containerMaxWidth: Number(e.target.value) })} />
            </Field>
            <Field label="Padding Top (px)">
              <TextInput type="number" min={0} max={240} value={data.styling.spacing.paddingTop} onChange={(e) => setSpacing({ paddingTop: Number(e.target.value) })} />
            </Field>
            <Field label="Padding Bottom (px)">
              <TextInput type="number" min={0} max={240} value={data.styling.spacing.paddingBottom} onChange={(e) => setSpacing({ paddingBottom: Number(e.target.value) })} />
            </Field>
            <Field label="Side Spacing (px)">
              <TextInput type="number" min={0} max={160} value={data.styling.spacing.paddingX} onChange={(e) => setSpacing({ paddingX: Number(e.target.value) })} />
            </Field>
            <Field label="Element Gap (px)">
              <TextInput type="number" min={0} max={80} value={data.styling.spacing.elementGap} onChange={(e) => setSpacing({ elementGap: Number(e.target.value) })} />
            </Field>
            <Field label="Media Offset (px)">
              <TextInput type="number" min={-200} max={200} value={data.styling.spacing.mediaOffset} onChange={(e) => setSpacing({ mediaOffset: Number(e.target.value) })} />
            </Field>
            <Field label="Product Image Offset (px)">
              <TextInput type="number" min={-200} max={200} value={data.styling.spacing.productImageOffset} onChange={(e) => setSpacing({ productImageOffset: Number(e.target.value) })} />
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
