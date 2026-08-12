import type { Block } from "@/types/homepage";

export function VideoBlock({ block }: { block: Block<"video"> }) {
  const { youtubeId } = block.settings;
  if (!youtubeId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border bg-muted text-[12.5px] text-foreground-muted">
        No video set
      </div>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-border">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title="Embedded video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
