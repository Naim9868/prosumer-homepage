import { ArrowRight } from "lucide-react";
import { Container, ApertureMark } from "@/components/shared/layout-primitives";

export function Cta() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div
          className="relative overflow-hidden rounded-[var(--radius-xl)] px-8 py-16 text-center sm:px-16 sm:py-24"
          style={{ background: "var(--gradient-secondary)" }}
        >
          <ApertureMark className="mx-auto h-10 w-10 text-white/70" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(201,164,76,0.35), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15), transparent 50%)",
            }}
          />
          <h2 className="relative mx-auto mt-6 max-w-xl text-balance font-heading text-[clamp(1.75rem,4vw,3rem)] font-bold leading-tight text-white">
            Your phone is ready for real glass.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
            Free delivery in Dhaka, cash on delivery nationwide, and a 2-year warranty on every lens.
          </p>
          <a
            href="#shop-by-lens"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[14.5px] font-semibold text-black shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Start Shopping
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Container>
    </section>
  );
}
