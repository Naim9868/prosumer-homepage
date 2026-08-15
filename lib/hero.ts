import type { CSSProperties } from "react";
import { containerVariants, entranceVariants } from "@/components/homepage-sections/hero/hero-animations";
import type {
  HeroBadge,
  HeroBadgeIcon,
  HeroBreakpoint,
  HeroButton,
  HeroButtonStyle,
  HeroColors,
  HeroContent,
  HeroEditMode,
  HeroLayout,
  HeroMedia,
  HeroPreset,
  HeroResponsive,
  HeroResponsiveSettings,
  HeroSettings,
  HeroSliderSettings,
  HeroSlide,
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

const DEFAULT_HERO_RESPONSIVE: HeroResponsive = {
  desktop: {
    headingSize: 62,
    descriptionSize: 17,
    eyebrowSize: 12.5,
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
    headingSize: 46,
    descriptionSize: 16,
    eyebrowSize: 12,
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
    headingSize: 34,
    descriptionSize: 15,
    eyebrowSize: 11,
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

export function defaultHeroBreakpointSettings(): HeroResponsiveSettings {
  return JSON.parse(JSON.stringify(DEFAULT_HERO_RESPONSIVE.mobile)) as HeroResponsiveSettings;
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
    backgroundSize: { width: 100, height: 100 },
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

export function defaultHeroButtons(): { primary: HeroButton; secondary: HeroButton } {
  return {
    primary: { text: "Shop the Collection", url: "#shop-by-lens", style: "filled" },
    secondary: { text: "Watch it in Use", url: "#video", style: "outline" },
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

/** Build the default visual set (media + styling + responsive) for one theme. */
export function defaultHeroThemeVisuals(theme: HeroTheme): HeroThemeData {
  const base = defaultHeroContentData();
  return {
    ...base,
    media: defaultHeroMedia(theme),
    styling: {
      colors: { ...HERO_THEMES[theme] },
      typography: { ...DEFAULT_HERO_TYPOGRAPHY },
      overlayOpacity: 1,
      textPositions: {
        eyebrow: { x: 0, y: 0 },
        heading: { x: 0, y: 0 },
        description: { x: 0, y: 0 },
        buttons: { x: 0, y: 0 },
        badges: { x: 0, y: 0 },
      },
      spacing: {
        containerMaxWidth: 1280,
        paddingTop: 132,
        paddingBottom: 96,
        paddingX: 40,
        contentGap: 48,
        elementGap: 20,
        mediaOffset: 0,
        productImageOffset: 0,
      },
    },
    responsive: {
      desktop: { ...DEFAULT_HERO_RESPONSIVE.desktop },
      tablet: { ...DEFAULT_HERO_RESPONSIVE.tablet },
      mobile: { ...DEFAULT_HERO_RESPONSIVE.mobile },
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
 * reflect the given theme's dataset. The customer-facing renderer reads those
 * top-level fields, so materializing keeps it working without any changes.
 */
export function materializeHeroSlide(slide: HeroSlide, theme: HeroTheme): HeroSlide {
  const data = heroThemeDataFor(slide, theme);
  return {
    ...slide,
    theme,
    content: { ...data.content },
    buttons: {
      primary: { ...data.buttons.primary },
      secondary: { ...data.buttons.secondary },
    },
    badges: (data.badges ?? []).map((b) => ({ ...b })),
  };
}

export function createDefaultHeroSlide(order = 0): HeroSlide {
  const dark = defaultHeroThemeVisuals("dark");
  const light = defaultHeroThemeVisuals("light");
  // Cinematic shows the full-bleed image with no scrim by default.
  dark.styling.overlayOpacity = 0;
  light.styling.overlayOpacity = 0;
  const theme: HeroTheme = "dark";
  return materializeHeroSlide(
    {
      id: uid("hslide"),
      name: "Premium Camera",
      enabled: true,
      order,
      layout: "cinematic",
      theme,
      content: dark.content,
      buttons: dark.buttons,
      badges: dark.badges,
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
    primary: { text: "Shop Now", url: "#", style: "filled" },
    secondary: { text: "Learn More", url: "#", style: "outline" },
  };
  slide.themes.dark = { ...slide.themes.dark, content: { ...emptyContent }, buttons: emptyButtons, badges: [] };
  slide.themes.light = { ...slide.themes.light, content: { ...emptyContent }, buttons: emptyButtons, badges: [] };
  slide.themes.dark.media.floatingBadge.enabled = false;
  slide.themes.light.media.floatingBadge.enabled = false;
  return materializeHeroSlide(slide, slide.theme);
}

export function duplicateHeroSlide(slide: HeroSlide): HeroSlide {
  const copy = JSON.parse(JSON.stringify(slide)) as HeroSlide;
  copy.id = uid("hslide");
  copy.name = `${slide.name} (Copy)`;
  const reId = (b: HeroBadge): HeroBadge => ({ ...b, id: uid("hbadge") });
  copy.themes = {
    dark: { ...copy.themes.dark, badges: copy.themes.dark.badges.map(reId) },
    light: { ...copy.themes.light, badges: copy.themes.light.badges.map(reId) },
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
            dark: {
              ...slide.themes.dark,
              styling: {
                ...slide.themes.dark.styling,
                colors: { ...HERO_THEMES.dark },
                typography: premiumTypography,
              },
            },
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
            light: {
              ...slide.themes.light,
              styling: {
                ...slide.themes.light.styling,
                colors: { ...HERO_THEMES.light },
                typography: premiumTypography,
              },
            },
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
            dark: {
              ...slide.themes.dark,
              styling: {
                ...slide.themes.dark.styling,
                colors: {
                  background: "#050507",
                  foreground: "#FFFFFF",
                  muted: "#8F8F8F",
                  accent: "#D8B36A",
                  border: "#1C1C1E",
                  card: "#0E0E10",
                  overlay: "rgba(5, 5, 7, 0.72)",
                },
                typography: {
                  ...premiumTypography,
                  headingSize: 68,
                  headingLineHeight: 1.02,
                  descriptionSize: 18,
                },
                spacing: {
                  ...slide.themes.dark.styling.spacing,
                  paddingTop: 140,
                  paddingBottom: 140,
                },
              },
            },
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
            light: {
              ...slide.themes.light,
              styling: {
                ...slide.themes.light.styling,
                colors: {
                  background: "#FAFAF8",
                  foreground: "#141414",
                  muted: "#707070",
                  accent: "#B88A3B",
                  border: "#E4E4E0",
                  card: "#FFFFFF",
                  overlay: "rgba(250, 250, 248, 0.55)",
                },
                typography: {
                  ...premiumTypography,
                  headingWeight: 700,
                  headingSize: 56,
                },
                spacing: {
                  ...slide.themes.light.styling.spacing,
                  paddingTop: 120,
                  paddingBottom: 120,
                },
              },
            },
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

/** Merge one breakpoint's responsive settings over defaults, migrating legacy fields. */
function mergeResponsiveSettings(
  defaults: HeroResponsiveSettings,
  input: Partial<HeroResponsiveSettings> & { heroHeight?: number; contentGap?: number } | undefined
): HeroResponsiveSettings {
  const v = input ?? {};
  const hasLegacyHeight = typeof v.heroHeight === "number" && v.heightMode === undefined;
  const heightMode = hasLegacyHeight ? "custom" : (v.heightMode ?? defaults.heightMode);
  const customHeight = hasLegacyHeight ? v.heroHeight! : (v.customHeight ?? defaults.customHeight);
  return {
    headingSize: v.headingSize ?? defaults.headingSize,
    descriptionSize: v.descriptionSize ?? defaults.descriptionSize,
    eyebrowSize: v.eyebrowSize ?? defaults.eyebrowSize,
    textAlign: v.textAlign ?? defaults.textAlign,
    contentOrder: v.contentOrder ?? defaults.contentOrder,
    heightMode,
    customHeight,
    contentGap: v.contentGap ?? defaults.contentGap,
    imagePosition: { ...defaults.imagePosition, ...v.imagePosition },
    showSecondaryCta: v.showSecondaryCta ?? defaults.showSecondaryCta,
    showBadges: v.showBadges ?? defaults.showBadges,
  };
}

/** Deep-merge one theme's dataset over the defaults so persisted/legacy data always hydrates. */
function mergeThemeVisuals(
  defaults: HeroThemeData,
  input: Partial<HeroThemeData> | undefined
): HeroThemeData {
  const v = input ?? {};
  return {
    content: { ...defaults.content, ...v.content },
    buttons: {
      primary: { ...defaults.buttons.primary, ...v.buttons?.primary },
      secondary: { ...defaults.buttons.secondary, ...v.buttons?.secondary },
    },
    badges: v.badges ?? defaults.badges,
    media: {
      ...defaults.media,
      ...v.media,
      position: { ...defaults.media.position, ...v.media?.position },
      backgroundSize: { ...defaults.media.backgroundSize, ...v.media?.backgroundSize },
      floatingBadge: { ...defaults.media.floatingBadge, ...v.media?.floatingBadge },
    },
    styling: {
      ...defaults.styling,
      ...v.styling,
      colors: { ...defaults.styling.colors, ...v.styling?.colors },
      typography: { ...defaults.styling.typography, ...v.styling?.typography },
      spacing: { ...defaults.styling.spacing, ...v.styling?.spacing },
      textPositions: {
        eyebrow: { x: 0, y: 0, ...v.styling?.textPositions?.eyebrow },
        heading: { x: 0, y: 0, ...v.styling?.textPositions?.heading },
        description: { x: 0, y: 0, ...v.styling?.textPositions?.description },
        buttons: { x: 0, y: 0, ...v.styling?.textPositions?.buttons },
        badges: { x: 0, y: 0, ...v.styling?.textPositions?.badges },
      },
    },
    responsive: {
      desktop: mergeResponsiveSettings(defaults.responsive.desktop, v.responsive?.desktop),
      tablet: mergeResponsiveSettings(defaults.responsive.tablet, v.responsive?.tablet),
      mobile: mergeResponsiveSettings(defaults.responsive.mobile, v.responsive?.mobile),
    },
  };
}

/** Deep-merge a partial slide over the defaults so persisted/legacy data always hydrates. */
function mergeSlide(defaults: HeroSlide, input: Partial<HeroSlide> | undefined): HeroSlide {
  const s = input ?? {};
  const active: HeroTheme = s.theme ?? defaults.theme;

  const themes: Record<HeroTheme, HeroThemeData> = {
    dark: mergeThemeVisuals(defaults.themes.dark, s.themes?.dark),
    light: mergeThemeVisuals(defaults.themes.light, s.themes?.light),
  };

  // Legacy migration: older saved slides carried content/buttons/badges at the
  // slide level while `themes` only held media/styling/responsive. Route the
  // shared content into both themes so nothing is lost and each theme becomes
  // independently editable going forward.
  const persistedDark = s.themes?.dark;
  const persistedLight = s.themes?.light;
  const hasFullPerTheme =
    (!!persistedDark && typeof persistedDark === "object" && "content" in persistedDark) ||
    (!!persistedLight && typeof persistedLight === "object" && "content" in persistedLight);
  if (!hasFullPerTheme) {
    const shared: Partial<HeroThemeData> = {
      content: s.content,
      buttons: s.buttons,
      badges: s.badges,
    };
    themes.dark = mergeThemeVisuals(themes.dark, shared);
    themes.light = mergeThemeVisuals(themes.light, shared);
  }

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
  const content = { ...slide.themes.dark.content };
  content.eyebrow = legacy.eyebrow ?? content.eyebrow;
  content.heading = legacy.title ?? content.heading;
  if (legacy.title && /can't\.?$/i.test(legacy.title)) {
    content.heading = legacy.title.replace(/(can't\.?)(\s*)$/i, "{accent}$1{/accent}$2");
  }
  content.description = legacy.description ?? content.description;
  const buttons: HeroSlide["buttons"] = {
    primary: {
      ...slide.themes.dark.buttons.primary,
      text: legacy.ctaLabel ?? slide.themes.dark.buttons.primary.text,
      url: legacy.ctaUrl ?? slide.themes.dark.buttons.primary.url,
    },
    secondary: {
      ...slide.themes.dark.buttons.secondary,
      text: legacy.secondaryCtaLabel ?? slide.themes.dark.buttons.secondary.text,
      url: legacy.secondaryCtaUrl ?? slide.themes.dark.buttons.secondary.url,
    },
  };
  slide.themes.dark = { ...slide.themes.dark, content: { ...content }, buttons };
  slide.themes.light = { ...slide.themes.light, content: { ...content }, buttons };
  if (legacy.backgroundImage) {
    slide.themes.dark.media.backgroundImage = legacy.backgroundImage;
    slide.themes.dark.media.desktopImage = legacy.backgroundImage;
  }
  if (!legacy.ctaLabel && !legacy.secondaryCtaLabel && !legacy.title) {
    slide.themes.dark.media.floatingBadge.enabled = true;
  }

  return { ...defaults, slides: [materializeHeroSlide(slide, slide.theme)] };
}

// ---------------------------------------------------------------
// Responsive + theme helpers
// ---------------------------------------------------------------

/** Return the active theme's full dataset (content + media + styling + responsive). */
export function heroVisualsFor(slide: HeroSlide): HeroThemeData {
  return slide.themes[slide.theme] ?? slide.themes.dark;
}

/** Return the active theme's responsive settings for a given breakpoint. */
export function heroResponsiveFor(slide: HeroSlide, breakpoint: HeroBreakpoint): HeroResponsiveSettings {
  return heroVisualsFor(slide).responsive[breakpoint];
}

/**
 * Resolve the hero section's min-height for a breakpoint based on heightMode:
 *  - "auto" → undefined (fits content)
 *  - "full-screen" → viewport height
 *  - "custom" → customHeight px
 */
export function heroMinHeightFor(slide: HeroSlide, breakpoint: HeroBreakpoint): number | string | undefined {
  const r = heroResponsiveFor(slide, breakpoint);
  if (r.heightMode === "full-screen") return "100svh";
  if (r.heightMode === "custom") return r.customHeight;
  return undefined;
}

export function heroColorsFor(slide: HeroSlide): HeroColors {
  return heroVisualsFor(slide).styling.colors;
}

export function typographyFor(slide: HeroSlide, breakpoint: HeroBreakpoint): HeroTypography {
  const visuals = heroVisualsFor(slide);
  const base = visuals.styling.typography;
  const responsive = heroResponsiveFor(slide, breakpoint);
  return {
    ...base,
    headingSize: responsive.headingSize,
    descriptionSize: responsive.descriptionSize,
    eyebrowSize: responsive.eyebrowSize,
  };
}

export function spacingFor(slide: HeroSlide, breakpoint: HeroBreakpoint) {
  const visuals = heroVisualsFor(slide);
  const spacing = visuals.styling.spacing;
  return { ...spacing, contentGap: heroResponsiveFor(slide, breakpoint).contentGap };
}

/** Per-element pixel offsets for the hero text blocks (eyebrow, heading, description, buttons, badges). */
export function heroTextPositionsFor(slide: HeroSlide): HeroTextPositions {
  return heroVisualsFor(slide).styling.textPositions;
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
