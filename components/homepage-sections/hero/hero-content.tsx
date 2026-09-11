"use client";

import { Fragment, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ApertureMark } from "@/components/shared/layout-primitives";
import type { HeroBadgeIcon, HeroButton, HeroButtonSize, HeroTypography } from "@/types/homepage";
import { buttonStyleCss, heroColorsFor, typographyFor, heroBreakpointFor, heroTextPositionsFor, heroTextTransform, spacingFor } from "@/lib/hero";
import { cn } from "@/lib/utils";
import { useHero } from "./hero-context";
import { ShieldCheck, Truck, Star, Gem, Sparkles, Smartphone, Headset, Package, Zap } from "lucide-react";

// ---------------------------------------------------------------
// Entrance wrapper (animated item inside a stagger container)
// ---------------------------------------------------------------

export function Entrance({
  variants,
  className,
  style,
  children,
}: {
  variants: Variants;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <motion.div variants={variants} className={className} style={style}>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------
// Badge icons
// ---------------------------------------------------------------

type IconRender = (props: { className?: string }) => React.JSX.Element;

const HERO_BADGE_ICONS: Record<HeroBadgeIcon, IconRender> = {
  aperture: ({ className }) => <ApertureMark className={className} />,
  shield: ({ className }) => <ShieldCheck className={className} />,
  truck: ({ className }) => <Truck className={className} />,
  star: ({ className }) => <Star className={className} />,
  gem: ({ className }) => <Gem className={className} />,
  sparkles: ({ className }) => <Sparkles className={className} />,
  smartphone: ({ className }) => <Smartphone className={className} />,
  headset: ({ className }) => <Headset className={className} />,
  package: ({ className }) => <Package className={className} />,
  zap: ({ className }) => <Zap className={className} />,
};

export const HERO_BADGE_ICON_OPTIONS: { value: HeroBadgeIcon; label: string }[] = [
  { value: "aperture", label: "Aperture" },
  { value: "shield", label: "Shield" },
  { value: "truck", label: "Truck" },
  { value: "star", label: "Star" },
  { value: "gem", label: "Gem" },
  { value: "sparkles", label: "Sparkles" },
  { value: "smartphone", label: "Smartphone" },
  { value: "headset", label: "Headset" },
  { value: "package", label: "Package" },
  { value: "zap", label: "Zap" },
];

export function getHeroBadgeIcon(name: HeroBadgeIcon): IconRender {
  return HERO_BADGE_ICONS[name] ?? HERO_BADGE_ICONS.sparkles;
}

// ---------------------------------------------------------------
// Eyebrow
// ---------------------------------------------------------------

export function HeroEyebrow() {
  const { slide, breakpoint, content } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const text = bp.content.eyebrow;
  if (!text) return null;
  const t = typographyFor(slide, breakpoint);
  const transform = heroTextTransform(heroTextPositionsFor(slide, breakpoint).eyebrow);
  const blockWidth = bp.styling.blockWidths.eyebrow;

  return (
    <div style={{ ...transform, ...(blockWidth > 0 ? { maxWidth: blockWidth } : {}) }}>
      <Entrance variants={content}>
        <span
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 uppercase"
          style={{
            fontSize: t.eyebrowSize,
            letterSpacing: `${t.eyebrowLetterSpacing}em`,
            fontWeight: 600,
            color: "var(--hero-accent)",
            border: "1px solid color-mix(in srgb, var(--hero-foreground) 16%, transparent)",
            background: "color-mix(in srgb, var(--hero-foreground) 6%, transparent)",
          }}
        >
          <ApertureMark className="h-3.5 w-3.5" />
          {text}
        </span>
      </Entrance>
    </div>
  );
}

// ---------------------------------------------------------------
// Heading
// ---------------------------------------------------------------

function renderHeading(text: string) {
  const parts = text.split(/(\{accent\}|\{\/accent\}|\n)/g);
  let accentOpen = false;
  return parts.map((part, i) => {
    if (part === "{accent}") {
      accentOpen = true;
      return null;
    }
    if (part === "{/accent}") {
      accentOpen = false;
      return null;
    }
    if (part === "\n") return <br key={i} />;
    if (!part) return null;
    if (accentOpen) {
      return (
        <em key={i} style={{ color: "var(--hero-accent)", fontStyle: "italic" }}>
          {part}
        </em>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function HeroHeading() {
  const { slide, breakpoint, content } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const t = typographyFor(slide, breakpoint);
  const heading = bp.content.heading;
  if (!heading || !heading.trim()) return null;
  const transform = heroTextTransform(heroTextPositionsFor(slide, breakpoint).heading);
  const blockWidth = bp.styling.blockWidths.heading;

  return (
    <div style={{ ...transform, ...(blockWidth > 0 ? { maxWidth: blockWidth } : {}) }}>
      <Entrance variants={content}>
        <h1
          className="font-heading text-balance"
          style={{
            fontSize: t.headingSize,
            fontWeight: t.headingWeight,
            lineHeight: t.headingLineHeight,
            letterSpacing: t.headingLetterSpacing,
            color: "var(--hero-foreground)",
            margin: 0,
          }}
        >
          {renderHeading(heading)}
        </h1>
      </Entrance>
    </div>
  );
}

// ---------------------------------------------------------------
// Description
// ---------------------------------------------------------------

export function HeroDescription() {
  const { slide, breakpoint, content } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const text = bp.content.description;
  if (!text) return null;
  const t = typographyFor(slide, breakpoint);
  const transform = heroTextTransform(heroTextPositionsFor(slide, breakpoint).description);
  const blockWidth = bp.styling.blockWidths.description;

  return (
    <div style={{ ...transform, ...(blockWidth > 0 ? { maxWidth: blockWidth } : {}) }}>
      <Entrance variants={content}>
        <p
          style={{
            fontSize: t.descriptionSize,
            fontWeight: t.descriptionWeight,
            lineHeight: 1.65,
            color: "var(--hero-muted)",
            margin: 0,
          }}
        >
          {text}
        </p>
      </Entrance>
    </div>
  );
}

// ---------------------------------------------------------------
// CTA Group
// ---------------------------------------------------------------

function buttonBox(size: HeroButtonSize, t: HeroTypography): CSSProperties {
  const fixed = size.width > 0 || size.height > 0;
  return {
    fontSize: size.fontSize > 0 ? size.fontSize : t.buttonFontSize,
    fontWeight: size.fontWeight > 0 ? size.fontWeight : t.buttonWeight,
    padding: `${size.paddingY}px ${size.paddingX}px`,
    borderRadius: size.borderRadius,
    ...(size.width > 0 ? { width: size.width } : {}),
    ...(size.height > 0 ? { height: size.height } : {}),
    ...(fixed ? { justifyContent: "center" } : {}),
  };
}

function buttonOverrides(button: HeroButton): CSSProperties {
  return {
    ...(button.textColor ? { color: button.textColor } : {}),
    ...(button.backgroundColor ? { background: button.backgroundColor } : {}),
    ...(button.borderColor ? { border: `1px solid ${button.borderColor}` } : {}),
  };
}

export function HeroCTAGroup({ hideSecondary = false }: { hideSecondary?: boolean }) {
  const { slide, breakpoint, cta } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const colors = heroColorsFor(slide);
  const t = typographyFor(slide, breakpoint);
  const primary = bp.buttons.primary;
  const secondary = bp.buttons.secondary;
  const transform = heroTextTransform(heroTextPositionsFor(slide, breakpoint).buttons);
  const blockWidth = bp.styling.blockWidths.buttons;

  return (
    <div style={{ ...transform, ...(blockWidth > 0 ? { maxWidth: blockWidth } : {}) }}>
      <Entrance variants={cta} className="flex flex-wrap items-center gap-4">
        {primary.text && (
          <a
            href={primary.url || "#"}
            className="group inline-flex items-center gap-2 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            style={{
              ...buttonStyleCss(primary.style, colors),
              ...buttonBox(primary.size, t),
              ...buttonOverrides(primary),
            }}
          >
            {primary.text}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        )}
        {!hideSecondary && secondary.text && (
          <a
            href={secondary.url || "#"}
            className="inline-flex items-center gap-2 transition-colors"
            style={{
              ...buttonStyleCss(secondary.style, colors),
              ...buttonBox(secondary.size, t),
              ...buttonOverrides(secondary),
            }}
          >
            {secondary.text}
          </a>
        )}
      </Entrance>
    </div>
  );
}

// ---------------------------------------------------------------
// Trust Badges
// ---------------------------------------------------------------

export function HeroTrustBadges() {
  const { slide, breakpoint, badge } = useHero();
  const bp = heroBreakpointFor(slide, breakpoint);
  const badges = bp.badges;
  if (!badges || badges.length === 0) return null;
  const transform = heroTextTransform(heroTextPositionsFor(slide, breakpoint).badges);
  const blockWidth = bp.styling.blockWidths.badges;

  return (
    <div style={{ ...transform, ...(blockWidth > 0 ? { maxWidth: blockWidth } : {}) }}>
      <Entrance variants={badge} className="flex flex-wrap gap-x-8 gap-y-3">
        {badges.map((b) => {
          const Icon = getHeroBadgeIcon(b.icon);
          if (!b.description) {
            return (
              <div key={b.id} className="flex items-center gap-2 text-[13px] font-medium" style={{ color: "var(--hero-muted)" }}>
                <span style={{ color: "var(--hero-accent)" }} className="flex items-center">
                  <Icon className="h-4 w-4" />
                </span>
                {b.title}
              </div>
            );
          }
          return (
            <div key={b.id} className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                style={{ borderColor: "var(--hero-border)", color: "var(--hero-accent)" }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--hero-foreground)" }}>
                  {b.title}
                </p>
                <p className="text-[12px]" style={{ color: "var(--hero-muted)" }}>
                  {b.description}
                </p>
              </div>
            </div>
          );
        })}
      </Entrance>
    </div>
  );
}

// ---------------------------------------------------------------
// HeroContent (main export)
// ---------------------------------------------------------------

export function HeroContent({ centered = false, className }: { centered?: boolean; className?: string }) {
  const { slide, breakpoint, active, container } = useHero();
  const spacing = spacingFor(slide, breakpoint);
  const isMobile = breakpoint === "mobile";
  const styling = heroBreakpointFor(slide, breakpoint).styling;
  const align = centered ? "center" : styling.textAlign;
  const hideBadges = isMobile && !styling.showBadges;
  const hideSecondary = isMobile && !styling.showSecondaryCta;
  const itemsClass = align === "center" ? "items-center" : align === "right" ? "items-end" : "items-start";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={active ? "show" : "hidden"}
      className={cn("flex min-w-0 flex-col", itemsClass, className)}
      style={{ gap: spacing.elementGap, textAlign: align }}
    >
      <HeroEyebrow />
      <HeroHeading />
      <HeroDescription />
      <HeroCTAGroup hideSecondary={hideSecondary} />
      {!hideBadges && <HeroTrustBadges />}
    </motion.div>
  );
}
