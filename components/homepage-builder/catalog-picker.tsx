"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CatalogPickerItem {
  id: string;
  label: string;
  image?: string;
  subtitle?: string;
}

/**
 * Searchable, checkable list of catalog items for the builder. Feeds the
 * product / category selectors on every product-aware section and block
 * editor, so admins pick real MongoDB products by hand.
 */
export function CatalogPicker({
  items,
  selected,
  onChange,
  limit,
  searchPlaceholder = "Search...",
  emptyLabel = "No items in catalog.",
}: {
  items: CatalogPickerItem[];
  selected: string[];
  onChange: (ids: string[]) => void;
  limit?: number;
  searchPlaceholder?: string;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || (item.subtitle ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (limit && selected.length >= limit) {
      onChange([...selected.slice(-(limit - 1)), id]);
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-[var(--radius-sm)] border border-border bg-background py-1.5 pl-8 pr-7 text-[12.5px] text-foreground outline-none placeholder:text-foreground-muted focus:border-primary"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-foreground-muted transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="max-h-56 overflow-y-auto rounded-[var(--radius-sm)] border border-border">
        {filtered.length === 0 ? (
          <p className="px-3 py-3 text-[12.5px] text-foreground-muted">{query ? "No matches." : emptyLabel}</p>
        ) : (
          filtered.map((item) => {
            const active = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-muted",
                  active && "bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {active && <Check className="h-3 w-3" />}
                </span>
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-8 w-8 flex-shrink-0 rounded-[6px] object-cover" />
                ) : (
                  <span className="h-8 w-8 flex-shrink-0 rounded-[6px] bg-muted" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-foreground">{item.label}</span>
                  {item.subtitle && (
                    <span className="block truncate text-[11px] text-foreground-muted">{item.subtitle}</span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-foreground-muted">
          <span>
            {selected.length} selected
            {limit ? ` (max ${limit})` : ""}
          </span>
          <button type="button" onClick={() => onChange([])} className="font-semibold text-primary hover:underline">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
