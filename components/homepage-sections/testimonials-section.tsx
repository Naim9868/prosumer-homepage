"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { getReviewsByIds } from "@/lib/catalog-utils";
import type { CatalogData, CatalogReview } from "@/types/catalog";
import type { Section } from "@/types/homepage";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialsSection({
  section,
  catalog,
}: {
  section: Extract<Section, { type: "testimonials" }>;
  catalog?: CatalogData;
}) {
  const { title, subtitle, testimonialIds } = section.settings;
  const device = useBreakpoint();
  const all = catalog?.reviews ?? [];
  let items = testimonialIds.length ? getReviewsByIds(catalog, testimonialIds) : all;
  if (items.length === 0) items = all;
  if (items.length === 0) return null;

  return (
    <SectionWrapper device={device} id="reviews" style={section.style} responsiveStyles={section.responsiveStyles}>
      <SectionHeading eyebrow="Reviews" title={title} description={subtitle} align="center" className="mx-auto" />
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((t, i) => (
          <ReviewCard key={t.id} review={t} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}

function ReviewCard({ review, index }: { review: CatalogReview; index: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, s) => (
          <Star
            key={s}
            className="h-3.5 w-3.5"
            fill={s < review.rating ? "var(--primary)" : "transparent"}
            stroke="var(--primary)"
          />
        ))}
      </div>
      <blockquote className="text-body-premium flex-1 text-[13.5px] text-foreground">
        &ldquo;{review.comment}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-border pt-4">
        {review.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.image}
            alt={review.name}
            className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[12px] font-bold text-primary">
            {initials(review.name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-[13px] font-semibold text-foreground">
            {review.name}
            {review.isVerifiedPurchase && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
          </p>
          <p className="truncate text-[12px] text-foreground-muted">{review.product}</p>
        </div>
      </figcaption>
    </motion.figure>
  );
}
