"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { getCategoriesByIds } from "@/lib/catalog-utils";
import type { CatalogCategory, CatalogData } from "@/types/catalog";
import type {
  Section,
  CategoriesTextStyle,
  CatResponsiveThemeStyle,
  CatDeviceLayout,
  CatTheme,
  EditorDevice,
} from "@/types/homepage";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────

export function catStyleFor(
  map: CatResponsiveThemeStyle | undefined,
  device: EditorDevice,
  theme: CatTheme,
): CategoriesTextStyle {
  // New format: nested [device][theme]
  if (map?.[device]?.[theme]) return map[device]![theme]!;
  // Legacy fallback: map itself is a flat CategoriesTextStyle
  if (map && ("fontFamily" in map || "fontSize" in map || "color" in map)) {
    return map as unknown as CategoriesTextStyle;
  }
  return {};
}

export function catLayoutFor(
  layout: CatDeviceLayout | undefined,
  device: EditorDevice,
): { columns: number; gridGap: number; limit?: number } {
  if (layout?.[device]) return layout[device]!;
  // Legacy fallback: layout might be flat { columns, gridGap }
  if (layout && "columns" in layout) {
    return { columns: (layout as unknown as { columns: number }).columns ?? 2, gridGap: (layout as unknown as { gridGap: number }).gridGap ?? 16 };
  }
  return { columns: 2, gridGap: 16 };
}

function textStyleToInline(s?: CategoriesTextStyle): React.CSSProperties {
  if (!s) return {};
  const style: React.CSSProperties = {};
  if (s.fontFamily) style.fontFamily = s.fontFamily;
  if (s.fontSize) style.fontSize = s.fontSize;
  if (s.fontWeight) style.fontWeight = s.fontWeight;
  if (s.lineHeight) style.lineHeight = s.lineHeight;
  if (s.letterSpacing != null) style.letterSpacing = s.letterSpacing;
  if (s.color) style.color = s.color;
  if (s.backgroundColor) style.backgroundColor = s.backgroundColor;
  if (s.textAlign) style.textAlign = s.textAlign;
  if (s.paddingTop != null || s.paddingBottom != null || s.paddingLeft != null || s.paddingRight != null) {
    style.padding = `${s.paddingTop ?? 0}px ${s.paddingRight ?? 0}px ${s.paddingBottom ?? 0}px ${s.paddingLeft ?? 0}px`;
  }
  if (s.marginTop != null || s.marginBottom != null || s.marginLeft != null || s.marginRight != null) {
    style.margin = `${s.marginTop ?? 0}px ${s.marginRight ?? 0}px ${s.marginBottom ?? 0}px ${s.marginLeft ?? 0}px`;
  }
  return style;
}

// ── device / theme detection (for live site, not preview) ────────

function useLiveDevice(): EditorDevice {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("resize", cb);
      return () => window.removeEventListener("resize", cb);
    },
    () => {
      const w = window.innerWidth;
      if (w < 640) return "mobile";
      if (w < 1024) return "tablet";
      return "desktop";
    },
    () => "desktop",
  );
}

function useLiveTheme(): CatTheme {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const observer = new MutationObserver(cb);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      mq.addEventListener("change", cb);
      return () => {
        observer.disconnect();
        mq.removeEventListener("change", cb);
      };
    },
    () => {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    },
    () => "light",
  );
}

// ── main section ─────────────────────────────────────────────────

export function CategoriesSection({
  section,
  catalog,
  breakpoint,
  forceTheme,
}: {
  section: Extract<Section, { type: "categories" }>;
  catalog?: CatalogData;
  breakpoint?: EditorDevice;
  forceTheme?: CatTheme;
}) {
  const detectedDevice = useLiveDevice();
  const detectedTheme = useLiveTheme();
  const device = breakpoint ?? detectedDevice;
  const theme = forceTheme ?? detectedTheme;

  const {
    eyebrow,
    title,
    subtitle,
    categoryIds,
    cardTextPosition,
    cardTextOffsetX,
    cardTextOffsetY,
    layout,
    eyebrowStyle,
    titleStyle,
    subtitleStyle,
    cardNameStyle,
    cardDescriptionStyle,
  } = section.settings;

  const items = categoryIds.length
    ? getCategoriesByIds(catalog, categoryIds)
    : catalog?.categories ?? [];

  if (items.length === 0) return null;

  const { columns, gridGap } = catLayoutFor(layout, device);

  const eStyle = catStyleFor(eyebrowStyle, device, theme);
  const tStyle = catStyleFor(titleStyle, device, theme);
  const sStyle = catStyleFor(subtitleStyle, device, theme);
  const nameStyle = catStyleFor(cardNameStyle, device, theme);
  const descStyle = catStyleFor(cardDescriptionStyle, device, theme);

  const isMobile = device === "mobile";
  const isTablet = device === "tablet";
  const sectionPadding = {
    paddingTop: isMobile ? 16 : isTablet ? 40 : section.style.paddingTop ?? 80,
    paddingBottom: isMobile ? 16 : isTablet ? 40 : section.style.paddingBottom ?? 80,
  };

  return (
    <SectionWrapper
      id="shop-by-lens"
      style={{ ...section.style, ...sectionPadding }}
    >
      {(eyebrow || title || subtitle) && (
        <div
          className={cn("mb-8 lg:mb-14", isMobile && "mb-2", isTablet && "mb-6")}
        >
          {eyebrow && (
            <span
              className={cn(
                "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
                isMobile && "text-[9px] mb-1",
              )}
              style={textStyleToInline(eStyle)}
            >
              {eyebrow}
            </span>
          )}
          {title && (
            <h2
              className={cn(
                "font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-foreground",
                isMobile && "text-xl",
              )}
              style={textStyleToInline(tStyle)}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className={cn(
                "mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground-muted",
                isMobile && "mt-1.5 text-xs",
              )}
              style={textStyleToInline(sStyle)}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gridGap,
        }}
      >
        {items.map((lens, i) => (
          <CategoryCard
            key={lens.id}
            category={lens}
            index={i}
            columns={columns}
            cardTextPosition={cardTextPosition}
            cardTextOffsetX={cardTextOffsetX}
            cardTextOffsetY={cardTextOffsetY}
            nameStyle={nameStyle}
            descStyle={descStyle}
            isMobile={isMobile}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

// ── card ─────────────────────────────────────────────────────────

function CategoryCard({
  category,
  index,
  columns,
  cardTextPosition,
  cardTextOffsetX,
  cardTextOffsetY,
  nameStyle,
  descStyle,
  isMobile,
}: {
  category: CatalogCategory;
  index: number;
  columns: number;
  cardTextPosition?: string;
  cardTextOffsetX?: number;
  cardTextOffsetY?: number;
  nameStyle: CategoriesTextStyle;
  descStyle: CategoriesTextStyle;
  isMobile?: boolean;
}) {
  const position = cardTextPosition ?? "inside";
  const isOutside = position === "outside-top" || position === "outside-bottom";

  const offsetStyle: React.CSSProperties = {};
  if (isOutside && (cardTextOffsetX || cardTextOffsetY)) {
    offsetStyle.translate = `${cardTextOffsetX ?? 0}px ${cardTextOffsetY ?? 0}px`;
  }

  const cardImage = (
    <>
      {category.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2 lg:right-5 lg:top-5 lg:h-9 lg:w-9">
        <ArrowUpRight className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </div>
    </>
  );

  const card = (
    <motion.a
      href={`/products?categoryId=${category.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % columns) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-border shadow-sm transition-shadow hover:shadow-lg",
        isMobile
          ? "aspect-[3/2]"
          : "aspect-[4/3] lg:aspect-auto lg:h-[300px]",
        "lg:rounded-[var(--radius-lg)]"
      )}
      style={{ background: category.gradient }}
    >
      {cardImage}
      {position === "inside" && (
        <CardTextOverlay
          category={category}
          nameStyle={nameStyle}
          descStyle={descStyle}
          offsetX={cardTextOffsetX}
          offsetY={cardTextOffsetY}
          isMobile={isMobile}
        />
      )}
    </motion.a>
  );

  if (isOutside) {
    return (
      <div style={offsetStyle}>
        {position === "outside-top" && (
          <CardTextBlock category={category} nameStyle={nameStyle} descStyle={descStyle} />
        )}
        {card}
        {position === "outside-bottom" && (
          <CardTextBlock category={category} nameStyle={nameStyle} descStyle={descStyle} />
        )}
      </div>
    );
  }

  return card;
}

// ── text overlay (inside card) ───────────────────────────────────

function CardTextOverlay({
  category,
  nameStyle,
  descStyle,
  offsetX,
  offsetY,
  isMobile,
}: {
  category: CatalogCategory;
  nameStyle: CategoriesTextStyle;
  descStyle: CategoriesTextStyle;
  offsetX?: number;
  offsetY?: number;
  isMobile?: boolean;
}) {
  return (
    <div className={cn(
      "relative z-10 mt-auto flex w-full items-end",
      isMobile ? "p-2" : "p-3 lg:h-1/3 lg:items-center lg:bg-gradient-to-t lg:from-black/90 lg:via-black/55 lg:to-transparent lg:p-6",
    )}>
      <div style={offsetX || offsetY ? { translate: `${offsetX ?? 0}px ${offsetY ?? 0}px` } : undefined}>
        {category.tagline && (
          <span
            className="hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:block lg:text-[10px]"
            style={textStyleToInline(descStyle)}
          >
            {category.tagline}
          </span>
        )}
        <h3
          className={cn(
            "mt-0.5 font-heading font-bold text-white transition-transform duration-300 group-hover:-translate-y-1 line-clamp-2",
            isMobile ? "text-xs" : "text-sm",
          )}
          style={textStyleToInline(nameStyle)}
        >
          {category.name}
        </h3>
      </div>
    </div>
  );
}

// ── text block (outside card) ────────────────────────────────────

function CardTextBlock({
  category,
  nameStyle,
  descStyle,
}: {
  category: CatalogCategory;
  nameStyle: CategoriesTextStyle;
  descStyle: CategoriesTextStyle;
}) {
  return (
    <div className="px-1 py-2">
      {category.tagline && (
        <span
          className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted"
          style={textStyleToInline(descStyle)}
        >
          {category.tagline}
        </span>
      )}
      <h3
        className="mt-0.5 sm:mt-0.5 font-heading font-bold text-foreground line-clamp-2 text-sm"
        style={textStyleToInline(nameStyle)}
      >
        {category.name}
      </h3>
    </div>
  );
}
