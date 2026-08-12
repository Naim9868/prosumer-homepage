"use client";

import { useCallback, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import type { Section } from "@/types/homepage";

export function BeforeAfterSection({ section }: { section: Extract<Section, { type: "beforeAfter" }> }) {
  const { title, subtitle, beforeImage, afterImage, beforeLabel, afterLabel } = section.settings;
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(98, Math.max(2, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPosition((p) => Math.max(2, p - 3));
    if (e.key === "ArrowRight") setPosition((p) => Math.min(98, p + 3));
  };

  return (
    <SectionWrapper style={section.style}>
      <SectionHeading eyebrow="The Difference" title={title} description={subtitle} align="center" className="mx-auto" />
      <div
        ref={trackRef}
        className="relative mx-auto mt-12 aspect-[16/10] w-full max-w-3xl select-none overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-lg"
        onPointerMove={onPointerMove}
        onPointerUp={() => (dragging.current = false)}
      >
        <div className="absolute inset-0">
          <SceneSvg variant="sharp" image={afterImage} />
          <span className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {afterLabel}
          </span>
        </div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <SceneSvg variant="soft" image={beforeImage} />
          <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {beforeLabel}
          </span>
        </div>
        <div className="absolute inset-y-0 z-10 w-[2px] bg-white/80" style={{ left: `${position}%` }} aria-hidden />
        <button
          type="button"
          role="slider"
          aria-label="Comparison position"
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-black shadow-lg"
          style={{ left: `${position}%` }}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
    </SectionWrapper>
  );
}

function SceneSvg({ variant, image }: { variant: "sharp" | "soft"; image?: string }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="h-full w-full object-cover" />;
  }
  const blur = variant === "soft" ? 3.2 : 0;
  const sat = variant === "soft" ? 0.75 : 1.15;
  return (
    <svg viewBox="0 0 640 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id={`grade-${variant}`}>
          <feGaussianBlur stdDeviation={blur} />
          <feColorMatrix type="saturate" values={String(sat)} />
        </filter>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={variant === "soft" ? "#8ea3ad" : "#2a5b78"} />
          <stop offset="100%" stopColor={variant === "soft" ? "#c7cdd0" : "#e8dcae"} />
        </linearGradient>
      </defs>
      <g filter={`url(#grade-${variant})`}>
        <rect width="640" height="400" fill={`url(#sky-${variant})`} />
        <circle cx="500" cy="90" r="46" fill={variant === "soft" ? "#e2e2df" : "#f4e8b8"} />
        {Array.from({ length: 6 }).map((_, i) => (
          <polygon key={i} points={`${40 + i * 100},400 ${70 + i * 100},220 ${100 + i * 100},400`} fill={variant === "soft" ? "#6b7478" : `hsl(${140 + i * 6} 30% ${22 + i * 3}%)`} />
        ))}
        <rect x="0" y="360" width="640" height="40" fill={variant === "soft" ? "#767d80" : "#3a4a3f"} />
      </g>
    </svg>
  );
}
