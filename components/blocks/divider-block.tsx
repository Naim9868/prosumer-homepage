import type { Block } from "@/types/homepage";

export function DividerBlock({ block }: { block: Block<"divider"> }) {
  return (
    <hr
      className="border-border"
      style={{ borderTopStyle: block.settings.style === "dashed" ? "dashed" : "solid" }}
    />
  );
}
