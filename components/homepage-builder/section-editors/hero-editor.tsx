"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sliders } from "lucide-react";
import type { HeroBreakpoint, HeroEditMode, HeroSettings, HeroSlide } from "@/types/homepage";
import { normalizeHeroSettings, createDefaultHeroSlide, duplicateHeroSlide } from "@/lib/hero";
import { HeroSlideList } from "@/components/homepage-builder/hero/hero-slide-list";
import { HeroSlideEditor } from "@/components/homepage-builder/hero/hero-slide-editor";
import { HeroSliderSettingsEditor } from "@/components/homepage-builder/hero/hero-slider-settings";
import { HeroLivePreview } from "@/components/homepage-builder/hero/hero-live-preview";
import { cn } from "@/lib/utils";

export function HeroEditor({
  settings,
  onChange,
  footer,
}: {
  settings: HeroSettings;
  onChange: (next: HeroSettings) => void;
  footer?: ReactNode;
}) {
  const normalized = normalizeHeroSettings(settings);
  const slides = normalized.slides.length > 0 ? normalized.slides : [createDefaultHeroSlide(0)];

  const [selectedId, setSelectedId] = useState<string | null>(slides[0]?.id ?? null);
  const [mode, setMode] = useState<HeroEditMode>("guided");
  const [breakpoint, setBreakpoint] = useState<HeroBreakpoint>("desktop");
  const [sliderPanelOpen, setSliderPanelOpen] = useState(false);

  const selected = slides.find((s) => s.id === selectedId) ?? slides[0];

  const updateSettings = (next: HeroSettings) => onChange(next);

  const updateSlide = (next: HeroSlide) =>
    updateSettings({ ...normalized, slides: slides.map((s) => (s.id === next.id ? next : s)) });

  const handleAdd = () => {
    const slide = createDefaultHeroSlide(slides.length);
    updateSettings({ ...normalized, slides: [...slides, slide] });
    setSelectedId(slide.id);
  };

  const handleDuplicate = (id: string) => {
    const source = slides.find((s) => s.id === id);
    if (!source) return;
    const copy = duplicateHeroSlide(source);
    copy.order = slides.length;
    updateSettings({ ...normalized, slides: [...slides, copy] });
    setSelectedId(copy.id);
  };

  const handleDelete = (id: string) => {
    if (slides.length <= 1) return; // must keep at least one slide
    const next = slides.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i }));
    updateSettings({ ...normalized, slides: next });
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  const handleToggleEnabled = (id: string, enabled: boolean) =>
    updateSettings({ ...normalized, slides: slides.map((s) => (s.id === id ? { ...s, enabled } : s)) });

  const handleRename = (id: string, name: string) =>
    updateSettings({ ...normalized, slides: slides.map((s) => (s.id === id ? { ...s, name } : s)) });

  if (!selected) return null;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-[15px] font-bold text-foreground">Hero Section Builder</h2>
          <p className="text-[11.5px] text-foreground-muted">
            {slides.length} slide{slides.length !== 1 && "s"} — live preview updates as you edit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-border p-0.5">
            <button
              type="button"
              onClick={() => setMode("guided")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-semibold",
                mode === "guided" ? "bg-primary text-primary-foreground" : "text-foreground-muted"
              )}
            >
              Guided
            </button>
            <button
              type="button"
              onClick={() => setMode("advanced")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-semibold",
                mode === "advanced" ? "bg-primary text-primary-foreground" : "text-foreground-muted"
              )}
            >
              Advanced
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSliderPanelOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold",
              sliderPanelOpen ? "border-primary text-primary" : "border-border text-foreground-muted hover:bg-muted"
            )}
          >
            <Sliders className="h-3.5 w-3.5" /> Slider Settings
          </button>
        </div>
      </div>

      {sliderPanelOpen && (
        <div className="rounded-[var(--radius-md)] border border-border bg-muted/40 p-4">
          <HeroSliderSettingsEditor settings={normalized.slider} onChange={(slider) => updateSettings({ ...normalized, slider })} />
        </div>
      )}

      {/* Two-column builder: slides rail left, preview + selected-slide settings right */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <div className="lg:sticky lg:top-0 lg:max-h-[calc(100vh-220px)] lg:self-start lg:overflow-y-auto">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Slides</p>
          <HeroSlideList
            slides={slides}
            selectedId={selected.id}
            onSelect={setSelectedId}
            onReorder={(next) => updateSettings({ ...normalized, slides: next })}
            onToggleEnabled={handleToggleEnabled}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onRename={handleRename}
            onAdd={handleAdd}
          />
        </div>

        <div className="min-w-0 space-y-4">
          <HeroLivePreview
            settings={normalized}
            breakpoint={breakpoint}
            onBreakpointChange={setBreakpoint}
            activeSlideId={selected.id}
            forceTheme={selected.theme}
          />

          <div>
            <div className="rounded-[var(--radius-md)] border border-border bg-muted/40 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                Selected Slide — {selected.name || "Untitled slide"}
              </p>
              <HeroSlideEditor slide={selected} onChange={updateSlide} mode={mode} />
            </div>
            {footer && <div className="mt-4">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
