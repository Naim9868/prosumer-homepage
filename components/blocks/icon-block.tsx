import * as Icons from "lucide-react";
import type { Block } from "@/types/homepage";
import type { LucideIcon } from "lucide-react";

export function IconBlock({ block }: { block: Block<"icon"> }) {
  const { icon, label, size } = block.settings;
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[icon] ?? Icons.Star;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <IconComponent style={{ width: size, height: size }} className="text-primary" />
      <span className="text-[13px] font-medium text-foreground-muted">{label}</span>
    </div>
  );
}
