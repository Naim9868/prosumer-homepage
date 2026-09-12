import { SectionWrapper } from "@/components/shared/section-wrapper";
import { brandPartners as defaultBrands } from "@/lib/data";
import type { Section } from "@/types/homepage";

export function BrandsSection({ section }: { section: Extract<Section, { type: "brands" }> }) {
  const { title, logos } = section.settings;
  const names = logos.length ? logos.map((l) => l.name) : defaultBrands;
  const loop = [...names, ...names];

  return (
    <SectionWrapper style={{ ...section.style, paddingTop: section.style.paddingTop ?? 56, paddingBottom: section.style.paddingBottom ?? 56 }}>
      {title && (
        <p className="text-eyebrow mb-8 text-center text-[11px] text-foreground-muted">{title}</p>
      )}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-16">
          {loop.map((brand, i) => (
            <span key={`${brand}-${i}`} className="whitespace-nowrap font-heading text-xl font-bold tracking-tight text-foreground-muted opacity-60">
              {brand}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </SectionWrapper>
  );
}
