"use client";

import { useCallback, useRef, useState } from "react";

export function FocalPointPicker({
  imageSrc,
  x,
  y,
  onChange,
}: {
  imageSrc: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const updateFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const py = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
      onChange(Math.round(px), Math.round(py));
    },
    [onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromEvent(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    updateFromEvent(e.clientX, e.clientY);
  };

  const handlePointerUp = () => setDragging(false);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted cursor-crosshair select-none"
      style={{ aspectRatio: "16/9" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {imageSrc ? (
        <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-foreground-muted">
          No image
        </div>
      )}
      {/* Crosshair lines */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 h-full w-px bg-white/50" style={{ left: `${x}%` }} />
        <div className="absolute left-0 h-px w-full bg-white/50" style={{ top: `${y}%` }} />
      </div>
      {/* Focal point marker */}
      <div
        className="pointer-events-none absolute z-10 flex items-center justify-center"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="h-5 w-5 rounded-full border-2 border-white bg-black/40 shadow-lg" />
        <div className="absolute h-px w-5 bg-white/70" />
        <div className="absolute h-5 w-px bg-white/70" />
      </div>
    </div>
  );
}
