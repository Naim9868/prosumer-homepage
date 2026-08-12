import { Container, SectionHeading } from "@/components/shared/layout-primitives";

const tiles = [
  { h: 260, hue: 205, label: "Macro / Dhaka" },
  { h: 340, hue: 40, label: "Telephoto / Sylhet" },
  { h: 220, hue: 150, label: "Wide / Khulna" },
  { h: 300, hue: 280, label: "Fisheye / CTG" },
  { h: 240, hue: 20, label: "Macro / Rajshahi" },
  { h: 320, hue: 200, label: "CPL / Cox's Bazar" },
  { h: 260, hue: 100, label: "Wide / Sylhet" },
  { h: 280, hue: 260, label: "Telephoto / Dhaka" },
];

export function Gallery() {
  return (
    <section className="border-t border-border bg-muted/40 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Community"
          title="Shot on Prosumer"
          description="Tag @prosumerlensbd to be featured here."
        />

        <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4">
          {tiles.map((tile, i) => (
            <figure
              key={i}
              className="group relative mb-4 overflow-hidden rounded-[var(--radius-md)] border border-border break-inside-avoid"
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
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-black/55 p-3 text-[11.5px] font-medium text-white backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
                {tile.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
