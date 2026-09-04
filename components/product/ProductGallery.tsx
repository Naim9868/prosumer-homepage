"use client";

import { useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/lib/product-helpers";

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => setActiveIndex(0), [images]);

  if (!images.length) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-[color:var(--surface-800)]" aria-hidden="true" />
    );
  }

  const active = images[activeIndex];

  const goTo = (i: number) => setActiveIndex((i + images.length) % images.length);

  return (
    <div>
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-[color:var(--surface-800)]"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 40) goTo(activeIndex + (delta < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        <button
          type="button"
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View ${active.alt ?? productName} full size`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={active.alt || productName}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>

        {images.length > 1 && (
          <>
            <GalleryArrow direction="prev" onClick={() => goTo(activeIndex - 1)} />
            <GalleryArrow direction="next" onClick={() => goTo(activeIndex + 1)} />
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                i === activeIndex
                  ? "border-[color:var(--brass-500)]"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={images}
          index={activeIndex}
          productName={productName}
          onClose={() => setLightboxOpen(false)}
          onNavigate={goTo}
        />
      )}
    </div>
  );
}

function GalleryArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={direction === "prev" ? "Previous image" : "Next image"}
      className={`absolute top-1/2 -translate-y-1/2 ${
        direction === "prev" ? "left-3" : "right-3"
      } flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100`}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}

function Lightbox({
  images,
  index,
  productName,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  index: number;
  productName: string;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(index - 1);
      if (e.key === "ArrowRight") onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, onNavigate]);

  const active = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} image ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white"
      >
        ✕
      </button>
      <div className="relative h-full max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.url}
          alt={active.alt || productName}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
