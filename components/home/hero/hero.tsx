"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck, Truck, Star } from "lucide-react";
import { Container, ApertureMark } from "@/components/shared/layout-primitives";

const badges = [
  { icon: ShieldCheck, label: "2-Year Warranty" },
  { icon: Truck, label: "Free Dhaka Delivery" },
  { icon: Star, label: "4.9 / 5 from 1,240 shooters" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-[132px] pb-20 sm:pt-[152px] sm:pb-28"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-40 blur-[120px]"
        style={{ background: "var(--gradient-primary)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-15%] left-[-10%] h-[420px] w-[420px] rounded-full opacity-25 blur-[110px]"
        style={{ background: "var(--gradient-secondary)" }}
      />

      <Container className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary"
          >
            <ApertureMark className="h-3.5 w-3.5" />
            Optical-grade mobile lenses
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-balance font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.02] tracking-tight text-foreground"
          >
            See what your
            <br />
            phone <span className="italic text-primary">can&apos;t.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-[17px] leading-relaxed text-foreground-muted"
          >
            Multi-coated glass, machined titanium clips, and true optical
            correction — from macro texture to a full moon, 400,000 km away.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#shop-by-lens"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[14.5px] font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Shop the Collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#video"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-[14.5px] font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <PlayCircle className="h-4 w-4" />
              Watch it in Use
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3"
          >
            {badges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[13px] font-medium text-foreground-muted">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        <MoonLensVisual />
      </Container>
    </section>
  );
}

/**
 * Animated hero centerpiece — a lens raised toward a rising moon.
 * Layered animation, in order of "premium-ness":
 *  1. Entrance reveal (fade + rise, once)
 *  2. Ambient halo pulse behind the moon (slow, continuous)
 *  3. Glint sweep down the lens barrel (periodic, continuous)
 *  4. Pointer-driven parallax tilt on the whole scene (desktop only)
 * No spin/bounce — those read as decoration rather than optics.
 */
function MoonLensVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springX = useSpring(px, { stiffness: 120, damping: 20 });
  const springY = useSpring(py, { stiffness: 120, damping: 20 });
  const rotateX = useTransform(springY, [0, 1], [6, -6]);
  const rotateY = useTransform(springX, [0, 1], [-8, 8]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };
  const handlePointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[440px]"
    >
      <div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ perspective: 1000 }}
        className="relative"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-xl)] border border-border shadow-lg"
        >
          <SceneSvg px={springX} py={springY} />
        </motion.div>

        {/* floating feature badges — sit outside the 3D layer so text stays crisp */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{ opacity: { delay: 0.7 }, y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" } }}
          className="glass absolute -left-2 top-6 rounded-2xl border border-border px-4 py-3 shadow-lg sm:-left-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Reach</p>
          <p className="font-heading text-lg font-bold text-foreground">10x Optical</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: 0.9 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
          className="glass absolute -right-2 bottom-8 rounded-2xl border border-border px-4 py-3 shadow-lg sm:-right-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Glass</p>
          <p className="font-heading text-lg font-bold text-foreground">Multi-coated</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SceneSvg({ px, py }: { px: MotionValue<number>; py: MotionValue<number> }) {
  const moonX = useTransform(px, [0, 1], [190, 210]);
  const moonY = useTransform(py, [0, 1], [88, 96]);

  return (
    <svg viewBox="0 0 400 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="night-sky" cx="50%" cy="18%" r="85%">
          <stop offset="0%" stopColor="#1c2430" />
          <stop offset="45%" stopColor="#0f1216" />
          <stop offset="100%" stopColor="#08090a" />
        </radialGradient>
        <radialGradient id="moon-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eef2f5" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#8fa5b8" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#08090a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon-body" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f5f4f0" />
          <stop offset="55%" stopColor="#c9cbcb" />
          <stop offset="100%" stopColor="#84888c" />
        </radialGradient>
        <linearGradient id="barrel-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3d4046" />
          <stop offset="45%" stopColor="#17191d" />
          <stop offset="100%" stopColor="#46494f" />
        </linearGradient>
        <linearGradient id="brass-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c5f28" />
          <stop offset="50%" stopColor="#e6c778" />
          <stop offset="100%" stopColor="#7c5f28" />
        </linearGradient>
        <linearGradient id="glint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="barrel-clip-2">
          <rect x="150" y="150" width="100" height="320" rx="18" />
        </clipPath>
      </defs>

      <rect width="400" height="500" fill="url(#night-sky)" />

      {/* moon + ambient pulse */}
      <motion.circle
        cx={moonX}
        cy={moonY}
        r={110}
        fill="url(#moon-halo)"
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.06, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "200px 92px" }}
      />
      <motion.g style={{ x: moonX, y: moonY }}>
        <circle cx={0} cy={0} r={46} fill="url(#moon-body)" transform="translate(200 92)" />
        <ellipse cx={190} cy={80} rx={8} ry={5} fill="#84888c" opacity="0.5" />
        <ellipse cx={214} cy={100} rx={5} ry={3.5} fill="#84888c" opacity="0.4" />
        <ellipse cx={198} cy={104} rx={4} ry={3} fill="#84888c" opacity="0.35" />
      </motion.g>

      {/* vertical light beam from lens opening toward the sky */}
      <motion.rect
        x="192"
        y="0"
        width="16"
        height="160"
        fill="url(#glint)"
        style={{ transformOrigin: "200px 80px" }}
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />

      {/* lens barrel, angled toward the moon */}
      <g transform="rotate(-18 200 320)">
        <rect x="150" y="150" width="100" height="320" rx="18" fill="url(#barrel-metal)" />
        <rect x="150" y="150" width="100" height="320" rx="18" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="1.5" />

        {/* brass ring near the objective end */}
        <rect x="150" y="176" width="100" height="10" fill="url(#brass-band)" />

        {/* grip texture */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x="150" y={340 + i * 9} width="100" height="3" fill="#000" opacity="0.28" />
        ))}

        {/* engraved wordmark */}
        <text
          x="204"
          y="300"
          fill="#c7cbcf"
          opacity="0.5"
          fontSize="11"
          fontWeight="700"
          letterSpacing="3"
          textAnchor="middle"
          transform="rotate(90 204 300)"
        >
          PROSUMER
        </text>

        {/* objective glass */}
        <circle cx="200" cy="164" r="34" fill="#0c1116" stroke="#e6c778" strokeOpacity="0.4" strokeWidth="1.5" />
        <circle cx="190" cy="154" r="10" fill="#ffffff" opacity="0.18" />

        {/* animated glint sweep down the barrel */}
        <motion.rect
          x="150"
          y="-140"
          width="100"
          height="90"
          fill="url(#glint)"
          clipPath="url(#barrel-clip-2)"
          animate={{ y: [150, 480] }}
          transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
        />
      </g>

      {/* simplified hand silhouette, gripping the lower barrel */}
      <path
        d="M120 430 Q118 395 150 380 L165 372 Q175 368 182 376 L182 400 Q210 392 226 400 L230 420 Q236 424 234 434 L228 470 Q224 486 204 490 L156 494 Q132 492 122 470 Z"
        fill="#050506"
        opacity="0.92"
      />

      {/* bottom vignette */}
      <rect x="0" y="420" width="400" height="80" fill="url(#night-sky)" opacity="0.4" />
    </svg>
  );
}
