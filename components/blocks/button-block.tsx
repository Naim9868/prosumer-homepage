import type { Block } from "@/types/homepage";
import { cn } from "@/lib/utils";

export function ButtonBlock({ block }: { block: Block<"button"> }) {
  const { label, url, variant } = block.settings;
  return (
    <a
      href={url || "#"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-transform hover:scale-[1.02]",
        variant === "primary"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border text-foreground hover:bg-muted"
      )}
    >
      {label}
    </a>
  );
}
