import * as Icons from "lucide-react";
import type { Block } from "@/types/homepage";
import { cn } from "@/lib/utils";

function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export function CustomWidgetBlock({ block }: { block: Block<"customWidget"> }) {
  const s = block.settings;
  const Tag = s.tag;
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[s.icon] ?? Icons.Sparkles;
  const textAlign = s.align;
  const media = s.mediaType;
  const target = s.openInNewTab ? "_blank" : undefined;
  const rel = s.openInNewTab ? "noopener noreferrer" : undefined;

  return (
    <Tag
      className={cn("rounded-2xl border border-border/70 bg-background/70 p-5", "backdrop-blur-[1px]")}
      style={{ textAlign, color: "inherit" }}
    >
      <div className="flex flex-col" style={{ gap: `${Math.max(6, s.contentGap || 12)}px` }}>
        {s.badge ? (
          <span className="inline-flex w-fit rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
            {s.badge}
          </span>
        ) : null}

        {media === "icon" ? (
          <span className="inline-flex w-fit items-center justify-center rounded-xl bg-muted p-2 text-primary">
            <Icon style={{ width: s.iconSize || 22, height: s.iconSize || 22 }} />
          </span>
        ) : null}

        {media === "image" && s.imageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <img
              src={s.imageUrl}
              alt={s.imageAlt || s.title || "Widget image"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}

        {s.eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-wider">{s.eyebrow}</p> : null}

        {s.title ? <h3 className="font-heading text-xl font-semibold tracking-tight">{s.title}</h3> : null}

        {s.description ? <p className="text-[14px] leading-relaxed">{s.description}</p> : null}

        {s.contentHtml ? (
          <div
            className="prose prose-sm max-w-none prose-headings:font-heading"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(s.contentHtml) }}
          />
        ) : null}

        {(s.primaryLabel || s.secondaryLabel) ? (
          <div className="mt-1 flex flex-wrap gap-2" style={{ justifyContent: textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start" }}>
            {s.primaryLabel ? (
              <a
                href={s.primaryUrl || "#"}
                target={target}
                rel={rel}
                className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                {s.primaryLabel}
              </a>
            ) : null}
            {s.secondaryLabel ? (
              <a
                href={s.secondaryUrl || "#"}
                target={target}
                rel={rel}
                className="inline-flex items-center rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {s.secondaryLabel}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
