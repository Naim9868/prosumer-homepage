"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/**
 * Animated wrapper. Sits inside a container that drives `initial`/`animate`
 * (so staggerChildren propagates), and applies the given per-element variants.
 */
export function Entrance({
  variants,
  className,
  style,
  children,
}: {
  variants: Variants;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <motion.div variants={variants} className={className} style={style}>
      {children}
    </motion.div>
  );
}
