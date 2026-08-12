import { SECTION_REGISTRY } from "@/registry/section-registry";
import type { Section } from "@/types/homepage";
import type { CatalogData } from "@/types/catalog";

export function HomepageRenderer({
  sections,
  catalog,
  previewMode = false,
}: {
  sections: Section[];
  catalog?: CatalogData;
  previewMode?: boolean;
}) {
  const visible = previewMode ? sections : sections.filter((s) => s.enabled);
  const sorted = [...visible].sort((a, b) => a.order - b.order);

  return (
    <>
      {sorted.map((section) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Component = SECTION_REGISTRY[section.type] as any;
        if (!Component) return null;
        if (previewMode && !section.enabled) {
          return (
            <div key={section.id} className="relative opacity-40 grayscale">
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/40">
                <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
                  Disabled
                </span>
              </div>
              <Component section={section} catalog={catalog} preview={previewMode} />
            </div>
          );
        }
        return <Component key={section.id} section={section} catalog={catalog} preview={previewMode} />;
      })}
    </>
  );
}
