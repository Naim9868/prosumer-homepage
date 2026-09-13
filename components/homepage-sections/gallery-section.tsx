"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import type { Section, EditorDevice } from "@/types/homepage";
import { cn } from "@/lib/utils";

const placeholderTiles = [
  { h: 260, hue: 205 }, { h: 340, hue: 40 }, { h: 220, hue: 150 }, { h: 300, hue: 280 },
  { h: 240, hue: 20 }, { h: 320, hue: 200 }, { h: 260, hue: 100 }, { h: 280, hue: 260 },
];

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

const DEFAULT_PER_PAGE: Record<EditorDevice, number> = {
  mobile: 4,
  tablet: 6,
  desktop: 8,
};

export function GallerySection({ section }: { section: Extract<Section, { type: "gallery" }> }) {
  const { title, subtitle, images, perPageMobile, perPageTablet, perPageDesktop } = section.settings;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const device = useLiveDevice();
  const perPageMap: Record<EditorDevice, number> = {
    mobile: perPageMobile || DEFAULT_PER_PAGE.mobile,
    tablet: perPageTablet || DEFAULT_PER_PAGE.tablet,
    desktop: perPageDesktop || DEFAULT_PER_PAGE.desktop,
  };
  const perPage = perPageMap[device];

  const totalPages = Math.ceil(images.length / perPage);
  const showPagination = totalPages > 1;
  const safePage = Math.min(page, totalPages - 1);
  const pageImages = images.slice(safePage * perPage, safePage * perPage + perPage);

  const goNext = useCallback(() => setPage((p) => (p + 1) % totalPages), [totalPages]);
  const goPrev = useCallback(() => setPage((p) => (p - 1 + totalPages) % totalPages), [totalPages]);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevLightbox = useCallback(() => setLightboxIndex((p) => (p !== null && p > 0 ? p - 1 : p)), []);
  const nextLightbox = useCallback(() => setLightboxIndex((p) => (p !== null && p < images.length - 1 ? p + 1 : p)), [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, prevLightbox, nextLightbox]);

  const isMobile = device === "mobile";

  return (
    <SectionWrapper style={section.style}>
      <SectionHeading eyebrow="Community" title={title} description={subtitle} />

      <div className="mt-10 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safePage}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "columns-2 gap-4",
              !isMobile && "sm:columns-3",
              device === "desktop" && "lg:columns-4",
            )}
          >
            {pageImages.length
              ? pageImages.map((img, i) => (
                  <figure
                    key={`${safePage}-${i}`}
                    className="group mb-4 cursor-pointer overflow-hidden rounded-[var(--radius-md)] border border-border break-inside-avoid transition-shadow hover:shadow-lg"
                    onClick={() => openLightbox(safePage * perPage + i)}
                  >
                    <div className="relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.caption || ""}
                        className="w-full transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                        <svg className="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                        </svg>
                      </div>
                      {/* Desktop: caption as hover overlay */}
                      {img.caption && (
                        <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-black/55 px-3 py-2.5 text-center text-xs leading-snug text-white backdrop-blur transition-transform duration-300 group-hover:translate-y-0 hidden lg:block">
                          {img.caption}
                        </figcaption>
                      )}
                    </div>
                    {/* Mobile: caption below image (always visible) */}
                    {img.caption && (
                      <figcaption className="px-3 py-2.5 text-center text-xs leading-snug text-foreground-muted sm:text-sm lg:hidden">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))
              : placeholderTiles.map((tile, i) => (
                  <figure
                    key={i}
                    className="mb-4 overflow-hidden rounded-[var(--radius-md)] border border-border break-inside-avoid"
                    style={{ height: tile.h }}
                  >
                    <svg viewBox="0 0 300 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                      <defs>
                        <linearGradient id={`g-tile-${i}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={`hsl(${tile.hue} 35% 22%)`} />
                          <stop offset="100%" stopColor={`hsl(${tile.hue} 45% 8%)`} />
                        </linearGradient>
                      </defs>
                      <rect width="300" height="300" fill={`url(#g-tile-${i})`} />
                      <circle cx="150" cy="140" r="70" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="10" />
                    </svg>
                  </figure>
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

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image ${lightboxIndex + 1} of ${images.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                aria-label="Previous image"
                disabled={lightboxIndex === 0}
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                aria-label="Next image"
                disabled={lightboxIndex === images.length - 1}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="relative flex max-h-[85vh] max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption || ""}
              className="max-h-[75vh] rounded-lg object-contain"
            />
            {images[lightboxIndex].caption && (
              <p className="mt-3 text-center text-sm text-white/80">{images[lightboxIndex].caption}</p>
            )}
            <p className="mt-1 text-xs text-white/40">{lightboxIndex + 1} / {images.length}</p>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
