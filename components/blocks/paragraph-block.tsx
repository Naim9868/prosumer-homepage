import type { Block } from "@/types/homepage";

export function ParagraphBlock({ block }: { block: Block<"paragraph"> }) {
  const { text, align } = block.settings;
  return (
    <p
      className="max-w-2xl"
      style={{
        textAlign: align,
        fontSize: "inherit",
        lineHeight: "inherit",
        color: "inherit",
        fontWeight: "inherit",
        fontFamily: "inherit",
        letterSpacing: "inherit",
        textTransform: "inherit",
        textDecoration: "inherit",
      }}
    >
      {text}
    </p>
  );
}
