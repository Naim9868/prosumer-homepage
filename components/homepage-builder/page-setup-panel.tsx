"use client";

import type { PageSettings, TrustBadge } from "@/types/homepage";
import { Field, FieldGrid, TextInput, Toggle, ColorField, Select } from "@/components/homepage-builder/fields";
import { X, Plus, Trash2 } from "lucide-react";

const FONT_OPTIONS = [
  { label: "Theme default (Inter)", value: "" },
  { label: "Manrope (Heading)", value: "'Manrope', ui-sans-serif, system-ui, sans-serif" },
  { label: "Inter (Body)", value: "'Inter', ui-sans-serif, system-ui, sans-serif" },
];

const FONT_WEIGHT_OPTIONS = [
  { label: "Default (500)", value: "0" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semibold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "Extra Bold (800)", value: "800" },
];

export function PageSetupPanel({
  page,
  onChange,
  onClose,
}: {
  page: PageSettings;
  onChange: (next: PageSettings) => void;
  onClose: () => void;
}) {
  const set = <K extends keyof PageSettings>(key: K, value: PageSettings[K]) => onChange({ ...page, [key]: value });
  const setNavbar = (patch: Partial<PageSettings["navbar"]>) => onChange({ ...page, navbar: { ...page.navbar, ...patch } });
  const setFooter = (patch: Partial<PageSettings["footer"]>) => onChange({ ...page, footer: { ...page.footer, ...patch } });
  const setTrustBadges = (patch: Partial<PageSettings["trustBadges"]>) => onChange({ ...page, trustBadges: { ...page.trustBadges, ...patch } });
  const setProductGrid = (device: "desktop" | "tablet", patch: Partial<{ columns: number; gap: number }>) =>
    onChange({
      ...page,
      productGrid: {
        ...page.productGrid,
        [device]: { ...page.productGrid[device], ...patch },
      },
    });

  const updateBadge = (index: number, patch: Partial<TrustBadge>) => {
    const badges = [...page.trustBadges.badges];
    badges[index] = { ...badges[index], ...patch };
    setTrustBadges({ badges });
  };

  const addBadge = () => {
    setTrustBadges({ badges: [...page.trustBadges.badges, { icon: "Shield", title: "", subtitle: "" }] });
  };

  const removeBadge = (index: number) => {
    setTrustBadges({ badges: page.trustBadges.badges.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative max-h-[85vh] w-[min(660px,94vw)] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-[15px] font-bold text-foreground">Page Setup</h2>
            <p className="text-[11.5px] text-foreground-muted">Global layout, navbar and footer.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close page setup"
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-foreground-muted hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <section className="space-y-4 rounded-[var(--radius-md)] border border-border bg-muted/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Page Layout</p>
            <FieldGrid>
              <Field label="Page Width (px)" hint="Maximum content width of the page.">
                <TextInput
                  type="number"
                  min={960}
                  max={2560}
                  value={page.containerWidth}
                  onChange={(e) => set("containerWidth", Number(e.target.value))}
                />
              </Field>
              <Field label="Side Gap (px)" hint="Left / right page padding on desktop.">
                <TextInput
                  type="number"
                  min={0}
                  max={200}
                  value={page.sidePadding}
                  onChange={(e) => set("sidePadding", Number(e.target.value))}
                />
              </Field>
              <Field label="Products Per Page" hint="Number of products on /products listing.">
                <TextInput
                  type="number"
                  min={4}
                  max={100}
                  value={page.productsPerPage}
                  onChange={(e) => set("productsPerPage", Number(e.target.value))}
                />
              </Field>
            </FieldGrid>
          </section>

          <section className="space-y-4 rounded-[var(--radius-md)] border border-border bg-muted/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Product Grid (/products)</p>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="mb-2 text-[11px] font-semibold text-foreground-muted">Desktop (≥1024px)</p>
                <FieldGrid>
                  <Field label="Columns" hint="Cards per row (2–6).">
                    <TextInput
                      type="number"
                      min={2}
                      max={6}
                      value={page.productGrid.desktop.columns}
                      onChange={(e) => setProductGrid("desktop", { columns: Math.max(2, Math.min(6, Number(e.target.value) || 2)) })}
                    />
                  </Field>
                  <Field label="Gap (px)" hint="Space between cards.">
                    <TextInput
                      type="number"
                      min={0}
                      max={60}
                      value={page.productGrid.desktop.gap}
                      onChange={(e) => setProductGrid("desktop", { gap: Math.max(0, Math.min(60, Number(e.target.value) || 0)) })}
                    />
                  </Field>
                </FieldGrid>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="mb-2 text-[11px] font-semibold text-foreground-muted">Tablet (640px–1023px)</p>
                <FieldGrid>
                  <Field label="Columns" hint="Cards per row (2–6).">
                    <TextInput
                      type="number"
                      min={2}
                      max={6}
                      value={page.productGrid.tablet.columns}
                      onChange={(e) => setProductGrid("tablet", { columns: Math.max(2, Math.min(6, Number(e.target.value) || 2)) })}
                    />
                  </Field>
                  <Field label="Gap (px)" hint="Space between cards.">
                    <TextInput
                      type="number"
                      min={0}
                      max={60}
                      value={page.productGrid.tablet.gap}
                      onChange={(e) => setProductGrid("tablet", { gap: Math.max(0, Math.min(60, Number(e.target.value) || 0)) })}
                    />
                  </Field>
                </FieldGrid>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-[var(--radius-md)] border border-border bg-muted/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Navbar</p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <Toggle checked={page.navbar.enabled} onChange={(v) => setNavbar({ enabled: v })} label="Show navbar" />
                Show navbar
              </label>
              <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <Toggle checked={page.navbar.fixed} onChange={(v) => setNavbar({ fixed: v })} label="Fixed on scroll" />
                Fixed on scroll
              </label>
              <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <Toggle
                  checked={page.navbar.transparent}
                  onChange={(v) => setNavbar({ transparent: v })}
                  label="Transparent at top"
                />
                Transparent at top
              </label>
            </div>
            <Field label="Navbar Height (px)">
              <TextInput
                type="number"
                min={40}
                max={140}
                value={page.navbar.height}
                onChange={(e) => setNavbar({ height: Number(e.target.value) })}
              />
            </Field>
            <Field label="Background Opacity" hint="Only applies when Background Color is set.">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={page.navbar.opacity ?? 0.72}
                  onChange={(e) => setNavbar({ opacity: Number(e.target.value) })}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
                <span className="w-10 text-right text-[12px] font-medium text-foreground-muted tabular-nums">
                  {Math.round((page.navbar.opacity ?? 0.72) * 100)}%
                </span>
              </div>
            </Field>

            <p className="pt-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Colors</p>
            <FieldGrid>
              <ColorField
                label="Background Color"
                value={page.navbar.backgroundColor}
                onChange={(v) => setNavbar({ backgroundColor: v })}
              />
              <ColorField label="Text Color" value={page.navbar.textColor} onChange={(v) => setNavbar({ textColor: v })} />
              <ColorField
                label="Muted Text Color"
                value={page.navbar.mutedTextColor}
                onChange={(v) => setNavbar({ mutedTextColor: v })}
              />
              <ColorField label="Hover Color" value={page.navbar.hoverColor} onChange={(v) => setNavbar({ hoverColor: v })} />
              <ColorField
                label="Hover Background"
                value={page.navbar.hoverBackgroundColor}
                onChange={(v) => setNavbar({ hoverBackgroundColor: v })}
              />
              <ColorField label="Border Color" value={page.navbar.borderColor} onChange={(v) => setNavbar({ borderColor: v })} />
              <ColorField
                label="Accent Color"
                value={page.navbar.accentColor}
                onChange={(v) => setNavbar({ accentColor: v })}
              />
              <ColorField
                label="Button / Badge Text"
                value={page.navbar.buttonTextColor}
                onChange={(v) => setNavbar({ buttonTextColor: v })}
              />
            </FieldGrid>

            <p className="pt-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Typography</p>
            <FieldGrid>
              <Field label="Font Family">
                <Select
                  value={page.navbar.fontFamily}
                  onChange={(v) => setNavbar({ fontFamily: v })}
                  options={FONT_OPTIONS}
                />
              </Field>
              <Field label="Link Font Weight">
                <Select
                  value={String(page.navbar.fontWeight)}
                  onChange={(v) => setNavbar({ fontWeight: Number(v) })}
                  options={FONT_WEIGHT_OPTIONS}
                />
              </Field>
              <Field label="Link Font Size (px)">
                <TextInput
                  type="number"
                  min={0}
                  max={32}
                  value={page.navbar.fontSize}
                  onChange={(e) => setNavbar({ fontSize: Number(e.target.value) })}
                />
              </Field>
            </FieldGrid>
          </section>

          <section className="space-y-4 rounded-[var(--radius-md)] border border-border bg-muted/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Footer</p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <Toggle checked={page.footer.enabled} onChange={(v) => setFooter({ enabled: v })} label="Show footer" />
                Show footer
              </label>
            </div>
            <FieldGrid>
              <Field label="Background Color">
                <TextInput
                  type="text"
                  placeholder="transparent, #ffffff, var(--muted)…"
                  value={page.footer.backgroundColor}
                  onChange={(e) => setFooter({ backgroundColor: e.target.value })}
                />
              </Field>
              <Field label="Padding Top (px)">
                <TextInput
                  type="number"
                  min={0}
                  max={200}
                  value={page.footer.paddingTop}
                  onChange={(e) => setFooter({ paddingTop: Number(e.target.value) })}
                />
              </Field>
            </FieldGrid>
          </section>

          <section className="space-y-4 rounded-[var(--radius-md)] border border-border bg-muted/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Trust Badges</p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <Toggle checked={page.trustBadges.enabled} onChange={(v) => setTrustBadges({ enabled: v })} label="Show trust badges" />
                Show trust badges
              </label>
            </div>
            {page.trustBadges.enabled && (
              <div className="space-y-3">
                {page.trustBadges.badges.map((badge, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-lg border border-border bg-background p-3">
                    <div className="flex-1 space-y-2">
                      <Field label="Icon">
                        <Select
                          value={badge.icon}
                          onChange={(v) => updateBadge(idx, { icon: v })}
                          options={[
                            { label: "Truck", value: "Truck" },
                            { label: "Shield", value: "Shield" },
                            { label: "RotateCcw", value: "RotateCcw" },
                            { label: "Package", value: "Package" },
                            { label: "Clock", value: "Clock" },
                            { label: "Star", value: "Star" },
                            { label: "Award", value: "Award" },
                            { label: "Zap", value: "Zap" },
                            { label: "CheckCircle", value: "CheckCircle" },
                          ]}
                        />
                      </Field>
                      <Field label="Title">
                        <TextInput
                          value={badge.title}
                          onChange={(e) => updateBadge(idx, { title: e.target.value })}
                          placeholder="e.g. Free Shipping"
                        />
                      </Field>
                      <Field label="Subtitle">
                        <TextInput
                          value={badge.subtitle}
                          onChange={(e) => updateBadge(idx, { subtitle: e.target.value })}
                          placeholder="e.g. On orders ৳1500+"
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBadge(idx)}
                      className="mt-6 rounded p-1 text-foreground-muted hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBadge}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-[12px] font-medium text-foreground-muted hover:border-primary/50 hover:text-primary"
                >
                  <Plus size={14} /> Add Badge
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm hover:scale-[1.02]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}