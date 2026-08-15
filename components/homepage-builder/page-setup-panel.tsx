"use client";

import type { PageSettings } from "@/types/homepage";
import { Field, FieldGrid, TextInput, Toggle } from "@/components/homepage-builder/fields";
import { X } from "lucide-react";

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
            </FieldGrid>
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