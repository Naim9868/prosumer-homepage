import type { Block } from "@/types/homepage";

export function ParagraphBlock({ block }: { block: Block<"paragraph"> }) {
  const { text, align } = block.settings;
  return (
    <p className="max-w-2xl text-[15px] leading-relaxed text-foreground-muted" style={{ textAlign: align }}>
      {text}
    </p>
  );
}
