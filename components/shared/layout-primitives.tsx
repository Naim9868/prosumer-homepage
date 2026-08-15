import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Container({ className, children, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full", className)}
      style={{
        maxWidth: "var(--page-max-width, 1440px)",
        paddingLeft: "clamp(12px, var(--page-padding, 24px), 5vw)",
        paddingRight: "clamp(12px, var(--page-padding, 24px), 5vw)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
      <ApertureMark className="h-3 w-3" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  descriptionClassName,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
  descriptionClassName?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-balance font-heading text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-[15px] leading-relaxed text-foreground-muted", descriptionClassName)}>
          {description}
        </p>
      )}
    </div>
  );
}

/** The recurring signature glyph: a 9-blade aperture iris. */
export function ApertureMark({ className }: { className?: string }) {
  const blades = 9;
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      {Array.from({ length: blades }).map((_, i) => {
        const angle = (i * 360) / blades;
        return (
          <polygon
            key={i}
            points="16,16 16,2 24,6"
            fill="currentColor"
            opacity="0.92"
            transform={`rotate(${angle} 16 16)`}
          />
        );
      })}
      <circle cx="16" cy="16" r="5" fill="var(--background)" />
    </svg>
  );
}
