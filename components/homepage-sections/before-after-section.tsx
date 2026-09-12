"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { BeforeAfterSlider } from "@/components/shared/before-after-slider";
import { useTheme } from "@/components/shared/theme-provider";
import type { CatalogData } from "@/types/catalog";
import type { BeforeAfterItem, BeforeAfterLayout, BeforeAfterResponsiveStyle, CatTheme, EditorDevice, Section } from "@/types/homepage";

function styleFor(map: BeforeAfterResponsiveStyle | undefined, device: EditorDevice, theme: CatTheme): CSSProperties {
  const style = map?.[device]?.[theme] ?? map?.desktop?.[theme] ?? {};
  return {
    fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing, color: style.color, backgroundColor: style.backgroundColor, borderColor: style.borderColor,
    borderWidth: style.borderWidth, borderStyle: style.borderStyle, borderRadius: style.borderRadius, width: style.width, height: style.height,
    paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, paddingLeft: style.paddingLeft,
    paddingRight: style.paddingRight, marginTop: style.marginTop, marginBottom: style.marginBottom, marginLeft: style.marginLeft, marginRight: style.marginRight, textAlign: style.textAlign,
  };
}

const fallbackLayout: BeforeAfterLayout = { layoutMode: "row", imageWidth: 1080, imageAspectRatio: 1.6, contentGap: 32, categoryGap: 8, itemGap: 8, imageColumnPercent: 75, contentColumnPercent: 25 };

export function BeforeAfterSection({ section, catalog, breakpoint, forceTheme }: { section: Extract<Section, { type: "beforeAfter" }>; catalog?: CatalogData; breakpoint?: EditorDevice; forceTheme?: CatTheme }) {
  const settings = section.settings;
  const { theme } = useTheme();
  const [device, setDevice] = useState<EditorDevice>(breakpoint ?? "desktop");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");

  useEffect(() => {
    if (breakpoint) return undefined;
    const update = () => setDevice(window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop");
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  const categories = [...(settings.categories ?? [])].filter((category) => category.isActive).sort((a, b) => a.order - b.order);
  const items = [...(settings.items ?? [])].filter((item) => item.isActive && item.beforeImage && item.afterImage).sort((a, b) => a.order - b.order);
  const legacyItem: BeforeAfterItem | null = settings.beforeImage && settings.afterImage ? {
    id: "legacy-before-after", title: settings.title, description: settings.subtitle, categoryId: "legacy",
    beforeImage: settings.beforeImage, afterImage: settings.afterImage, beforeLabel: settings.beforeLabel || "Before",
    afterLabel: settings.afterLabel || "After", buttonText: "", isActive: true, order: 0,
  } : null;
  const availableItems = items.length ? items : legacyItem ? [legacyItem] : [];
  const activeCategory = selectedCategory || categories[0]?.id || "";
  const visibleItems = categories.length ? availableItems.filter((item) => item.categoryId === activeCategory) : availableItems;
  const activeItem = visibleItems.find((item) => item.id === selectedItemId) ?? visibleItems[0];
  const product = activeItem?.productId ? catalog?.products.find((candidate) => candidate.id === activeItem.productId) : undefined;
  const layout = { ...fallbackLayout, ...(settings.layout?.desktop ?? {}), ...(settings.layout?.[device] ?? {}) };
  const currentTheme: CatTheme = forceTheme ?? theme;
  const headingStyle = styleFor(settings.headingStyle, device, currentTheme);
  const subtitleStyle = styleFor(settings.subtitleStyle, device, currentTheme);
  const categoryStyle = styleFor(settings.categoryStyle, device, currentTheme);
  const activeCategoryStyle = styleFor(settings.activeCategoryStyle, device, currentTheme);
  const itemTitleStyle = styleFor(settings.itemTitleStyle, device, currentTheme);
  const itemDescriptionStyle = styleFor(settings.itemDescriptionStyle, device, currentTheme);
  const ctaStyle = styleFor(settings.ctaStyle, device, currentTheme);
  const comparisonStyle = styleFor(settings.comparisonStyle, device, currentTheme);

  if (!activeItem) return null;
  return (
    <SectionWrapper style={section.style}>
      <div style={styleFor(settings.sectionStyle, device, currentTheme)}>
      <div className="mx-auto max-w-2xl text-center" style={headingStyle}>
        {settings.eyebrow && <p className="text-eyebrow text-[11px] text-primary">{settings.eyebrow}</p>}
        <h2 className="text-section-title mt-3 text-balance font-heading text-[clamp(1.75rem,3.4vw,2.75rem)]" style={headingStyle}>{settings.title}</h2>
        {settings.subtitle && <p className="text-body-premium mt-4 text-[15px]" style={subtitleStyle}>{settings.subtitle}</p>}
      </div>
      {categories.length > 0 && (
        <div className="mt-8 flex overflow-x-auto pb-2 sm:justify-center" style={{ gap: layout.categoryGap }} role="tablist" aria-label="Comparison categories">
          {categories.map((category) => <button key={category.id} type="button" role="tab" aria-selected={activeCategory === category.id} onClick={() => { setSelectedCategory(category.id); setSelectedItemId(""); }} style={activeCategory === category.id ? { ...categoryStyle, ...activeCategoryStyle } : categoryStyle} className="shrink-0 rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors">{category.name}</button>)}
        </div>
      )}
      {visibleItems.length > 1 && <div className="mx-auto mt-6 flex max-w-3xl overflow-x-auto pb-1" style={{ gap: layout.itemGap }} aria-label="Comparisons">{visibleItems.map((item) => <button key={item.id} type="button" onClick={() => setSelectedItemId(item.id)} style={item.id === activeItem.id ? { ...categoryStyle, ...activeCategoryStyle } : categoryStyle} className="shrink-0 rounded-[var(--radius-sm)] border px-3 py-2 text-left text-[12px]">{item.title}</button>)}</div>}
      <div className="mx-auto mt-8 flex w-full items-center" style={{ gap: layout.contentGap, flexDirection: layout.layoutMode === "row" ? "row" : "column" }}>
        <div style={{ maxWidth: layout.imageWidth, width: "100%", flex: layout.layoutMode === "row" ? `0 1 ${layout.imageColumnPercent}%` : "0 1 auto" }}><BeforeAfterSlider beforeImage={activeItem.beforeImage} afterImage={activeItem.afterImage} beforeLabel={activeItem.beforeLabel} afterLabel={activeItem.afterLabel} style={{ ...comparisonStyle, aspectRatio: layout.imageAspectRatio }} /></div>
        <div className="w-full text-center lg:text-left" style={{ flex: layout.layoutMode === "row" ? `0 1 ${layout.contentColumnPercent}%` : "0 1 auto" }}>
          <p className="text-eyebrow text-[11px] text-primary">{categories.find((category) => category.id === activeItem.categoryId)?.name}</p>
          <h3 className="text-product-title mt-2 font-heading text-2xl" style={itemTitleStyle}>{activeItem.title}</h3>
          <p className="text-body-premium mt-3 text-[14px] leading-6" style={itemDescriptionStyle}>{activeItem.description}</p>
          {(activeItem.buttonUrl || product) && activeItem.buttonText && <a href={activeItem.buttonUrl || `/products/${product?.slug}`} style={ctaStyle} className="text-btn mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[13px] text-primary-foreground transition-transform hover:scale-[1.02]">{activeItem.buttonText}<ArrowUpRight className="h-4 w-4" /></a>}
        </div>
      </div>
      </div>
    </SectionWrapper>
  );
}
