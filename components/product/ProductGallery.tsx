"use client";

import { useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/lib/product-helpers";

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?.*?v=|embed\/|live\/|shorts\/)|youtu\.be\/)([\w-]+)/
  );
  return m?.[1] ?? null;
}

function detectProvider(url: string): "youtube" | "vimeo" | null {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/vimeo\.com/.test(url)) return "vimeo";
  return null;
}

function embedVideoUrl(url: string, provider?: string): string {
  const p = (provider ?? "").toLowerCase().trim();
  const resolved = p || detectProvider(url);
  if (resolved === "youtube") {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (resolved === "vimeo") {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }
  return url;
}

function isEmbedVideo(provider?: string, url?: string): boolean {
  const p = (provider ?? "").toLowerCase().trim();
  if (p === "youtube" || p === "vimeo") return true;
  if (url) return detectProvider(url) !== null;
  return false;
}

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
  const isVideo = active.type === "video";

  const goTo = (i: number) => setActiveIndex((i + images.length) % images.length);

  return (
    <div>
      <div
        className={`group relative w-full rounded-2xl bg-[color:var(--surface-800)] ${
          isVideo ? "aspect-video" : "aspect-square overflow-hidden"
        }`}
        onTouchStart={isVideo ? undefined : (e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={isVideo ? undefined : (e) => {
          if (touchStartX.current == null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 40) goTo(activeIndex + (delta < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        {isVideo ? (
          <div className="relative h-full w-full">
            {isEmbedVideo(active.videoProvider, active.videoUrl || active.url) ? (
              <iframe
                src={embedVideoUrl(active.videoUrl || active.url, active.videoProvider)}
                title={active.alt || productName}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={active.videoUrl || active.url}
                controls
                playsInline
                className="h-full w-full"
                poster={active.url !== active.videoUrl ? active.url : undefined}
              />
            )}
          </div>
        ) : (
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
            aria-label={`View ${active.alt ?? productName} full size`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {active.url ? (
              <img
                src={active.url}
                alt={active.alt || productName}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 h-full w-full bg-[color:var(--surface-800)]" />
            )}
          </button>
        )}

        {!isVideo && images.length > 1 && (
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
              {img.url ? (
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="h-full w-full bg-[color:var(--surface-800)]" />
              )}
              {img.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs">
                  ▶
                </span>
              )}
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
      } flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto`}
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
        {active.type === "video" && isEmbedVideo(active.videoProvider, active.videoUrl || active.url) ? (
          <iframe
            src={embedVideoUrl(active.videoUrl || active.url, active.videoProvider)}
            title={active.alt || productName}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : active.type === "video" ? (
          <video
            src={active.videoUrl || active.url}
            controls
            playsInline
            className="h-full w-full object-contain"
          />
        ) : active.url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={active.url}
            alt={active.alt || productName}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full bg-[color:var(--surface-800)]" />
        )}
      </div>
    </div>
  );
}
