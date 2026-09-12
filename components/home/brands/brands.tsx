import { Container } from "@/components/shared/layout-primitives";
import { brandPartners } from "@/lib/data";

export function Brands() {
  const loop = [...brandPartners, ...brandPartners];

  return (
    <section className="border-y border-border py-14">
      <Container>
        <p className="text-eyebrow mb-8 text-center text-[11px] text-foreground-muted">
          Optical glass sourced from
        </p>
      </Container>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-16">
          {loop.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="whitespace-nowrap font-heading text-xl font-bold tracking-tight text-foreground-muted opacity-60"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
