// components/product/sections/ProductSpecifications.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/types/product";
import { getSortedSpecGroups } from "@/lib/product-helpers";

export function ProductSpecifications({
  product,
  collapsible = false,
}: {
  product: Product;
  collapsible?: boolean;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(
    collapsible ? null : "all"
  );

  const groups = getSortedSpecGroups(product)
    .map((g) => ({
      ...g,
      specifications: g.specifications.filter((s) => s.unit !== "comparison"),
    }))
    .filter((g) => g.specifications.length > 0);

  if (!groups.length) return null;

  const isOpen = (name: string) => !collapsible || openGroup === name || openGroup === "all";

  return (
    <section id="specifications" aria-labelledby="section-specifications">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="section-specifications" className="text-eyebrow text-[10px] text-foreground-muted">
          Product Specifications
        </h2>
        {collapsible && (
          <button
            type="button"
            onClick={() => setOpenGroup(openGroup === "all" ? null : "all")}
            className="text-[11px] font-semibold text-primary transition-colors hover:text-primary/75"
          >
            {openGroup === "all" ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-md)] border border-border/70 bg-background-elevated/40">
        {groups.map((group, gi) => {
          const open = isOpen(group.groupName);
          return (
            <div
              key={group.groupName}
              className={gi > 0 ? "border-t border-border/60" : ""}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={
                  collapsible
                    ? () =>
                        setOpenGroup(
                          openGroup === group.groupName ? null : group.groupName
                        )
                    : undefined
                }
                className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left ${
                  collapsible ? "transition-colors hover:bg-muted/50" : "cursor-default"
                }`}
              >
                <span className="text-[13px] font-semibold tracking-tight text-foreground">
                  {group.groupName}
                </span>
                {collapsible && (
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-foreground-muted transition-transform duration-300 ${
                      open ? "rotate-180 text-primary" : ""
                    }`}
                  />
                )}
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={collapsible ? { height: 0, opacity: 0 } : false}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={collapsible ? { height: 0, opacity: 0 } : undefined}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <dl className="divide-y divide-border/50 border-t border-border/50 bg-muted/25 px-4">
                      {group.specifications.map((spec, index) => (
                        <div
                          key={`${group.groupName}-${spec.key}-${index}`}
                          className="flex items-baseline justify-between gap-6 py-2.5"
                        >
                          <dt className="text-[13px] text-foreground-muted">{spec.label}</dt>
                          <dd className="text-right text-[13px] font-medium tabular-nums text-foreground">
                            {spec.value}
                            {spec.unit && spec.unit !== "comparison" ? ` ${spec.unit}` : ""}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
