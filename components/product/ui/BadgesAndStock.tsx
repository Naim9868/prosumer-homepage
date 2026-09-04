// components/product/ui/BadgesAndStock.tsx
import type { ProductBadge } from "@/types/product";
import type { StockStatus } from "@/lib/product-helpers";

export function BadgeRow({ badges }: { badges?: ProductBadge[] }) {
  if (!badges?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, i) => (
        <span
          key={`${badge.label}-${i}`}
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
          style={{
            borderColor: badge.color ?? "var(--brass-500)",
            color: badge.color ?? "var(--brass-500)",
          }}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

const STOCK_COPY: Record<StockStatus["state"], string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
  unknown: "",
};

export function StockPill({ status }: { status: StockStatus }) {
  if (status.state === "unknown") return null;

  const tone =
    status.state === "out-of-stock"
      ? "text-red-400 border-red-400/40"
      : status.state === "low-stock"
        ? "text-[color:var(--brass-500)] border-[color:var(--brass-500)]/40"
        : "text-emerald-400 border-emerald-400/40";

  const label =
    status.state === "low-stock" && status.quantity
      ? `Only ${status.quantity} left`
      : STOCK_COPY[status.state];

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
