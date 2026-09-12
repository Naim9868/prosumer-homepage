"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { ProductCard } from "@/components/shared/product-card";
import { getFeaturedProducts, getProductsByIds } from "@/lib/catalog-utils";
import { catStyleFor, catLayoutFor } from "@/components/homepage-sections/categories-section";
import type { CatalogData } from "@/types/catalog";
import type {
  Section,
  CategoriesTextStyle,
  CatTheme,
  EditorDevice,
} from "@/types/homepage";
import { cn } from "@/lib/utils";

// ── device / theme detection (for live site) ─────────────────────

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
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light",
  );
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

// ── renderer ─────────────────────────────────────────────────────

export function FeaturedProductsSection({
  section,
  catalog,
  breakpoint,
  forceTheme,
}: {
  section: Extract<Section, { type: "featuredProducts" }>;
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
    productIds,
    viewAllLabel,
    viewAllUrl,
    layout,
    eyebrowStyle,
    titleStyle,
    subtitleStyle,
    viewAllStyle,
  } = section.settings;

  const allProducts = productIds.length
    ? getProductsByIds(catalog, productIds, 999)
    : getFeaturedProducts(catalog, 999);

  const { columns, gridGap, limit: deviceLimit } = catLayoutFor(layout, device);
  const perPage = deviceLimit ?? 8;
  const totalPages = Math.ceil(allProducts.length / perPage);

  const [page, setPage] = useState(0);
  const safePage = Math.min(page, totalPages - 1);
  const products = allProducts.slice(safePage * perPage, safePage * perPage + perPage);
  const showPagination = totalPages > 1;

  const goNext = useCallback(() => setPage((p) => (p + 1) % totalPages), [totalPages]);
  const goPrev = useCallback(() => setPage((p) => (p - 1 + totalPages) % totalPages), [totalPages]);

  const eStyle = catStyleFor(eyebrowStyle, device, theme);
  const tStyle = catStyleFor(titleStyle, device, theme);
  const sStyle = catStyleFor(subtitleStyle, device, theme);
  const vStyle = catStyleFor(viewAllStyle, device, theme);

  const isMobile = device === "mobile";
  const isTablet = device === "tablet";

  const sectionPadding = {
    paddingTop: isMobile ? 16 : isTablet ? 40 : section.style.paddingTop ?? 80,
    paddingBottom: isMobile ? 16 : isTablet ? 40 : section.style.paddingBottom ?? 80,
  };

  if (allProducts.length === 0) return null;

  return (
    <SectionWrapper id="featured-products" style={{ ...section.style, ...sectionPadding }}>
      <div className={cn("flex flex-wrap items-end justify-between gap-6", isMobile && "flex-col items-start gap-3")}>
        <div>
          {eyebrow && (
            <span
              className={cn("text-eyebrow mb-2 block text-[11px] text-primary", isMobile && "text-[9px] mb-1")}
              style={textStyleToInline(eStyle)}
            >
              {eyebrow}
            </span>
          )}
          {title && (
            <h2
              className={cn("text-section-title font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] text-foreground", isMobile && "text-xl")}
              style={textStyleToInline(tStyle)}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className={cn("text-body-premium mt-3 max-w-2xl text-[15px] text-foreground-muted", isMobile && "mt-1.5 text-xs")}
              style={textStyleToInline(sStyle)}
            >
              {subtitle}
            </p>
          )}
        </div>
        {(viewAllLabel ?? "View all products") && (
          <a
            href={viewAllUrl ?? "#best-sellers"}
            className={cn("mb-1 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-primary transition-colors hover:text-foreground", isMobile && "text-[12px] mb-0")}
            style={textStyleToInline(vStyle)}
          >
            {viewAllLabel ?? "View all products"}
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Product grid with slide animation */}
      <div className="mt-12 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safePage}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-4 sm:gap-5"
            style={{
              gridTemplateColumns: `repeat(${isMobile ? Math.min(columns, 2) : columns}, 1fr)`,
              gap: gridGap,
            }}
          >
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === safePage ? "w-6 bg-primary" : "w-2 bg-border hover:bg-foreground-muted",
                )}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </SectionWrapper>
  );
}
