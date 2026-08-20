import type { CSSProperties } from "react";
import type { PageSettings } from "@/types/homepage";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";

function pickNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function pickBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/** Deep-merge raw persisted page settings over the defaults so legacy/partial data always hydrates. */
export function normalizePageSettings(input: unknown): PageSettings {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const navbar = (raw.navbar && typeof raw.navbar === "object" ? raw.navbar : {}) as Record<string, unknown>;
  const footer = (raw.footer && typeof raw.footer === "object" ? raw.footer : {}) as Record<string, unknown>;

  return {
    containerWidth: pickNumber(raw.containerWidth, DEFAULT_PAGE_SETTINGS.containerWidth),
    sidePadding: pickNumber(raw.sidePadding, DEFAULT_PAGE_SETTINGS.sidePadding),
    navbar: {
      enabled: pickBool(navbar.enabled, DEFAULT_PAGE_SETTINGS.navbar.enabled),
      fixed: pickBool(navbar.fixed, DEFAULT_PAGE_SETTINGS.navbar.fixed),
      transparent: pickBool(navbar.transparent, DEFAULT_PAGE_SETTINGS.navbar.transparent),
      height: pickNumber(navbar.height, DEFAULT_PAGE_SETTINGS.navbar.height),
      backgroundColor: typeof navbar.backgroundColor === "string" ? navbar.backgroundColor : DEFAULT_PAGE_SETTINGS.navbar.backgroundColor,
      textColor: typeof navbar.textColor === "string" ? navbar.textColor : DEFAULT_PAGE_SETTINGS.navbar.textColor,
      mutedTextColor: typeof navbar.mutedTextColor === "string" ? navbar.mutedTextColor : DEFAULT_PAGE_SETTINGS.navbar.mutedTextColor,
      hoverColor: typeof navbar.hoverColor === "string" ? navbar.hoverColor : DEFAULT_PAGE_SETTINGS.navbar.hoverColor,
      hoverBackgroundColor: typeof navbar.hoverBackgroundColor === "string" ? navbar.hoverBackgroundColor : DEFAULT_PAGE_SETTINGS.navbar.hoverBackgroundColor,
      borderColor: typeof navbar.borderColor === "string" ? navbar.borderColor : DEFAULT_PAGE_SETTINGS.navbar.borderColor,
      accentColor: typeof navbar.accentColor === "string" ? navbar.accentColor : DEFAULT_PAGE_SETTINGS.navbar.accentColor,
      buttonTextColor: typeof navbar.buttonTextColor === "string" ? navbar.buttonTextColor : DEFAULT_PAGE_SETTINGS.navbar.buttonTextColor,
      fontFamily: typeof navbar.fontFamily === "string" ? navbar.fontFamily : DEFAULT_PAGE_SETTINGS.navbar.fontFamily,
      fontSize: pickNumber(navbar.fontSize, DEFAULT_PAGE_SETTINGS.navbar.fontSize),
      fontWeight: pickNumber(navbar.fontWeight, DEFAULT_PAGE_SETTINGS.navbar.fontWeight),
    },
    footer: {
      enabled: pickBool(footer.enabled, DEFAULT_PAGE_SETTINGS.footer.enabled),
      backgroundColor: typeof footer.backgroundColor === "string" ? footer.backgroundColor : DEFAULT_PAGE_SETTINGS.footer.backgroundColor,
      paddingTop: pickNumber(footer.paddingTop, DEFAULT_PAGE_SETTINGS.footer.paddingTop),
    },
  };
}

/** CSS custom properties consumed by Container / SectionWrapper / etc. */
export function pageCssVars(page?: PageSettings | null): CSSProperties {
  const s = normalizePageSettings(page);
  return {
    "--page-max-width": `${s.containerWidth}px`,
    "--page-padding": `${s.sidePadding}px`,
  } as CSSProperties;
}