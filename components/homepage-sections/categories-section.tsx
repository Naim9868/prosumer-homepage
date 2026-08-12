"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { getCategoriesByIds } from "@/lib/catalog-utils";
import type { CatalogCategory, CatalogData } from "@/types/catalog";
import type { Section } from "@/types/homepage";

export function CategoriesSection({
  section,
  catalog,
}: {
  section: Extract<Section, { type: "categories" }>;
  catalog?: CatalogData;
}) {
  const { title, subtitle, categoryIds } = section.settings;
  const items = categoryIds.length
    ? getCategoriesByIds(catalog, categoryIds)
    : catalog?.categories ?? [];

  if (items.length === 0) return null;

  return (
    <SectionWrapper id="shop-by-lens" style={section.style}>
      <SectionHeading eyebrow="The Collection" title={title} description={subtitle} />
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((lens, i) => (
          <CategoryCard key={lens.id} category={lens} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}

function CategoryCard({ category, index }: { category: CatalogCategory; index: number }) {
  return (
    <motion.a
      href="#featured-products"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-[300px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-border p-6 shadow-sm transition-shadow hover:shadow-lg"
      style={{ background: category.gradient }}
    >
      {category.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2">
        <ArrowUpRight className="h-4 w-4" />
      </div>
      <div className="relative z-10">
        {category.tagline && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{category.tagline}</span>
        )}
        <h3 className="mt-2 font-heading text-2xl font-bold text-white transition-transform duration-300 group-hover:-translate-y-1">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-2 max-w-[85%] line-clamp-2 text-[13.5px] leading-relaxed text-white/80">{category.description}</p>
        )}
      </div>
    </motion.a>
  );
}
