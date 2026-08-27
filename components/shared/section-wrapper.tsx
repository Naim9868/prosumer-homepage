import type { ReactNode } from "react";
import type { SectionStyle } from "@/types/homepage";
import { cn } from "@/lib/utils";

const widthClass: Record<NonNullable<SectionStyle["containerWidth"]>, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "7xl": "max-w-[var(--page-max-width,1440px)]",
  full: "max-w-none",
};

export function SectionWrapper({
  style,
  children,
  id,
}: {
  style: SectionStyle;
  children: ReactNode;
  id?: string;
}) {
  const width = widthClass[style.containerWidth ?? "7xl"];

  return (
    <section
      id={id}
      className={cn(
        style.hideOnMobile && "hidden sm:block",
        style.hideOnDesktop && "sm:hidden"
      )}
      style={{
        backgroundColor: style.backgroundColor && style.backgroundColor !== "transparent" ? style.backgroundColor : undefined,
        backgroundImage: style.backgroundImage ? `url(${style.backgroundImage})` : undefined,
        backgroundSize: style.backgroundImage ? "cover" : undefined,
        backgroundPosition: style.backgroundImage ? "center" : undefined,
        paddingTop: style.paddingTop ?? 80,
        paddingBottom: style.paddingBottom ?? 80,
        minHeight: style.minHeight || undefined,
        overflow: style.overflow ?? "visible",
        position: style.position ?? "relative",
        zIndex: style.zIndex,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
        borderRadius: style.borderRadius || undefined,
        textAlign: style.textAlign,
      }}
    >
      <div
        className={cn("mx-auto w-full", width)}
        style={{
           paddingLeft: style.paddingLeft ?? "clamp(12px, var(--page-padding, 24px), 1vw)",
           paddingRight: style.paddingRight ?? "clamp(12px, var(--page-padding, 24px), 1vw)",

          // paddingLeft: style.paddingLeft ?? 0,
          // paddingRight: style.paddingRight ?? 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}
