"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { Plus, Eye, X, Sun, Moon, Loader2, Check, AlertCircle, Menu, Settings2 } from "lucide-react";
import type { HomepageConfig, Section, PredefinedSectionType, PageSettings } from "@/types/homepage";
import type { CatalogData } from "@/types/catalog";
import { createDefaultSection, createCustomSection } from "@/lib/homepage-defaults";
import { normalizePageSettings, pageCssVars } from "@/lib/page-settings";
import { SectionList } from "@/components/homepage-builder/section-list";
import { SectionEditorPanel } from "@/components/homepage-builder/section-editor-panel";
import { AddSectionModal } from "@/components/homepage-builder/add-section-modal";
import { PageSetupPanel } from "@/components/homepage-builder/page-setup-panel";
import { HomepageRenderer } from "@/components/shared/homepage-renderer";
import { CatalogProvider } from "@/components/shared/catalog-context";
import { useTheme } from "@/components/shared/theme-provider";
import { publishHomepageAction, saveDraftAction } from "@/app/admin/homepage/actions";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved" | "error";

export function HomepageBuilder({
  initialConfig,
  initialCatalog,
}: {
  initialConfig: HomepageConfig;
  initialCatalog?: CatalogData;
}) {
  const { theme, toggleTheme } = useTheme();
  const [sections, setSections] = useState<Section[]>(initialConfig.sections);
  const [savedSections, setSavedSections] = useState<Section[]>(initialConfig.sections);
  const [page, setPage] = useState<PageSettings>(() => normalizePageSettings(initialConfig.page));
  const [savedPage, setSavedPage] = useState<PageSettings>(() => normalizePageSettings(initialConfig.page));
  const [selectedId, setSelectedId] = useState<string | null>(initialConfig.sections[0]?.id ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty = useMemo(
    () => JSON.stringify(sections) !== JSON.stringify(savedSections) || JSON.stringify(page) !== JSON.stringify(savedPage),
    [sections, savedSections, page, savedPage]
  );
  const selectedSection = sections.find((s) => s.id === selectedId) ?? null;

  const updateSection = useCallback((next: Section) => {
    setSections((prev) => prev.map((s) => (s.id === next.id ? next : s)));
  }, []);

  const handleAddPredefined = (type: PredefinedSectionType) => {
    const next = createDefaultSection(type, sections.length);
    setSections((prev) => [...prev, next]);
    setSelectedId(next.id);
    setModalOpen(false);
  };
  const handleAddCustom = () => {
    const next = createCustomSection(sections.length);
    setSections((prev) => [...prev, next]);
    setSelectedId(next.id);
    setModalOpen(false);
  };

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled } : s)));
  };

  const handleDuplicate = (id: string) => {
    const source = sections.find((s) => s.id === id);
    if (!source) return;
    const copy: Section = {
      ...source,
      id: `sec_${Math.random().toString(36).slice(2, 9)}`,
      order: sections.length,
    };
    setSections((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const handleDelete = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSelectSection = (id: string) => {
    setSelectedId(id);
    setSectionMenuOpen(false);
  };

  const persist = (publish: boolean) => {
    setErrorMsg(null);
    setSaveState("saving");
    const config: HomepageConfig = { sections, page, updatedAt: new Date().toISOString(), published: publish };
    startTransition(async () => {
      const result = publish ? await publishHomepageAction(config) : await saveDraftAction(config);
      if (result.success) {
        setSavedSections(result.config.sections);
        setSavedPage(normalizePageSettings(result.config.page));
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } else {
        setSaveState("error");
        setErrorMsg(result.error);
      }
    });
  };

  return (
    <CatalogProvider value={initialCatalog}>
      <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSectionMenuOpen((v) => !v)}
            aria-label="Toggle section menu"
            aria-expanded={sectionMenuOpen}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-[13px] font-semibold text-foreground hover:bg-muted"
          >
            <Menu className="h-4 w-4" /> Sections
          </button>
          <div>
            <h1 className="font-heading text-[15px] font-bold text-foreground">Homepage Builder</h1>
            <p className="text-[11.5px] text-foreground-muted">
              {isDirty ? "Unsaved changes" : "All changes saved"}
              {saveState === "error" && errorMsg && <span className="ml-2 text-destructive">— {errorMsg}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSetupOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-muted"
          >
            <Settings2 className="h-4 w-4" /> Page Setup
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-muted"
          >
            <Plus className="h-4 w-4" /> Add Section
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-muted"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-muted"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button
            type="button"
            disabled={isPending || !isDirty}
            onClick={() => persist(false)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-muted disabled:opacity-40"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => persist(true)}
            className="inline-flex min-w-[112px] items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm hover:scale-[1.02] disabled:opacity-60"
          >
            {saveState === "saving" || isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveState === "saved" ? (
              <Check className="h-4 w-4" />
            ) : saveState === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : null}
            {saveState === "saving" || isPending ? "Publishing…" : saveState === "saved" ? "Published" : "Publish"}
          </button>
        </div>
      </header>

      {/* Main split */}
      <div className="flex flex-1 overflow-hidden">
        <main className={cn("min-w-0 flex-1", selectedSection?.type === "custom" ? "overflow-hidden" : "overflow-y-auto p-6")}>
          {selectedSection ? (
            selectedSection.type === "custom" ? (
              <SectionEditorPanel section={selectedSection} onChange={updateSection} />
            ) : (
              <div className={cn("mx-auto", selectedSection.type === "hero" || selectedSection.type === "whyUs" || selectedSection.type === "categories" || selectedSection.type === "featuredProducts" || selectedSection.type === "newArrivals" || selectedSection.type === "bestSellers" ? "w-full" : "max-w-2xl")}>
                <SectionEditorPanel section={selectedSection} onChange={updateSection} />
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-center text-[13.5px] text-foreground-muted">
              Select a section from the menu to edit it, or add a new one.
            </div>
          )}
        </main>
      </div>

      {/* Section menu drawer — slides in from the left */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity",
          sectionMenuOpen ? "opacity-100 duration-200" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setSectionMenuOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[340px] flex-col border-r border-border bg-background shadow-xl transition-transform duration-300",
            sectionMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Sections</p>
            <button
              type="button"
              onClick={() => setSectionMenuOpen(false)}
              aria-label="Close section menu"
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-foreground-muted hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <SectionList
              sections={sections}
              selectedId={selectedId}
              onSelect={handleSelectSection}
              onReorder={setSections}
              onToggleEnabled={handleToggleEnabled}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          </div>
        </aside>
      </div>

      {/* Live preview overlay — reflects local state instantly, no refresh */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
            <p className="text-[13px] font-semibold text-foreground">Live Preview</p>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" /> Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto" style={pageCssVars(page)}>
            <HomepageRenderer sections={sections} previewMode catalog={initialCatalog} />
          </div>
        </div>
      )}

      {setupOpen && <PageSetupPanel page={page} onChange={setPage} onClose={() => setSetupOpen(false)} />}

      <AddSectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddPredefined={handleAddPredefined}
        onAddCustom={handleAddCustom}
      />

      <span className={cn("sr-only", isPending && "not-sr-only")} aria-live="polite">
        {isPending ? "Saving homepage…" : ""}
      </span>
      </div>
    </CatalogProvider>
  );
}
