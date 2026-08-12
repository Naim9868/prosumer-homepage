import type { Block } from "@/types/homepage";

export function SpacerBlock({ block }: { block: Block<"spacer"> }) {
  return <div style={{ height: block.settings.height }} aria-hidden />;
}
