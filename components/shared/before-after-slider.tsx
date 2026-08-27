"use client";

import { GripVertical } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  style,
}: {
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
  style?: React.CSSProperties;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [position, setPosition] = useState(50);

  const updatePosition = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const bounds = track.getBoundingClientRect();
    setPosition(Math.max(0, Math.min(100, ((clientX - bounds.left) / bounds.width) * 100)));
  }, []);

  return (
    <div
      ref={trackRef}
      className="relative w-full select-none overflow-hidden border bg-muted shadow-lg touch-none"
      style={{ aspectRatio: "16 / 10", borderRadius: "var(--radius-lg)", ...style }}
      onPointerMove={(event) => dragging.current && updatePosition(event.clientX)}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      <div className="absolute inset-0">
        {/* Comparison images may come from arbitrary admin-provided URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={afterImage} alt={afterLabel} className="h-full w-full object-cover" />
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {afterLabel}
        </span>
      </div>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeImage} alt={beforeLabel} className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {beforeLabel}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.45)]" style={{ left: `${position}%` }} />
      <button
        type="button"
        role="slider"
        aria-label="Comparison position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          updatePosition(event.clientX);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") setPosition((value) => Math.max(0, value - 5));
          if (event.key === "ArrowRight") setPosition((value) => Math.min(100, value + 5));
          if (event.key === "Home") setPosition(0);
          if (event.key === "End") setPosition(100);
        }}
        className="absolute top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-white text-foreground shadow-xl focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ left: `${position}%` }}
      >
        <GripVertical className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
