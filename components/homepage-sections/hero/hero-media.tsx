"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import type { CatalogProduct } from "@/types/catalog";
import { heroColorsFor, heroBreakpointFor, mediaImageFor } from "@/lib/hero";
import { cn } from "@/lib/utils";
import { useHero } from "./hero-context";
import { Entrance } from "./hero-content";
import { HeroImage } from "./hero-background";

// ---------------------------------------------------------------
// Entrance wrapper (re-exported from hero-content for media use)
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// Fallback visual (moon + lens-barrel SVG scene)
// ---------------------------------------------------------------

function HeroFallbackVisual() {
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
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: 1000 }}
      className="absolute inset-0"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="absolute inset-0"
      >
        <SceneSvg px={springX} py={springY} />
      </motion.div>
    </div>
  );
}

function SceneSvg({ px, py }: { px: MotionValue<number>; py: MotionValue<number> }) {
  const moonX = useTransform(px, [0, 1], [190, 210]);
  const moonY = useTransform(py, [0, 1], [88, 96]);

  return (
    <svg viewBox="0 0 400 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="hfn-sky" cx="50%" cy="18%" r="85%">
          <stop offset="0%" stopColor="#1c2430" />
          <stop offset="45%" stopColor="#0f1216" />
          <stop offset="100%" stopColor="#08090a" />
        </radialGradient>
        <radialGradient id="hfn-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eef2f5" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#8fa5b8" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#08090a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hfn-moon" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f5f4f0" />
          <stop offset="55%" stopColor="#c9cbcb" />
          <stop offset="100%" stopColor="#84888c" />
        </radialGradient>
        <linearGradient id="hfn-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3d4046" />
          <stop offset="45%" stopColor="#17191d" />
          <stop offset="100%" stopColor="#46494f" />
        </linearGradient>
        <linearGradient id="hfn-brass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c5f28" />
          <stop offset="50%" stopColor="#e6c778" />
          <stop offset="100%" stopColor="#7c5f28" />
        </linearGradient>
        <linearGradient id="hfn-glint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="hfn-clip">
          <rect x="150" y="150" width="100" height="320" rx="18" />
        </clipPath>
      </defs>

      <rect width="400" height="500" fill="url(#hfn-sky)" />

      <motion.circle
        cx={moonX}
        cy={moonY}
        r={110}
        fill="url(#hfn-halo)"
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.06, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "200px 92px" }}
      />
      <motion.g style={{ x: moonX, y: moonY }}>
        <circle cx={0} cy={0} r={46} fill="url(#hfn-moon)" transform="translate(200 92)" />
        <ellipse cx={190} cy={80} rx={8} ry={5} fill="#84888c" opacity="0.5" />
        <ellipse cx={214} cy={100} rx={5} ry={3.5} fill="#84888c" opacity="0.4" />
        <ellipse cx={198} cy={104} rx={4} ry={3} fill="#84888c" opacity="0.35" />
      </motion.g>

      <motion.rect
        x="192"
        y="0"
        width="16"
        height="160"
        fill="url(#hfn-glint)"
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />

      <g transform="rotate(-18 200 320)">
        <rect x="150" y="150" width="100" height="320" rx="18" fill="url(#hfn-metal)" />
        <rect x="150" y="150" width="100" height="320" rx="18" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="1.5" />
        <rect x="150" y="176" width="100" height="10" fill="url(#hfn-brass)" />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x="150" y={340 + i * 9} width="100" height="3" fill="#000" opacity="0.28" />
        ))}
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
        <circle cx="200" cy="164" r="34" fill="#0c1116" stroke="#e6c778" strokeOpacity="0.4" strokeWidth="1.5" />
        <circle cx="190" cy="154" r="10" fill="#ffffff" opacity="0.18" />
        <motion.rect
          x="150"
          y="-140"
          width="100"
          height="90"
          fill="url(#hfn-glint)"
          clipPath="url(#hfn-clip)"
          animate={{ y: [150, 480] }}
          transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
        />
      </g>

      <path
        d="M120 430 Q118 395 150 380 L165 372 Q175 368 182 376 L182 400 Q210 392 226 400 L230 420 Q236 424 234 434 L228 470 Q224 486 204 490 L156 494 Q132 492 122 470 Z"
        fill="#050506"
        opacity="0.92"
      />
      <rect x="0" y="420" width="400" height="80" fill="url(#hfn-sky)" opacity="0.4" />
    </svg>
  );
}

// ---------------------------------------------------------------
// HeroMedia
// ---------------------------------------------------------------

export function HeroMedia({ className }: { className?: string }) {
  const { slide, breakpoint, active, container, media: mediaVariants, products } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const media = bp.media;
  const colors = heroColorsFor(slide);
  const isMobile = breakpoint === "mobile";
  const pos = isMobile ? bp.styling.imagePosition : media.position;
  const bpImg = mediaImageFor(media, breakpoint);
  const img = media.productImage || bpImg;
  const product = media.productId ? products[media.productId] : undefined;

  const imageWidthStyle: CSSProperties =
    media.imageWidthMode === "manual" ? { width: media.imageWidth } : {};

  const br = media.borderRadius && typeof media.borderRadius === "object"
    ? media.borderRadius
    : { topLeft: 40, topRight: 40, bottomLeft: 40, bottomRight: 40 };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={active ? "show" : "hidden"}
      className={cn("relative", className)}
    >
      <Entrance variants={mediaVariants} className="relative">
        <div
          className={cn(
            "relative aspect-[4/5] overflow-hidden border",
            media.imageWidthMode === "auto" && "w-full"
          )}
          style={{
            borderRadius: `${br.topLeft}px ${br.topRight}px ${br.bottomRight}px ${br.bottomLeft}px`,
            borderColor: "var(--hero-border)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            ...imageWidthStyle,
          }}
        >
          {img ? (
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pos.x}%, ${pos.y}%) scale(${pos.scale})`,
              }}
            >
              <HeroImage
                src={img}
                alt={bp.content.heading}
                sizes="(max-width: 768px) 90vw, 44vw"
                className="object-cover"
              />
            </div>
          ) : product ? (
            <ProductVisual product={product} accent={colors.accent} />
          ) : (
            <HeroFallbackVisual />
          )}

          {media.source === "product-custom" && product && (
            <div
              className="absolute bottom-4 left-4 z-10 rounded-full border px-4 py-2"
              style={{ background: colors.card, borderColor: colors.border }}
            >
              <p className="text-[12px] font-semibold" style={{ color: colors.foreground }}>
                {product.name}
              </p>
              <p className="text-[11px]" style={{ color: colors.accent }}>
                ৳{product.price}
              </p>
            </div>
          )}
        </div>
      </Entrance>
    </motion.div>
  );
}

function ProductVisual({ product, accent }: { product: CatalogProduct; accent: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: product.gradient }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{product.category}</p>
      <p className="mt-3 font-heading text-2xl font-bold text-white">{product.name}</p>
      <p className="mt-3 text-xl font-bold" style={{ color: accent }}>
        ৳{product.price}
      </p>
      {product.compareAtPrice ? (
        <p className="mt-1 text-sm text-white/50 line-through">৳{product.compareAtPrice}</p>
      ) : null}
      <span
        className="mt-5 inline-flex rounded-full px-6 py-2.5 text-[12px] font-semibold"
        style={{ background: accent, color: "#0A0A0A" }}
      >
        Shop Now
      </span>
    </div>
  );
}
