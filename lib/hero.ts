import type { CSSProperties } from "react";
import { containerVariants, entranceVariants } from "@/components/homepage-sections/hero/hero-animations";
import type {
  HeroBackgroundSize,
  HeroBadge,
  HeroBadgeIcon,
  HeroBlockWidths,
  HeroBreakpoint,
  HeroBreakpointData,
  HeroBreakpointStyling,
  HeroButton,
  HeroButtonSize,
  HeroButtonStyle,
  HeroColors,
  HeroContent,
  HeroContentOrder,
  HeroEditMode,
  HeroHeightMode,
  HeroImagePosition,
  HeroLayout,
  HeroMedia,
  HeroPreset,
  HeroSettings,
  HeroSliderSettings,
  HeroSlide,
  HeroSpacing,
  HeroTextAlign,
  HeroTextPosition,
  HeroTextPositions,
  HeroTheme,
  HeroThemeData,
  HeroTypography,
} from "@/types/homepage";

// ---------------------------------------------------------------
// Meta
// ---------------------------------------------------------------

export const HERO_LAYOUTS: { value: HeroLayout; label: string; description: string }[] = [
  { value: "cinematic", label: "Cinematic", description: "Full-bleed background image with overlay." },
  { value: "apexel", label: "Apexel", description: "Full-bleed image with bottom-anchored copy and CTA." },
];

export const HERO_LAYOUT_META: Record<HeroLayout, { label: string; description: string }> = {
  cinematic: { label: "Cinematic", description: "Full-bleed background image with overlay." },
  apexel: { label: "Apexel", description: "Full-bleed image with bottom-anchored copy and CTA." },
};

export const HERO_THEMES: Record<HeroTheme, HeroColors> = {
  dark: {
    background: "#080A0C",
    foreground: "#FFFFFF",
    muted: "#B8BDC4",
    accent: "#D8B36A",
    border: "#292929",
    card: "#121416",
    overlay: "rgba(0, 0, 0, 0.45)",
  },
  light: {
    background: "#F5F5F2",
    foreground: "#111111",
    muted: "#666666",
    accent: "#B88A3B",
    border: "#DDDDD8",
    card: "#FFFFFF",
    overlay: "rgba(245, 245, 242, 0.6)",
  },
};

export const HERO_PRESETS: { value: HeroPreset; label: string; description: string }[] = [
  { value: "premium-dark", label: "Premium Dark", description: "Dark cinematic + gold accent." },
  { value: "premium-light", label: "Premium Light", description: "Warm paper light theme." },
  { value: "cinematic-dark", label: "Cinematic Dark", description: "Deep black, full-bleed imagery." },
  { value: "minimal-light", label: "Minimal Light", description: "Clean, airy, minimal." },
];

export const HERO_THEME_OPTIONS: { value: HeroTheme; label: string; description: string }[] = [
  { value: "dark", label: "Dark", description: "Deep background with the dark hero image." },
  { value: "light", label: "Light", description: "Bright background with the light hero image." },
];

// ---------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------

export const DEFAULT_HERO_SLIDER: HeroSliderSettings = {
  autoplay: true,
  interval: 5000,
  pauseOnHover: true,
  loop: true,
  transition: "fade",
  transitionDuration: 700,
  showArrows: true,
  showDots: true,
  showProgress: true,
};

const DEFAULT_HERO_TYPOGRAPHY: HeroTypography = {
  headingSize: 62,
  headingWeight: 800,
  headingLineHeight: 1.04,
  headingLetterSpacing: -1.5,
  descriptionSize: 17,
  descriptionWeight: 400,
  eyebrowSize: 12.5,
  eyebrowLetterSpacing: 0.22,
  buttonFontSize: 14,
  buttonWeight: 700,
};

const DEFAULT_HERO_BREAKPOINT_LAYOUT: Record<
  HeroBreakpoint,
  Omit<HeroBreakpointStyling, "typography" | "spacing" | "overlayOpacity" | "textPositions" | "blockWidths">
> = {
  desktop: {
    textAlign: "left",
    contentOrder: "content-first",
    heightMode: "auto",
    customHeight: 640,
    contentGap: 48,
    imagePosition: { x: 0, y: 0, scale: 1, objectPosition: "center center" },
    showSecondaryCta: true,
    showBadges: true,
  },
  tablet: {
    textAlign: "left",
    contentOrder: "content-first",
    heightMode: "auto",
    customHeight: 560,
    contentGap: 32,
    imagePosition: { x: 0, y: 0, scale: 1, objectPosition: "center center" },
    showSecondaryCta: true,
    showBadges: true,
  },
  mobile: {
    textAlign: "center",
    contentOrder: "media-first",
    heightMode: "auto",
    customHeight: 520,
    contentGap: 24,
    imagePosition: { x: 0, y: 0, scale: 1, objectPosition: "center center" },
    showSecondaryCta: true,
    showBadges: true,
  },
};

/** Per-device typography size overrides applied on top of DEFAULT_HERO_TYPOGRAPHY. */
const DEFAULT_HERO_BREAKPOINT_TYPOGRAPHY: Record<
  HeroBreakpoint,
  Pick<HeroTypography, "headingSize" | "descriptionSize" | "eyebrowSize">
> = {
  desktop: { headingSize: 62, descriptionSize: 17, eyebrowSize: 12.5 },
  tablet: { headingSize: 46, descriptionSize: 16, eyebrowSize: 12 },
  mobile: { headingSize: 34, descriptionSize: 15, eyebrowSize: 11 },
};

function defaultBlockWidths(): HeroBlockWidths {
  return { eyebrow: 0, heading: 0, description: 0, buttons: 0, badges: 0 };
}

export function defaultHeroMedia(theme: HeroTheme = "dark"): HeroMedia {
  const isDark = theme === "dark";
  return {
    source: "upload",
    desktopImage: "",
    tabletImage: "",
    mobileImage: "",
    backgroundImage: isDark ? "/images/hero_image_for_desktop.png" : "/images/hero-image-bg-light-theme.png",
    backgroundImageDark: "/images/hero_image_for_desktop.png",
    productImage: "",
    productId: "",
    position: { x: 0, y: 0, scale: 1, objectPosition: "center center" },
    backgroundSize: { width: 1920, height: 1080 },
    backgroundPosition: { x: 0, y: 0 },
    floatingBadge: {
      enabled: true,
      title: "10x Optical",
      subtitle: "Reach without crop",
      position: "top-left",
    },
  };
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function badge(icon: HeroBadgeIcon, title: string, description: string): HeroBadge {
  return { id: uid("hbadge"), icon, title, description };
}

export function defaultHeroBadges(): HeroBadge[] {
  return [
    badge("shield", "2-Year Warranty", ""),
    badge("truck", "Free Dhaka Delivery", ""),
    badge("star", "4.9 / 5 from 1,240 shooters", ""),
  ];
}

export function defaultHeroButtonSize(overrides: Partial<HeroButtonSize> = {}): HeroButtonSize {
  return { width: 0, height: 0, borderRadius: 9999, paddingX: 30, paddingY: 15, fontSize: 0, fontWeight: 0, ...overrides };
}

export function defaultHeroButtons(): { primary: HeroButton; secondary: HeroButton } {
  return {
    primary: { text: "Shop the Collection", url: "#shop-by-lens", style: "filled", size: defaultHeroButtonSize() },
    secondary: { text: "Watch it in Use", url: "#video", style: "outline", size: defaultHeroButtonSize({ paddingX: 26 }) },
  };
}

// ---------------------------------------------------------------
// Slide factories
// ---------------------------------------------------------------

/** Build the default content + buttons + badges for one theme. */
export function defaultHeroContentData(): { content: HeroContent; buttons: HeroSlide["buttons"]; badges: HeroBadge[] } {
  return {
    content: {
      eyebrow: "Optical-grade mobile lenses",
      heading: "See what your phone\n{accent}can't.{/accent}",
      description:
        "Multi-coated glass, machined titanium clips, and true optical correction — built for photographers who outgrew their phone camera but not their phone.",
    },
    buttons: defaultHeroButtons(),
    badges: defaultHeroBadges(),
  };
}

const DEFAULT_HERO_SPACING: HeroSpacing = {
  containerMaxWidth: 1280,
  paddingTop: 132,
  paddingBottom: 96,
  paddingX: 40,
  contentGap: 48,
  elementGap: 20,
  mediaOffset: 0,
  productImageOffset: 0,
};

function defaultTextPositions(): HeroTextPositions {
  return {
    eyebrow: { x: 0, y: 0 },
    heading: { x: 0, y: 0 },
    description: { x: 0, y: 0 },
    buttons: { x: 0, y: 0 },
    badges: { x: 0, y: 0 },
  };
}

/** Build the default visual set (media + per-device styling) for one theme. */
export function defaultHeroThemeVisuals(theme: HeroTheme): HeroThemeData {
  const build = (bp: HeroBreakpoint): HeroBreakpointData => ({
    ...defaultHeroContentData(),
    media: defaultHeroMedia(theme),
    styling: {
      typography: { ...DEFAULT_HERO_TYPOGRAPHY, ...DEFAULT_HERO_BREAKPOINT_TYPOGRAPHY[bp] },
      spacing: { ...DEFAULT_HERO_SPACING },
      overlayOpacity: 1,
      textPositions: defaultTextPositions(),
      blockWidths: defaultBlockWidths(),
      ...DEFAULT_HERO_BREAKPOINT_LAYOUT[bp],
    },
  });

  return {
    colors: { ...HERO_THEMES[theme] },
    breakpoints: {
      desktop: build("desktop"),
      tablet: build("tablet"),
      mobile: build("mobile"),
    },
  };
}

/** The complete dataset for a theme; falls back to dark when a theme is missing. */
export function heroThemeDataFor(slide: HeroSlide, theme: HeroTheme): HeroThemeData {
  return slide.themes[theme] ?? slide.themes.dark;
}

/** Resolve which theme a slide should render as. */
export function resolveHeroTheme(preference: HeroTheme | null | undefined, slide: HeroSlide): HeroTheme {
  return preference ?? slide.theme;
}

/**
 * Produce a slide whose top-level `theme`, `content`, `buttons`, and `badges`
 * reflect the given theme's dataset (using the desktop breakpoint as the
 * representative snapshot). The customer-facing renderer reads per-device data
 * from `themes`, so these top-level fields are only a convenience mirror.
 */
export function materializeHeroSlide(slide: HeroSlide, theme: HeroTheme): HeroSlide {
  const data = heroThemeDataFor(slide, theme);
  const bp = data.breakpoints.desktop;
  return {
    ...slide,
    theme,
    content: { ...bp.content },
    buttons: {
      primary: { ...bp.buttons.primary },
      secondary: { ...bp.buttons.secondary },
    },
    badges: (bp.badges ?? []).map((b) => ({ ...b })),
  };
}

/** Run a mutation across every breakpoint of a theme (used on fresh default data only). */
export function forEachBreakpoint(data: HeroThemeData, fn: (bp: HeroBreakpointData) => void): void {
  (Object.keys(data.breakpoints) as HeroBreakpoint[]).forEach((b) => fn(data.breakpoints[b]));
}

export function createDefaultHeroSlide(order = 0): HeroSlide {
  const dark = defaultHeroThemeVisuals("dark");
  const light = defaultHeroThemeVisuals("light");
  // Cinematic shows the full-bleed image with no scrim by default.
  forEachBreakpoint(dark, (bp) => {
    bp.styling.overlayOpacity = 0;
  });
  forEachBreakpoint(light, (bp) => {
    bp.styling.overlayOpacity = 0;
  });
  const theme: HeroTheme = "dark";
  return materializeHeroSlide(
    {
      id: uid("hslide"),
      name: "Premium Camera",
      enabled: true,
      order,
      layout: "cinematic",
      theme,
      content: dark.breakpoints.desktop.content,
      buttons: dark.breakpoints.desktop.buttons,
      badges: dark.breakpoints.desktop.badges,
      themes: { dark, light },
      animation: {
        contentEntrance: "fade-up",
        imageEntrance: "scale",
        badgeEntrance: "fade-up",
        ctaEntrance: "fade-up",
        duration: 700,
        delay: 150,
        stagger: 100,
      },
    },
    theme
  );
}

export function createEmptyHeroSlide(order = 0): HeroSlide {
  const slide = createDefaultHeroSlide(order);
  slide.name = "New Slide";
  const emptyContent: HeroContent = { eyebrow: "NEW EYEBROW", heading: "New heading", description: "Add a description." };
  const emptyButtons: HeroSlide["buttons"] = {
    primary: { text: "Shop Now", url: "#", style: "filled", size: defaultHeroButtonSize() },
    secondary: { text: "Learn More", url: "#", style: "outline", size: defaultHeroButtonSize({ paddingX: 26 }) },
  };
  [slide.themes.dark, slide.themes.light].forEach((data) => {
    forEachBreakpoint(data, (bp) => {
      bp.content = { ...emptyContent };
      bp.buttons = { ...emptyButtons };
      bp.badges = [];
      bp.media.floatingBadge.enabled = false;
    });
  });
  return materializeHeroSlide(slide, slide.theme);
}

export function duplicateHeroSlide(slide: HeroSlide): HeroSlide {
  const copy = JSON.parse(JSON.stringify(slide)) as HeroSlide;
  copy.id = uid("hslide");
  copy.name = `${slide.name} (Copy)`;
  const reId = (b: HeroBadge): HeroBadge => ({ ...b, id: uid("hbadge") });
  const reIdIn = (data: HeroThemeData): HeroThemeData => ({
    ...data,
    breakpoints: {
      desktop: { ...data.breakpoints.desktop, badges: data.breakpoints.desktop.badges.map(reId) },
      tablet: { ...data.breakpoints.tablet, badges: data.breakpoints.tablet.badges.map(reId) },
      mobile: { ...data.breakpoints.mobile, badges: data.breakpoints.mobile.badges.map(reId) },
    },
  });
  copy.themes = {
    dark: reIdIn(copy.themes.dark),
    light: reIdIn(copy.themes.light),
  };
  return materializeHeroSlide(copy, copy.theme);
}

// ---------------------------------------------------------------
// Presets (design config only — never touches content/media/badges)
// ---------------------------------------------------------------

/**
 * Switch the active theme of a slide. Each theme stores its own content,
 * buttons, badges, media, styling, and responsive settings, so switching just
 * points the renderer at the other theme's data — nothing is copied or
 * overwritten. The top-level content/buttons/badges mirror is re-materialized
 * from the newly active theme.
 */
export function applyHeroTheme(slide: HeroSlide, theme: HeroTheme): HeroSlide {
  return materializeHeroSlide(slide, theme);
}

/**
 * Apply a design patch (colors at theme level; typography/spacing across every
 * breakpoint) so a preset restyles the whole slide consistently.
 */
export function applyThemeStyling(
  data: HeroThemeData,
  opts: { colors?: Partial<HeroColors>; typography?: Partial<HeroTypography>; spacing?: Partial<HeroSpacing> }
): HeroThemeData {
  const bps = {} as Record<HeroBreakpoint, HeroBreakpointData>;
  (Object.keys(data.breakpoints) as HeroBreakpoint[]).forEach((bp) => {
    const s = data.breakpoints[bp].styling;
    bps[bp] = {
      ...data.breakpoints[bp],
      styling: {
        ...s,
        typography: { ...s.typography, ...opts.typography },
        spacing: { ...s.spacing, ...opts.spacing },
      },
    };
  });
  return { ...data, colors: { ...data.colors, ...opts.colors }, breakpoints: bps };
}

export function applyHeroPreset(slide: HeroSlide, preset: HeroPreset): HeroSlide {
  const premiumTypography = { ...DEFAULT_HERO_TYPOGRAPHY };
  switch (preset) {
    case "premium-dark":
      return materializeHeroSlide(
        {
          ...slide,
          layout: "cinematic",
          theme: "dark",
          themes: {
            ...slide.themes,
            dark: applyThemeStyling(slide.themes.dark, { colors: { ...HERO_THEMES.dark }, typography: premiumTypography }),
          },
        },
        "dark"
      );
    case "premium-light":
      return materializeHeroSlide(
        {
          ...slide,
          layout: "cinematic",
          theme: "light",
          themes: {
            ...slide.themes,
            light: applyThemeStyling(slide.themes.light, { colors: { ...HERO_THEMES.light }, typography: premiumTypography }),
          },
        },
        "light"
      );
    case "cinematic-dark":
      return materializeHeroSlide(
        {
          ...slide,
          layout: "cinematic",
          theme: "dark",
          themes: {
            ...slide.themes,
            dark: applyThemeStyling(slide.themes.dark, {
              colors: {
                background: "#050507",
                foreground: "#FFFFFF",
                muted: "#8F8F8F",
                accent: "#D8B36A",
                border: "#1C1C1E",
                card: "#0E0E10",
                overlay: "rgba(5, 5, 7, 0.72)",
              },
              typography: { ...premiumTypography, headingSize: 68, headingLineHeight: 1.02, descriptionSize: 18 },
              spacing: { paddingTop: 140, paddingBottom: 140 },
            }),
          },
        },
        "dark"
      );
    case "minimal-light":
      return materializeHeroSlide(
        {
          ...slide,
          layout: "cinematic",
          theme: "light",
          themes: {
            ...slide.themes,
            light: applyThemeStyling(slide.themes.light, {
              colors: {
                background: "#FAFAF8",
                foreground: "#141414",
                muted: "#707070",
                accent: "#B88A3B",
                border: "#E4E4E0",
                card: "#FFFFFF",
                overlay: "rgba(250, 250, 248, 0.55)",
              },
              typography: { ...premiumTypography, headingWeight: 700, headingSize: 56 },
              spacing: { paddingTop: 120, paddingBottom: 120 },
            }),
          },
        },
        "light"
      );
  }
}

// ---------------------------------------------------------------
// Settings factory + normalization
// ---------------------------------------------------------------

export function createDefaultHeroSettings(): HeroSettings {
  return {
    preset: "cinematic-dark",
    editMode: "guided",
    slider: { ...DEFAULT_HERO_SLIDER },
    slides: [createDefaultHeroSlide(0)],
  };
}

/** Legacy (pre-per-device) theme shape accepted by the migration below. */
type LegacyHeroStyling = {
  colors?: Partial<HeroColors>;
  typography?: Partial<HeroTypography>;
  spacing?: Partial<HeroSpacing>;
  overlayOpacity?: number;
  textPositions?: Partial<HeroTextPositions>;
};
type LegacyHeroResponsiveSettings = {
  headingSize?: number;
  descriptionSize?: number;
  eyebrowSize?: number;
  textAlign?: HeroTextAlign;
  contentOrder?: HeroContentOrder;
  heightMode?: HeroHeightMode;
  customHeight?: number;
  contentGap?: number;
  imagePosition?: Partial<HeroImagePosition>;
  showSecondaryCta?: boolean;
  showBadges?: boolean;
};
type LegacyHeroResponsive = Partial<Record<HeroBreakpoint, LegacyHeroResponsiveSettings>>;
type LegacyThemeInput = {
  content?: Partial<HeroContent>;
  buttons?: Partial<{ primary: HeroButton; secondary: HeroButton }>;
  badges?: HeroBadge[];
  media?: Partial<HeroMedia>;
  styling?: LegacyHeroStyling;
  responsive?: LegacyHeroResponsive;
};

/** Permissive per-device styling input used by the merge (partial fields allowed). */
type HeroBreakpointStylingInput = {
  typography?: Partial<HeroTypography>;
  spacing?: Partial<HeroSpacing>;
  overlayOpacity?: number;
  textPositions?: Partial<HeroTextPositions>;
  blockWidths?: Partial<HeroBlockWidths>;
  textAlign?: HeroTextAlign;
  contentOrder?: HeroContentOrder;
  heightMode?: HeroHeightMode;
  customHeight?: number;
  contentGap?: number;
  imagePosition?: Partial<HeroImagePosition>;
  showSecondaryCta?: boolean;
  showBadges?: boolean;
};

/** Permissive per-device input used by the merge (partial fields allowed). */
type HeroBreakpointInput = {
  content?: Partial<HeroContent>;
  buttons?: Partial<{ primary: Partial<HeroButton>; secondary: Partial<HeroButton> }>;
  badges?: HeroBadge[];
  media?: Partial<HeroMedia>;
  styling?: HeroBreakpointStylingInput;
};

function mergeButtonSize(defaults: HeroButtonSize, input?: Partial<HeroButtonSize>): HeroButtonSize {
  return { ...defaults, ...input };
}

function mergeButton(defaults: HeroButton, input?: Partial<HeroButton>): HeroButton {
  return { ...defaults, ...input, size: mergeButtonSize(defaults.size, input?.size) };
}

/**
 * Merges the background box size. Legacy persisted values were percentages of
 * the section (max 200); the current shape is absolute px, so any legacy
 * percentage pair is converted to px proportionally to the defaults.
 */
function mergeBackgroundSize(defaults: HeroBackgroundSize, input?: Partial<HeroBackgroundSize>): HeroBackgroundSize {
  if (!input) return defaults;
  if (input.width != null && input.height != null && input.width <= 200 && input.height <= 200) {
    return {
      width: Math.max(1, Math.round((input.width / 100) * defaults.width)),
      height: Math.max(1, Math.round((input.height / 100) * defaults.height)),
    };
  }
  return { ...defaults, ...input };
}

/** Deep-merge one device's styling over the defaults (also accepts legacy responsive fields). */
function mergeBreakpointStyling(
  defaults: HeroBreakpointStyling,
  input: HeroBreakpointStylingInput | undefined
): HeroBreakpointStyling {
  const v = input ?? {};
  return {
    typography: { ...defaults.typography, ...v.typography },
    spacing: { ...defaults.spacing, ...v.spacing },
    overlayOpacity: v.overlayOpacity ?? defaults.overlayOpacity,
    textPositions: {
      eyebrow: { ...defaults.textPositions.eyebrow, ...v.textPositions?.eyebrow },
      heading: { ...defaults.textPositions.heading, ...v.textPositions?.heading },
      description: { ...defaults.textPositions.description, ...v.textPositions?.description },
      buttons: { ...defaults.textPositions.buttons, ...v.textPositions?.buttons },
      badges: { ...defaults.textPositions.badges, ...v.textPositions?.badges },
    },
    blockWidths: { ...defaults.blockWidths, ...v.blockWidths },
    textAlign: v.textAlign ?? defaults.textAlign,
    contentOrder: v.contentOrder ?? defaults.contentOrder,
    heightMode: v.heightMode ?? defaults.heightMode,
    customHeight: v.customHeight ?? defaults.customHeight,
    contentGap: v.contentGap ?? defaults.contentGap,
    imagePosition: { ...defaults.imagePosition, ...v.imagePosition },
    showSecondaryCta: v.showSecondaryCta ?? defaults.showSecondaryCta,
    showBadges: v.showBadges ?? defaults.showBadges,
  };
}

/** Deep-merge one device's full dataset over the defaults. */
function mergeBreakpointData(defaults: HeroBreakpointData, input: HeroBreakpointInput | undefined): HeroBreakpointData {
  const v = input ?? {};
  return {
    content: { ...defaults.content, ...v.content },
    buttons: {
      primary: mergeButton(defaults.buttons.primary, v.buttons?.primary),
      secondary: mergeButton(defaults.buttons.secondary, v.buttons?.secondary),
    },
    badges: v.badges ?? defaults.badges,
    media: {
      ...defaults.media,
      ...v.media,
      position: { ...defaults.media.position, ...v.media?.position },
      backgroundSize: mergeBackgroundSize(defaults.media.backgroundSize, v.media?.backgroundSize),
      backgroundPosition: { ...defaults.media.backgroundPosition, ...v.media?.backgroundPosition },
      floatingBadge: { ...defaults.media.floatingBadge, ...v.media?.floatingBadge },
    },
    styling: mergeBreakpointStyling(defaults.styling, v.styling),
  };
}

/**
 * Deep-merge one theme's dataset over the defaults so persisted/legacy data
 * always hydrates. Accepts both the new per-device shape (`colors` +
 * `breakpoints`) and the legacy shape (`content`/`buttons`/`badges`/`media`/
 * `styling` + `responsive`), distributing legacy values into every breakpoint.
 */
function mergeThemeVisuals(
  defaults: HeroThemeData,
  input: (Partial<HeroThemeData> & LegacyThemeInput) | undefined
): HeroThemeData {
  const v = input ?? {};

  const colors: HeroColors = { ...defaults.colors, ...v.colors, ...v.styling?.colors };

  const build = (bp: HeroBreakpoint): HeroBreakpointData => {
    const d = defaults.breakpoints[bp];
    const nb = v.breakpoints?.[bp];
    let merged = mergeBreakpointData(d, nb);

    // Legacy distribution: shared fields + this breakpoint's responsive values.
    if (v.content || v.buttons || v.badges || v.media || v.styling || v.responsive) {
      const legacyResponsive = v.responsive?.[bp];
      const legacyTypography = {
        ...v.styling?.typography,
        headingSize: legacyResponsive?.headingSize ?? v.styling?.typography?.headingSize,
        descriptionSize: legacyResponsive?.descriptionSize ?? v.styling?.typography?.descriptionSize,
        eyebrowSize: legacyResponsive?.eyebrowSize ?? v.styling?.typography?.eyebrowSize,
      };
      merged = mergeBreakpointData(merged, {
        content: v.content,
        buttons: v.buttons,
        badges: v.badges,
        media: v.media,
        styling: {
          ...v.styling,
          typography: legacyTypography,
          textAlign: legacyResponsive?.textAlign,
          contentOrder: legacyResponsive?.contentOrder,
          heightMode: legacyResponsive?.heightMode,
          customHeight: legacyResponsive?.customHeight,
          contentGap: legacyResponsive?.contentGap,
          imagePosition: legacyResponsive?.imagePosition,
          showSecondaryCta: legacyResponsive?.showSecondaryCta,
          showBadges: legacyResponsive?.showBadges,
        },
      });
    }
    return merged;
  };

  return {
    colors,
    breakpoints: {
      desktop: build("desktop"),
      tablet: build("tablet"),
      mobile: build("mobile"),
    },
  };
}

/** Deep-merge a partial slide over the defaults so persisted/legacy data always hydrates. */
function mergeSlide(defaults: HeroSlide, input: Partial<HeroSlide> | undefined): HeroSlide {
  const s = input ?? {};
  const active: HeroTheme = s.theme ?? defaults.theme;

  const hasFullPerTheme = (t: Partial<HeroThemeData> | undefined): boolean =>
    !!t && typeof t === "object" && ("breakpoints" in t || "content" in t);

  const mergeTheme = (d: HeroThemeData, t: Partial<HeroThemeData> | undefined): HeroThemeData => {
    let merged = mergeThemeVisuals(d, t);
    // Legacy migration: older saved slides carried content/buttons/badges at the
    // slide level while `themes` only held media/styling/responsive. Route the
    // shared content into both themes so nothing is lost and each theme becomes
    // independently editable going forward.
    if (!hasFullPerTheme(t)) {
      merged = mergeThemeVisuals(merged, { content: s.content, buttons: s.buttons, badges: s.badges });
    }
    return merged;
  };

  const themes: Record<HeroTheme, HeroThemeData> = {
    dark: mergeTheme(defaults.themes.dark, s.themes?.dark),
    light: mergeTheme(defaults.themes.light, s.themes?.light),
  };

  return materializeHeroSlide(
    {
      ...defaults,
      ...s,
      themes,
      animation: { ...defaults.animation, ...s.animation },
    },
    active
  );
}

/**
 * Normalize raw persisted settings into a full HeroSettings object.
 * Handles both the new multi-slide shape and the legacy flat shape
 * (single slide) that the previous builder saved.
 */
export function normalizeHeroSettings(raw: unknown): HeroSettings {
  const defaults = createDefaultHeroSettings();

  if (!raw || typeof raw !== "object") return defaults;

  const r = raw as Record<string, unknown>;

  if (Array.isArray(r.slides) && r.slides.length > 0) {
    const slides = (r.slides as Partial<HeroSlide>[])
      .filter((s) => s && typeof s === "object")
      .map((s, i) => mergeSlide(createDefaultHeroSlide(i), s));
    return {
      preset: (r.preset as HeroPreset) || defaults.preset,
      editMode: (r.editMode as HeroEditMode) || defaults.editMode,
      slider: { ...defaults.slider, ...(r.slider as Partial<HeroSliderSettings>) },
      slides,
    };
  }

  // Legacy flat shape → single default slide carrying the old content.
  const legacy = r as {
    eyebrow?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    secondaryCtaLabel?: string;
    secondaryCtaUrl?: string;
    backgroundImage?: string;
  };
  const slide = createDefaultHeroSlide(0);
  const content = { ...slide.themes.dark.breakpoints.desktop.content };
  content.eyebrow = legacy.eyebrow ?? content.eyebrow;
  content.heading = legacy.title ?? content.heading;
  if (legacy.title && /can't\.?$/i.test(legacy.title)) {
    content.heading = legacy.title.replace(/(can't\.?)(\s*)$/i, "{accent}$1{/accent}$2");
  }
  content.description = legacy.description ?? content.description;
  const buttons: HeroSlide["buttons"] = {
    primary: {
      ...slide.themes.dark.breakpoints.desktop.buttons.primary,
      text: legacy.ctaLabel ?? slide.themes.dark.breakpoints.desktop.buttons.primary.text,
      url: legacy.ctaUrl ?? slide.themes.dark.breakpoints.desktop.buttons.primary.url,
    },
    secondary: {
      ...slide.themes.dark.breakpoints.desktop.buttons.secondary,
      text: legacy.secondaryCtaLabel ?? slide.themes.dark.breakpoints.desktop.buttons.secondary.text,
      url: legacy.secondaryCtaUrl ?? slide.themes.dark.breakpoints.desktop.buttons.secondary.url,
    },
  };
  [slide.themes.dark, slide.themes.light].forEach((data) => {
    forEachBreakpoint(data, (bp) => {
      bp.content = { ...content };
      bp.buttons = {
        primary: { ...buttons.primary, size: defaultHeroButtonSize() },
        secondary: { ...buttons.secondary, size: defaultHeroButtonSize({ paddingX: 26 }) },
      };
      if (legacy.backgroundImage) {
        bp.media.backgroundImage = legacy.backgroundImage;
        bp.media.desktopImage = legacy.backgroundImage;
      }
      if (!legacy.ctaLabel && !legacy.secondaryCtaLabel && !legacy.title) {
        bp.media.floatingBadge.enabled = true;
      }
    });
  });

  return { ...defaults, slides: [materializeHeroSlide(slide, slide.theme)] };
}

// ---------------------------------------------------------------
// Responsive + theme helpers
// ---------------------------------------------------------------

/** Return the active theme's full dataset (colors + per-device breakpoints). */
export function heroVisualsFor(slide: HeroSlide): HeroThemeData {
  return slide.themes[slide.theme] ?? slide.themes.dark;
}

/** Return the active theme's full dataset for a given device. */
export function heroBreakpointFor(slide: HeroSlide, breakpoint: HeroBreakpoint): HeroBreakpointData {
  return heroVisualsFor(slide).breakpoints[breakpoint];
}

/**
 * Resolve the hero section's min-height for a breakpoint based on heightMode:
 *  - "auto" → undefined (fits content)
 *  - "full-screen" → viewport height
 *  - "custom" → customHeight px
 */
export function heroMinHeightFor(slide: HeroSlide, breakpoint: HeroBreakpoint): number | string | undefined {
  const s = heroBreakpointFor(slide, breakpoint).styling;
  if (s.heightMode === "full-screen") return "100svh";
  if (s.heightMode === "custom") return s.customHeight;
  return undefined;
}

export function heroColorsFor(slide: HeroSlide): HeroColors {
  return heroVisualsFor(slide).colors;
}

export function typographyFor(slide: HeroSlide, breakpoint: HeroBreakpoint): HeroTypography {
  return heroBreakpointFor(slide, breakpoint).styling.typography;
}

export function spacingFor(slide: HeroSlide, breakpoint: HeroBreakpoint) {
  const styling = heroBreakpointFor(slide, breakpoint).styling;
  return { ...styling.spacing, contentGap: styling.contentGap };
}

/** Per-element pixel offsets for the hero text blocks (eyebrow, heading, description, buttons, badges). */
export function heroTextPositionsFor(slide: HeroSlide, breakpoint: HeroBreakpoint): HeroTextPositions {
  return heroBreakpointFor(slide, breakpoint).styling.textPositions;
}

/** Manual max-width per text block (px; 0 = auto) for the active device. */
export function heroBlockWidthsFor(slide: HeroSlide, breakpoint: HeroBreakpoint): HeroBlockWidths {
  return heroBreakpointFor(slide, breakpoint).styling.blockWidths;
}

/** CSS transform for an element's pixel offset — undefined when no offset is set. */
export function heroTextTransform(pos?: Partial<HeroTextPosition>): CSSProperties | undefined {
  const x = pos?.x ?? 0;
  const y = pos?.y ?? 0;
  if (x === 0 && y === 0) return undefined;
  return { transform: `translate(${x}px, ${y}px)` };
}

const DEFAULT_HERO_CONTAINER_MAX_WIDTH = 1280;
const DEFAULT_HERO_PADDING_X = 40;

/**
 * Width of the hero content container. Follows the page-wide width
 * (`--page-max-width`) unless the slide has a custom per-theme override.
 */
export function heroContainerWidthFor(slide: HeroSlide, breakpoint: HeroBreakpoint): string {
  const custom = spacingFor(slide, breakpoint).containerMaxWidth;
  return custom === DEFAULT_HERO_CONTAINER_MAX_WIDTH ? "var(--page-max-width, 1280px)" : `${custom}px`;
}

/**
 * Horizontal padding of the hero content container. Follows the page-wide
 * side gap (`--page-padding`) unless the slide has a custom per-theme override.
 */
export function heroPaddingXFor(slide: HeroSlide, breakpoint: HeroBreakpoint): string {
  const custom = spacingFor(slide, breakpoint).paddingX;
  return custom === DEFAULT_HERO_PADDING_X ? "clamp(12px, var(--page-padding, 40px), 5vw)" : `${custom}px`;
}

export function mediaImageFor(media: HeroMedia, breakpoint: HeroBreakpoint): string {
  const candidates = [media.mobileImage, media.tabletImage, media.desktopImage, media.productImage].filter(Boolean);
  if (candidates.length === 0) return "";
  switch (breakpoint) {
    case "mobile":
      return media.mobileImage || media.tabletImage || media.desktopImage || media.productImage || "";
    case "tablet":
      return media.tabletImage || media.desktopImage || media.mobileImage || media.productImage || "";
    default:
      return media.desktopImage || media.productImage || media.tabletImage || media.mobileImage || "";
  }
}

/** Returns a CSSProperties-ready object with the --hero-* design tokens. */
export function heroCssVars(slide: HeroSlide): Record<string, string> {
  const c = heroColorsFor(slide);
  return {
    "--hero-background": c.background,
    "--hero-foreground": c.foreground,
    "--hero-muted": c.muted,
    "--hero-accent": c.accent,
    "--hero-border": c.border,
    "--hero-card": c.card,
    "--hero-overlay": c.overlay,
  };
}

/** Animation variant helpers are derived from slide.animation config. */
export function animationFor(slide: HeroSlide) {
  const a = slide.animation;
  const durationSec = Math.max(0.001, a.duration / 1000);
  const delaySec = a.delay / 1000;
  const staggerSec = a.stagger / 1000;
  return {
    content: entranceVariants(a.contentEntrance, durationSec),
    image: entranceVariants(a.imageEntrance, durationSec),
    badge: entranceVariants(a.badgeEntrance, durationSec),
    cta: entranceVariants(a.ctaEntrance, durationSec),
    container: containerVariants(delaySec, staggerSec),
  };
}

export function buttonStyleCss(style: HeroButtonStyle, colors: HeroColors): CSSProperties {
  switch (style) {
    case "outline":
      return {
        border: `1px solid color-mix(in srgb, ${colors.foreground} 28%, transparent)`,
        background: `color-mix(in srgb, ${colors.foreground} 7%, transparent)`,
        color: colors.foreground,
      };
    case "ghost":
      return { border: "none", color: colors.accent, background: "transparent" };
    default:
      return { border: "none", color: "#0A0A0A", background: colors.accent };
  }
}
