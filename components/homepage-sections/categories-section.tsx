"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { getCategoriesByIds } from "@/lib/catalog-utils";
import type { CatalogCategory, CatalogData } from "@/types/catalog";
import type { Section } from "@/types/homepage";
import { cn } from "@/lib/utils";

export function CategoriesSection({
  section,
  catalog,
}: {
  section: Extract<Section, { type: "categories" }>;
  catalog?: CatalogData;
}) {
  const { title, subtitle, categoryIds, columns = 2 } = section.settings;
  const items = categoryIds.length
    ? getCategoriesByIds(catalog, categoryIds)
    : catalog?.categories ?? [];

  if (items.length === 0) return null;

  const gridClass =
    columns === 3
      ? "grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-5"
      : "grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 lg:gap-6";

  return (
    <SectionWrapper id="shop-by-lens" style={section.style}>
      <SectionHeading
        eyebrow="The Collection"
        title={title}
        description={subtitle}
        descriptionClassName="text-[12.5px] tracking-wide"
      />
      <div className={cn("mt-8 grid lg:mt-14", gridClass)}>
        {items.map((lens, i) => (
          <CategoryCard key={lens.id} category={lens} index={i} columns={columns} />
        ))}
      </div>
    </SectionWrapper>
  );
}

function CategoryCard({
  category,
  index,
  columns,
}: {
  category: CatalogCategory;
  index: number;
  columns: 2 | 3;
}) {
  const isThreeUp = columns === 3;

  return (
    <motion.a
      href={`/products?category=${category.slug}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % columns) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex aspect-[4/3] flex-col overflow-hidden rounded-[var(--radius-md)] border border-border shadow-sm transition-shadow hover:shadow-lg lg:aspect-auto lg:h-[300px] lg:rounded-[var(--radius-lg)]"
      style={{ background: category.gradient }}
    >
      {category.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2 lg:right-5 lg:top-5 lg:h-9 lg:w-9">
        <ArrowUpRight className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </div>
      <div className="relative z-10 mt-auto flex w-full items-end p-3 lg:h-1/3 lg:items-center lg:bg-gradient-to-t lg:from-black/90 lg:via-black/55 lg:to-transparent lg:p-6">
        <div>
          {category.tagline && (
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:block lg:text-[10px]">
              {category.tagline}
            </span>
          )}
          <h3
            className={cn(
              "mt-0.5 font-heading font-bold text-white transition-transform duration-300 group-hover:-translate-y-1 line-clamp-2",
              isThreeUp
                ? "text-[13px] leading-tight sm:text-sm lg:text-[17px] lg:leading-snug"
                : "text-sm sm:text-base lg:text-lg lg:leading-snug"
            )}
          >
            {category.name}
          </h3>
          {/* {category.description && (
            // <p className="mt-1.5 hidden max-w-[90%] line-clamp-2 overflow-hidden text-xs leading-relaxed text-white/75 lg:block">
            //   {category.description}
            // </p>
          )} */}
        </div>
      </div>
    </motion.a>
  );
}