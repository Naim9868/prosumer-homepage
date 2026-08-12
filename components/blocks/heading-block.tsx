import type { Block } from "@/types/homepage";
import { cn } from "@/lib/utils";

export function HeadingBlock({ block }: { block: Block<"heading"> }) {
  const { text, level, align } = block.settings;
  const Tag = level;
  const sizeClass = level === "h2" ? "text-3xl sm:text-4xl" : level === "h3" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";
  return (
    <Tag
      className={cn("font-heading font-semibold tracking-tight text-foreground", sizeClass)}
      style={{ textAlign: align }}
    >
      {text}
    </Tag>
  );
}
