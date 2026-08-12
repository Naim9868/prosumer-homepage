"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Container, SectionHeading } from "@/components/shared/layout-primitives";

const YOUTUBE_ID = "dQw4w9WgXcQ";

export function Video() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="video" className="py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow="In the Field" title="Watch the glass go to work" align="center" className="mx-auto" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-12 aspect-video w-full max-w-4xl overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-lg"
        >
          {playing ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1`}
              title="Prosumer Lens BD — field demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play field demo video"
              className="group relative h-full w-full"
            >
              <ThumbnailSvg />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-black shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <PlayCircle className="h-9 w-9" strokeWidth={1.5} />
                </span>
              </span>
            </button>
          )}
        </motion.div>
      </Container>
    </section>
  );
}

function ThumbnailSvg() {
  return (
    <svg viewBox="0 0 800 450" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vidbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16181c" />
          <stop offset="100%" stopColor="#08090a" />
        </linearGradient>
        <radialGradient id="vidglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4c7a92" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#08090a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="450" fill="url(#vidbg)" />
      <circle cx="400" cy="225" r="260" fill="url(#vidglow)" />
      <circle cx="400" cy="225" r="150" fill="none" stroke="#b08d46" strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="400" cy="225" r="110" fill="none" stroke="#b08d46" strokeOpacity="0.25" strokeWidth="1.5" />
    </svg>
  );
}
