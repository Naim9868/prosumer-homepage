import type { ReactNode } from "react";
import type { SectionStyle, ResponsiveSectionStyles, SectionDevice } from "@/types/homepage";
import { cn } from "@/lib/utils";
import { resolveSectionStyle } from "@/lib/style-utils";

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
  responsiveStyles,
  device,
  children,
  id,
  dataCustomSectionId,
  disableVisibilityClasses = false,
}: {
  style: SectionStyle;
  responsiveStyles?: ResponsiveSectionStyles;
  device?: SectionDevice;
  children: ReactNode;
  id?: string;
  dataCustomSectionId?: string;
  disableVisibilityClasses?: boolean;
}) {
  const resolved = resolveSectionStyle(style, responsiveStyles, "light", device ?? "desktop");
  const width = widthClass[resolved.containerWidth ?? "7xl"];

  return (
    <section
      id={id}
      data-custom-section-id={dataCustomSectionId}
      className={cn(
        !disableVisibilityClasses && resolved.hideOnMobile && "hidden sm:block",
        !disableVisibilityClasses && resolved.hideOnDesktop && "sm:hidden"
      )}
      style={{
        backgroundColor: resolved.backgroundColor && resolved.backgroundColor !== "transparent" ? resolved.backgroundColor : undefined,
        backgroundImage: resolved.backgroundImage ? `url(${resolved.backgroundImage})` : undefined,
        backgroundSize: resolved.backgroundImage ? "cover" : undefined,
        backgroundPosition: resolved.backgroundImage ? "center" : undefined,
        paddingTop: resolved.paddingTop ?? 80,
        paddingBottom: resolved.paddingBottom ?? 80,
        minHeight: resolved.minHeight || undefined,
        overflow: resolved.overflow ?? "visible",
        position: resolved.position ?? "relative",
        zIndex: resolved.zIndex,
        marginTop: resolved.marginTop,
        marginBottom: resolved.marginBottom,
        borderRadius: resolved.borderRadius || undefined,
        textAlign: resolved.textAlign,
      }}
    >
      <div
        className={cn("mx-auto w-full", width)}
        style={{
           paddingLeft: resolved.paddingLeft ?? "clamp(12px, var(--page-padding, 24px), 1vw)",
           paddingRight: resolved.paddingRight ?? "clamp(12px, var(--page-padding, 24px), 1vw)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
