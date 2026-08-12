import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import type { Section } from "@/types/homepage";

const placeholderTiles = [
  { h: 260, hue: 205 }, { h: 340, hue: 40 }, { h: 220, hue: 150 }, { h: 300, hue: 280 },
  { h: 240, hue: 20 }, { h: 320, hue: 200 }, { h: 260, hue: 100 }, { h: 280, hue: 260 },
];

export function GallerySection({ section }: { section: Extract<Section, { type: "gallery" }> }) {
  const { title, subtitle, images } = section.settings;

  return (
    <SectionWrapper style={section.style}>
      <SectionHeading eyebrow="Community" title={title} description={subtitle} />
      <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4">
        {images.length
          ? images.map((img, i) => (
              <figure key={i} className="mb-4 overflow-hidden rounded-[var(--radius-md)] border border-border break-inside-avoid">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || ""} className="w-full" />
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
      </div>
    </SectionWrapper>
  );
}
