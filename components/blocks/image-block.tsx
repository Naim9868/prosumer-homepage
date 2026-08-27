import type { Block } from "@/types/homepage";
import { cn } from "@/lib/utils";

export function ImageBlock({ block }: { block: Block<"image"> }) {
  const { url, alt, rounded } = block.settings;
  if (!url) {
    return (
      <div className={cn("flex aspect-video w-full items-center justify-center border border-dashed border-border bg-muted text-[12.5px] text-foreground-muted", rounded && "rounded-[var(--radius-lg)]")}>
        No image set
      </div>
    );
  }
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden", rounded && "rounded-[var(--radius-lg)]")}>
      <img src={url} alt={alt || ""} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}
