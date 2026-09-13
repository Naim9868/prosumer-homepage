import type { CSSProperties } from "react";
import type { PageSettings, ContactChannelType, NavbarDeviceTypography, NavbarTypographySettings, EditorDevice } from "@/types/homepage";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";

function pickNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function pickBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function pickDeviceTypography(raw: Record<string, unknown>, fallback: NavbarDeviceTypography): NavbarDeviceTypography {
  const d = raw && typeof raw === "object" ? raw : {};
  return {
    fontFamily: typeof d.fontFamily === "string" ? d.fontFamily : fallback.fontFamily,
    fontSize: pickNumber(d.fontSize, fallback.fontSize),
    fontWeight: pickNumber(d.fontWeight, fallback.fontWeight),
  };
}

/** Normalize legacy flat fontFamily/fontSize/fontWeight into per-device typography. */
function normalizeNavbarTypography(raw: Record<string, unknown>): NavbarTypographySettings {
  const rawTyp = raw.typography;
  if (rawTyp && typeof rawTyp === "object" && !Array.isArray(rawTyp)) {
    const t = rawTyp as Record<string, unknown>;
    const def = DEFAULT_PAGE_SETTINGS.navbar.typography;
    return {
      desktop: pickDeviceTypography((t.desktop ?? {}) as Record<string, unknown>, def.desktop!),
      tablet: pickDeviceTypography((t.tablet ?? {}) as Record<string, unknown>, def.tablet!),
      mobile: pickDeviceTypography((t.mobile ?? {}) as Record<string, unknown>, def.mobile!),
    };
  }
  // Legacy: flat fontFamily/fontSize/fontWeight → apply to all devices
  const legacyFamily = typeof raw.fontFamily === "string" ? raw.fontFamily : "";
  const legacySize = pickNumber(raw.fontSize, 0);
  const legacyWeight = pickNumber(raw.fontWeight, 0);
  if (legacyFamily || legacySize > 0 || legacyWeight > 0) {
    const device: NavbarDeviceTypography = { fontFamily: legacyFamily, fontSize: legacySize, fontWeight: legacyWeight };
    return { desktop: device, tablet: device, mobile: device };
  }
  return DEFAULT_PAGE_SETTINGS.navbar.typography;
}

/**
 * Resolve per-device navbar typography for the current device.
 * Falls back: mobile → tablet → desktop → defaults.
 */
export function resolveNavbarTypography(
  typography: NavbarTypographySettings | undefined,
  device: EditorDevice,
): NavbarDeviceTypography {
  const def = DEFAULT_PAGE_SETTINGS.navbar.typography;
  if (device === "mobile") {
    return typography?.mobile ?? typography?.tablet ?? typography?.desktop ?? def.mobile!;
  }
  if (device === "tablet") {
    return typography?.tablet ?? typography?.desktop ?? def.tablet!;
  }
  return typography?.desktop ?? def.desktop!;
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
      opacity: pickNumber(navbar.opacity, DEFAULT_PAGE_SETTINGS.navbar.opacity),
      backgroundColor: typeof navbar.backgroundColor === "string" ? navbar.backgroundColor : DEFAULT_PAGE_SETTINGS.navbar.backgroundColor,
      textColor: typeof navbar.textColor === "string" ? navbar.textColor : DEFAULT_PAGE_SETTINGS.navbar.textColor,
      mutedTextColor: typeof navbar.mutedTextColor === "string" ? navbar.mutedTextColor : DEFAULT_PAGE_SETTINGS.navbar.mutedTextColor,
      hoverColor: typeof navbar.hoverColor === "string" ? navbar.hoverColor : DEFAULT_PAGE_SETTINGS.navbar.hoverColor,
      hoverBackgroundColor: typeof navbar.hoverBackgroundColor === "string" ? navbar.hoverBackgroundColor : DEFAULT_PAGE_SETTINGS.navbar.hoverBackgroundColor,
      borderColor: typeof navbar.borderColor === "string" ? navbar.borderColor : DEFAULT_PAGE_SETTINGS.navbar.borderColor,
      accentColor: typeof navbar.accentColor === "string" ? navbar.accentColor : DEFAULT_PAGE_SETTINGS.navbar.accentColor,
      buttonTextColor: typeof navbar.buttonTextColor === "string" ? navbar.buttonTextColor : DEFAULT_PAGE_SETTINGS.navbar.buttonTextColor,
      darkTextColor: typeof navbar.darkTextColor === "string" ? navbar.darkTextColor : DEFAULT_PAGE_SETTINGS.navbar.darkTextColor,
      darkMutedTextColor: typeof navbar.darkMutedTextColor === "string" ? navbar.darkMutedTextColor : DEFAULT_PAGE_SETTINGS.navbar.darkMutedTextColor,
      lightTextColor: typeof navbar.lightTextColor === "string" ? navbar.lightTextColor : DEFAULT_PAGE_SETTINGS.navbar.lightTextColor,
      lightMutedTextColor: typeof navbar.lightMutedTextColor === "string" ? navbar.lightMutedTextColor : DEFAULT_PAGE_SETTINGS.navbar.lightMutedTextColor,
      typography: normalizeNavbarTypography(navbar),
    },
    footer: {
      enabled: pickBool(footer.enabled, DEFAULT_PAGE_SETTINGS.footer.enabled),
      backgroundColor: typeof footer.backgroundColor === "string" ? footer.backgroundColor : DEFAULT_PAGE_SETTINGS.footer.backgroundColor,
      paddingTop: pickNumber(footer.paddingTop, DEFAULT_PAGE_SETTINGS.footer.paddingTop),
    },
    trustBadges: (() => {
      const rawTb = raw.trustBadges && typeof raw.trustBadges === "object" ? raw.trustBadges as Record<string, unknown> : {};
      const rawBadges = Array.isArray(rawTb.badges) ? rawTb.badges : [];
      const badges = rawBadges
        .filter((b): b is Record<string, unknown> => b !== null && typeof b === "object")
        .map((b) => ({
          icon: typeof b.icon === "string" ? b.icon : "",
          title: typeof b.title === "string" ? b.title : "",
          subtitle: typeof b.subtitle === "string" ? b.subtitle : "",
        }));
      return {
        enabled: pickBool(rawTb.enabled, DEFAULT_PAGE_SETTINGS.trustBadges.enabled),
        badges: badges.length > 0 ? badges : DEFAULT_PAGE_SETTINGS.trustBadges.badges,
      };
    })(),
    productsPerPage: pickNumber(raw.productsPerPage, DEFAULT_PAGE_SETTINGS.productsPerPage),
    contact: (() => {
      const rawC = raw.contact && typeof raw.contact === "object" ? raw.contact as Record<string, unknown> : {};
      const rawChannels = Array.isArray(rawC.channels) ? rawC.channels : [];
      const defaultChannels = DEFAULT_PAGE_SETTINGS.contact.channels;
      const channels = rawChannels.length > 0
        ? rawChannels
            .filter((ch): ch is Record<string, unknown> => ch !== null && typeof ch === "object")
            .map((ch) => ({
              type: (typeof ch.type === "string" ? ch.type : "") as ContactChannelType,
              enabled: pickBool(ch.enabled, false),
              value: typeof ch.value === "string" ? ch.value : "",
              label: typeof ch.label === "string" ? ch.label : "",
            }))
        : defaultChannels;
      return {
        enabled: pickBool(rawC.enabled, DEFAULT_PAGE_SETTINGS.contact.enabled),
        accentColor: typeof rawC.accentColor === "string" ? rawC.accentColor : DEFAULT_PAGE_SETTINGS.contact.accentColor,
        channels,
      };
    })(),
    productGrid: (() => {
      const rawPg = raw.productGrid && typeof raw.productGrid === "object" ? raw.productGrid as Record<string, unknown> : {};
      const pickDevice = (key: string) => {
        const d = rawPg[key] && typeof rawPg[key] === "object" ? rawPg[key] as Record<string, unknown> : {};
        const defaults = DEFAULT_PAGE_SETTINGS.productGrid[key as "desktop" | "tablet"];
        return {
          columns: pickNumber(d.columns, defaults.columns),
          gap: pickNumber(d.gap, defaults.gap),
        };
      };
      return {
        desktop: pickDevice("desktop"),
        tablet: pickDevice("tablet"),
      };
    })(),
  };
}

/** CSS custom properties consumed by Container / SectionWrapper / etc. */
export function pageCssVars(page?: PageSettings | null): CSSProperties {
  const s = normalizePageSettings(page);
  return {
    "--page-max-width": `${s.containerWidth}px`,
    "--page-padding": `${s.sidePadding}px`,
    "--product-grid-desktop-cols": s.productGrid.desktop.columns,
    "--product-grid-desktop-gap": `${s.productGrid.desktop.gap}px`,
    "--product-grid-tablet-cols": s.productGrid.tablet.columns,
    "--product-grid-tablet-gap": `${s.productGrid.tablet.gap}px`,
  } as CSSProperties;
}