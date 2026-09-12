/**
 * Homepage Builder — core type system.
 *
 * Everything the admin panel and the public homepage render from
 * flows through these types. Add a new section or block type here
 * first, then register a renderer + editor for it — nothing else
 * needs to change.
 */

// ---------------------------------------------------------------
// Shared styling controls (available on every section)
// ---------------------------------------------------------------

export interface SectionStyle {
  backgroundColor?: string; // CSS color or "transparent"
  backgroundImage?: string; // URL
  containerWidth?: "sm" | "md" | "lg" | "xl" | "7xl" | "full";
  paddingTop?: number; // px
  paddingBottom?: number; // px
  paddingLeft?: number; // px
  paddingRight?: number; // px
  minHeight?: number; // px
  overflow?: "visible" | "hidden" | "auto";
  position?: "static" | "relative" | "absolute" | "sticky";
  zIndex?: number;
  marginTop?: number; // px
  marginBottom?: number; // px
  textAlign?: "left" | "center" | "right";
  borderRadius?: number; // px
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
}

export type SectionTheme = "light" | "dark";
export type SectionDevice = "desktop" | "tablet" | "mobile";

/** Optional per-theme/per-device section styles. Missing slots inherit the legacy style. */
export type ResponsiveSectionStyles = {
  [theme in SectionTheme]?: {
    [device in SectionDevice]?: Partial<SectionStyle>;
  };
};

export const DEFAULT_SECTION_STYLE: SectionStyle = {
  backgroundColor: "transparent",
  containerWidth: "7xl",
  paddingTop: 80,
  paddingBottom: 80,
  textAlign: "left",
  borderRadius: 0,
  hideOnDesktop: false,
  hideOnMobile: false,
};

// ---------------------------------------------------------------
// Global page settings (page width, navbar, footer)
// ---------------------------------------------------------------

export interface PageNavbarSettings {
  enabled: boolean;
  fixed: boolean;
  transparent: boolean;
  height: number; // px
  /** Background opacity 0–1; 1 = fully opaque, 0 = fully transparent. */
  opacity: number;

  // Colors — empty string means "use the theme default".
  /** Solid navbar background; empty = theme glass / transparent behavior. */
  backgroundColor: string;
  /** Primary text (logo, links, icons). */
  textColor: string;
  /** Secondary / muted text. */
  mutedTextColor: string;
  /** Hover color for links and icons. */
  hoverColor: string;
  /** Hover background for icon buttons / menu rows. */
  hoverBackgroundColor: string;
  /** Bottom border color. */
  borderColor: string;
  /** Accent color (logo mark, badges, CTA button background). */
  accentColor: string;
  /** Text color on accent surfaces (CTA button, badges). */
  buttonTextColor: string;

  // Typography — empty/0 means "use the theme default".
  /** CSS font-family stack for nav links; empty = theme body font. */
  fontFamily: string;
  /** Nav link font size in px; 0 = theme default. */
  fontSize: number;
  /** Nav link font weight; 0 = theme default. */
  fontWeight: number;
}

export interface PageFooterSettings {
  enabled: boolean;
  backgroundColor: string; // CSS color; empty = theme background
  paddingTop: number; // px
}

export interface TrustBadge {
  icon: string;
  title: string;
  subtitle: string;
}

export interface TrustBadgeSettings {
  enabled: boolean;
  badges: TrustBadge[];
}

export interface ProductGridDeviceSettings {
  columns: number;
  gap: number; // px
}

export interface ProductGridSettings {
  desktop: ProductGridDeviceSettings;
  tablet: ProductGridDeviceSettings;
}

// ---------------------------------------------------------------
// Floating Contact Button settings
// ---------------------------------------------------------------

export type ContactChannelType = "phone" | "whatsapp" | "messenger" | "telegram" | "email";

export interface ContactChannelSetting {
  type: ContactChannelType;
  enabled: boolean;
  /** Phone number, WhatsApp number, Messenger username, Telegram username, or email address. */
  value: string;
  label: string;
}

export interface ContactSettings {
  enabled: boolean;
  channels: ContactChannelSetting[];
  /** Main FAB button background color. */
  accentColor: string;
}

export interface PageSettings {
  /** Max width of the page container in px. */
  containerWidth: number;
  /** Left/right page gap in px (desktop). */
  sidePadding: number;
  navbar: PageNavbarSettings;
  footer: PageFooterSettings;
  trustBadges: TrustBadgeSettings;
  /** Floating contact button settings. */
  contact: ContactSettings;
  /** Number of products per page on /products listing. */
  productsPerPage: number;
  /** Product grid layout on /products listing. */
  productGrid: ProductGridSettings;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  containerWidth: 1440,
  sidePadding: 24,
  navbar: {
    enabled: true,
    fixed: true,
    transparent: true,
    height: 72,
    opacity: 0.72,
    backgroundColor: "",
    textColor: "",
    mutedTextColor: "",
    hoverColor: "",
    hoverBackgroundColor: "",
    borderColor: "",
    accentColor: "",
    buttonTextColor: "",
    fontFamily: "",
    fontSize: 0,
    fontWeight: 0,
  },
  footer: { enabled: true, backgroundColor: "", paddingTop: 64 },
  trustBadges: {
    enabled: true,
    badges: [
      { icon: "Truck", title: "Free Shipping", subtitle: "On orders ৳1500+" },
      { icon: "RotateCcw", title: "Easy Returns", subtitle: "30 days return" },
      { icon: "Shield", title: "Secure Checkout", subtitle: "100% secure" },
    ],
  },
  contact: {
    enabled: true,
    accentColor: "#25D366",
    channels: [
      { type: "phone", enabled: true, value: "+8801521529868", label: "Call Us" },
      { type: "whatsapp", enabled: true, value: "+8801521529868", label: "WhatsApp" },
      { type: "messenger", enabled: false, value: "", label: "Messenger" },
      { type: "telegram", enabled: false, value: "", label: "Telegram" },
      { type: "email", enabled: false, value: "", label: "Email Us" },
    ],
  },
  productsPerPage: 20,
  productGrid: {
    desktop: { columns: 4, gap: 24 },
    tablet: { columns: 3, gap: 20 },
  },
};

// ---------------------------------------------------------------
// Predefined section types
// ---------------------------------------------------------------

export const PREDEFINED_SECTION_TYPES = [
  "hero",
  "featuredProducts",
  "newArrivals",
  "bestSellers",
  "flashSale",
  "categories",
  "whyUs",
  "brands",
  "gallery",
  "testimonials",
  "beforeAfter",
  "video",
  "faq",
  "newsletter",
  "banner",
] as const;

export type PredefinedSectionType = (typeof PREDEFINED_SECTION_TYPES)[number];

export type SectionType = PredefinedSectionType | "custom";

// ---------------------------------------------------------------
// Per-section settings shapes
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// Hero (multi-slide) — settings shape
// ---------------------------------------------------------------

export type HeroLayout = "cinematic" | "apexel";
export type HeroTheme = "dark" | "light";
export type HeroTransition = "fade" | "slide" | "crossfade";
export type HeroButtonStyle = "filled" | "outline" | "ghost";
export type HeroMediaSource = "upload" | "product" | "product-custom";
export type HeroEditMode = "guided" | "advanced";
export type HeroPreset = "premium-dark" | "premium-light" | "cinematic-dark" | "minimal-light";
export type HeroBreakpoint = "desktop" | "tablet" | "mobile";
export type HeroEntrance = "fade" | "fade-up" | "fade-down" | "scale" | "none";
export type HeroBadgeIcon =
  | "aperture"
  | "shield"
  | "truck"
  | "star"
  | "gem"
  | "sparkles"
  | "smartphone"
  | "headset"
  | "package"
  | "zap";

/** Per-slide color palette mapped to --hero-* CSS custom properties. */
export interface HeroColors {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
  card: string;
  overlay: string;
}

/** Desktop typography values (px, unitless line-height, em tracking). */
export interface HeroTypography {
  headingSize: number;
  headingWeight: number;
  headingLineHeight: number;
  headingLetterSpacing: number;
  descriptionSize: number;
  descriptionWeight: number;
  eyebrowSize: number;
  eyebrowLetterSpacing: number;
  buttonFontSize: number;
  buttonWeight: number;
}

/** Spacing values in px. */
export interface HeroSpacing {
  containerMaxWidth: number;
  paddingTop: number;
  paddingBottom: number;
  paddingX: number;
  contentGap: number;
  elementGap: number;
  mediaOffset: number;
  productImageOffset: number;
}

export interface HeroImagePosition {
  x: number; // %  (-50..50)
  y: number; // %  (-50..50)
  scale: number; // 0.5..2
  objectPosition: string; // CSS object-position
}

export interface HeroFloatingBadge {
  enabled: boolean;
  title: string;
  subtitle: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface HeroBackgroundSize {
  width: number; // px — absolute size, independent of the section dimensions
  height: number; // px
}

/** Pixel offset of the background image box from the section center. */
export interface HeroBackgroundPosition {
  x: number; // px
  y: number; // px
}

export type HeroImageWidthMode = "auto" | "manual";

export type HeroImageFitMode = "cover" | "contain" | "width" | "height" | "original" | "custom";

export type HeroOverlayType = "solid" | "linear" | "radial";

export type HeroOverlayDirection = "to-right" | "to-left" | "to-bottom" | "to-top";

export interface HeroOverlayConfig {
  type: HeroOverlayType;
  color: string;
  opacity: number;
  direction: HeroOverlayDirection;
  colorEnd: string;
}

export interface HeroBackgroundConfig {
  image: string;
  mobileImage: string;
  useMobileImage: boolean;
  fit: HeroImageFitMode;
  position: { x: number; y: number };
  zoom: number;
  customWidth: number;
  customWidthUnit: "%" | "px";
  customHeight: number;
  customHeightUnit: "%" | "px";
  repeat: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  overlay: HeroOverlayConfig;
}

export const DEFAULT_HERO_BACKGROUND_CONFIG: HeroBackgroundConfig = {
  image: "",
  mobileImage: "",
  useMobileImage: false,
  fit: "cover",
  position: { x: 50, y: 50 },
  zoom: 100,
  customWidth: 100,
  customWidthUnit: "%",
  customHeight: 100,
  customHeightUnit: "%",
  repeat: "no-repeat",
  overlay: {
    type: "solid",
    color: "#000000",
    opacity: 35,
    direction: "to-right",
    colorEnd: "#000000",
  },
};

export const HERO_IMAGE_FIT_OPTIONS: { value: HeroImageFitMode; label: string; hint: string }[] = [
  { value: "cover", label: "Cover", hint: "Fills hero, may crop edges" },
  { value: "contain", label: "Contain", hint: "Shows full image, may leave space" },
  { value: "width", label: "Fit Width", hint: "Stretches to hero width" },
  { value: "height", label: "Fit Height", hint: "Stretches to hero height" },
  { value: "original", label: "Original", hint: "Natural image size" },
  { value: "custom", label: "Custom", hint: "Set exact dimensions" },
];

export const HERO_POSITION_PRESETS: { label: string; x: number; y: number }[] = [
  { label: "Top Left", x: 0, y: 0 },
  { label: "Top Center", x: 50, y: 0 },
  { label: "Top Right", x: 100, y: 0 },
  { label: "Center Left", x: 0, y: 50 },
  { label: "Center", x: 50, y: 50 },
  { label: "Center Right", x: 100, y: 50 },
  { label: "Bottom Left", x: 0, y: 100 },
  { label: "Bottom Center", x: 50, y: 100 },
  { label: "Bottom Right", x: 100, y: 100 },
];

export const HERO_BG_PRESETS: { label: string; fit: HeroImageFitMode; x: number; y: number; zoom: number; overlayType?: HeroOverlayType; overlayOpacity?: number }[] = [
  { label: "Full Bleed", fit: "cover", x: 50, y: 50, zoom: 100 },
  { label: "Product Right", fit: "cover", x: 70, y: 50, zoom: 100 },
  { label: "Product Left", fit: "cover", x: 30, y: 50, zoom: 100 },
  { label: "Cinematic", fit: "cover", x: 50, y: 50, zoom: 105, overlayType: "linear", overlayOpacity: 40 },
  { label: "Full Image", fit: "contain", x: 50, y: 50, zoom: 100 },
];

export interface HeroBorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface HeroMedia {
  source: HeroMediaSource;
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
  backgroundImage: string;
  productImage: string;
  productId: string;
  position: HeroImagePosition;
  backgroundSize: HeroBackgroundSize;
  backgroundPosition: HeroBackgroundPosition;
  floatingBadge: HeroFloatingBadge;
  /** "auto" = image fills its container consistently across devices; "manual" = fixed pixel width. */
  imageWidthMode: HeroImageWidthMode;
  /** Fixed width in px when imageWidthMode is "manual". */
  imageWidth: number;
  /** Border radius of the image card (per-corner in px). */
  borderRadius: HeroBorderRadius;
  /** Advanced background image configuration (fit, focal point, zoom, overlay). Falls back to legacy behavior when absent. */
  backgroundConfig?: HeroBackgroundConfig;
}

/** Button sizing overrides (px); 0/0 means "auto" for the given dimension. */
export interface HeroButtonSize {
  width: number; // px, 0 = auto
  height: number; // px, 0 = auto
  borderRadius: number; // px
  paddingX: number; // px
  paddingY: number; // px
  fontSize: number; // px, 0 = inherit from theme typography
  fontWeight: number; // 0 = inherit from theme typography
}

export interface HeroButton {
  text: string;
  url: string;
  style: HeroButtonStyle;
  size: HeroButtonSize;
  textColor?: string; // overrides the theme-derived text color; empty = theme default
  backgroundColor?: string; // overrides the theme-derived background; empty = theme default
  borderColor?: string; // overrides the theme-derived border color; empty = theme default
}

export interface HeroBadge {
  id: string;
  icon: HeroBadgeIcon;
  title: string;
  description: string;
}

export interface HeroContent {
  eyebrow: string;
  heading: string;
  description: string;
}

export interface HeroAnimation {
  contentEntrance: HeroEntrance;
  imageEntrance: HeroEntrance;
  badgeEntrance: HeroEntrance;
  ctaEntrance: HeroEntrance;
  duration: number; // ms
  delay: number; // ms
  stagger: number; // ms
}

export type HeroHeightMode = "auto" | "full-screen" | "custom";
export type HeroTextAlign = "left" | "center" | "right";
export type HeroContentOrder = "content-first" | "media-first";

/** Pixel offset applied to a single hero text element. */
export interface HeroTextPosition {
  x: number; // px, positive = right
  y: number; // px, positive = down
}

/** Per-element pixel offsets for each text block in the hero. */
export interface HeroTextPositions {
  eyebrow: HeroTextPosition;
  heading: HeroTextPosition;
  description: HeroTextPosition;
  buttons: HeroTextPosition;
  badges: HeroTextPosition;
}

/** Manual max-width per text block (px); 0 = auto. */
export interface HeroBlockWidths {
  eyebrow: number;
  heading: number;
  description: number;
  buttons: number;
  badges: number;
}

/**
 * The full styling set for one device inside a theme — typography, spacing,
 * per-element offsets and widths, plus the per-device layout controls
 * (height, alignment, content order, visibility flags).
 */
export interface HeroBreakpointStyling {
  typography: HeroTypography;
  spacing: HeroSpacing;
  /** 0..1 — dark scrim strength over the background image (0 = fully visible). */
  overlayOpacity: number;
  /** Free-form per-element pixel offsets (eyebrow, heading, description, buttons, badges). */
  textPositions: HeroTextPositions;
  /** Manual max-width per text block (px); 0 = auto. */
  blockWidths: HeroBlockWidths;
  textAlign: HeroTextAlign;
  contentOrder: HeroContentOrder;
  /** Auto → fits content, full-screen → viewport height, custom → customHeight px. */
  heightMode: HeroHeightMode;
  customHeight: number; // px, used when heightMode === "custom"
  contentGap: number; // px between text/media
  imagePosition: HeroImagePosition;
  showSecondaryCta: boolean;
  showBadges: boolean;
}

/**
 * The complete dataset for one device (desktop, tablet, or mobile) inside a
 * theme — fully independent from the other devices. Text content, buttons,
 * badges, media, and styling are all stored per device.
 */
export interface HeroBreakpointData {
  content: HeroContent;
  buttons: { primary: HeroButton; secondary: HeroButton };
  badges: HeroBadge[];
  media: HeroMedia;
  styling: HeroBreakpointStyling;
}

/**
 * The complete dataset for one theme (dark or light). Colors are shared across
 * every device; all other settings are stored separately per device via
 * `breakpoints` — so light/dark × desktop/tablet/mobile are fully independent.
 */
export interface HeroThemeData {
  colors: HeroColors;
  breakpoints: Record<HeroBreakpoint, HeroBreakpointData>;
}

export interface HeroSlide {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  layout: HeroLayout;
  theme: HeroTheme;
  /**
   * Mirror of `themes[theme]`'s content/buttons/badges — the "active theme"
   * snapshot kept so the customer-facing renderer (which reads these top-level
   * fields) works unchanged. Per-theme values live in `themes` and are the
   * source of truth.
   */
  content: HeroContent;
  buttons: { primary: HeroButton; secondary: HeroButton };
  badges: HeroBadge[];
  themes: Record<HeroTheme, HeroThemeData>;
  animation: HeroAnimation;
}

export interface HeroSliderSettings {
  autoplay: boolean;
  interval: number; // ms
  pauseOnHover: boolean;
  loop: boolean;
  transition: HeroTransition;
  transitionDuration: number; // ms
  showArrows: boolean;
  showDots: boolean;
  showProgress: boolean;
}

export interface HeroSettings {
  preset: HeroPreset;
  editMode: HeroEditMode;
  slider: HeroSliderSettings;
  slides: HeroSlide[];
}

export interface FeaturedProductsSettings {
  eyebrow?: string;
  title: string;
  subtitle: string;
  productIds: string[];
  viewAllLabel?: string;
  viewAllUrl?: string;
  layout?: CatDeviceLayout;
  eyebrowStyle?: CatResponsiveThemeStyle;
  titleStyle?: CatResponsiveThemeStyle;
  subtitleStyle?: CatResponsiveThemeStyle;
  viewAllStyle?: CatResponsiveThemeStyle;
}

export interface NewArrivalsSettings {
  eyebrow?: string;
  title: string;
  subtitle: string;
  days?: number;
  layout?: CatDeviceLayout;
  eyebrowStyle?: CatResponsiveThemeStyle;
  titleStyle?: CatResponsiveThemeStyle;
  subtitleStyle?: CatResponsiveThemeStyle;
}

export interface BestSellersSettings {
  eyebrow?: string;
  title: string;
  subtitle: string;
  productIds: string[];
  viewAllLabel?: string;
  viewAllUrl?: string;
  layout?: CatDeviceLayout;
  eyebrowStyle?: CatResponsiveThemeStyle;
  titleStyle?: CatResponsiveThemeStyle;
  subtitleStyle?: CatResponsiveThemeStyle;
  viewAllStyle?: CatResponsiveThemeStyle;
}

export interface FlashSaleSettings {
  title: string;
  subtitle: string;
  endsAt: string; // ISO date
  productIds: string[];
  buttonLabel: string;
  buttonUrl: string;
}

export interface CategoriesTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  backgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  textAlign?: "left" | "center" | "right";
}

export type CardTextPosition = "inside" | "outside-top" | "outside-bottom";

export type CatTheme = "light" | "dark";

export type CatResponsiveThemeStyle = Partial<Record<EditorDevice, Partial<Record<CatTheme, CategoriesTextStyle>>>>;

export type CatDeviceLayout = Partial<Record<EditorDevice, { columns: 1 | 2 | 3 | 4 | 5 | 6; gridGap: number; limit?: number }>>;

export type CatDeviceCardStyle = Partial<Record<EditorDevice, {
  textPosition?: CardTextPosition;
  textOffsetX?: number;
  textOffsetY?: number;
  showDescription?: boolean;
  borderRadius?: number;
  height?: number;
  width?: number;
  shadow?: boolean;
  shadowIntensity?: number;
  showArrowIcon?: boolean;
}>>;

export interface CategoriesSettings {
  eyebrow?: string;
  title: string;
  subtitle: string;
  categoryIds: string[];
  layout?: CatDeviceLayout;
  eyebrowStyle?: CatResponsiveThemeStyle;
  titleStyle?: CatResponsiveThemeStyle;
  subtitleStyle?: CatResponsiveThemeStyle;
  cardNameStyle?: CatResponsiveThemeStyle;
  cardDescriptionStyle?: CatResponsiveThemeStyle;
  /** Per-device card settings: text position, design, shadow, etc. */
  cardStyle?: CatDeviceCardStyle;
}

export interface BrandsSettings {
  title: string;
  logos: { name: string; url: string }[];
}

export const WHY_US_ICONS = [
  "truck",
  "banknote",
  "shield-check",
  "headset",
  "gem",
  "rotate-ccw",
  "star",
  "sparkles",
  "zap",
  "heart",
  "camera",
  "package",
] as const;

export type WhyUsIcon = (typeof WHY_US_ICONS)[number];

export interface WhyUsItem {
  id: string;
  icon: WhyUsIcon;
  title: string;
  description: string;
}

export type WhyUsIconVariant = "soft" | "filled" | "outline";

export interface WhyUsSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
  columns: 2 | 3 | 4;
  items: WhyUsItem[];
  /** Scroll-in animation on each card, matching the homepage behavior. */
  animated: boolean;
  /** Icon chip style. "soft" = the default homepage look. */
  iconVariant: WhyUsIconVariant;
  /** Icon size in px inside the chip. */
  iconSize: number;
}

export interface GallerySettings {
  title: string;
  subtitle: string;
  images: { url: string; caption?: string }[];
}

export interface TestimonialsSettings {
  title: string;
  subtitle: string;
  testimonialIds: string[];
}

export interface BeforeAfterCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
}

export interface BeforeAfterItem {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
  productId?: string;
  buttonText: string;
  buttonUrl?: string;
  isActive: boolean;
  order: number;
}

export interface BeforeAfterStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "double" | "none";
  borderRadius?: number;
  width?: number;
  height?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  textAlign?: "left" | "center" | "right";
}

export type BeforeAfterResponsiveStyle = Partial<Record<EditorDevice, Partial<Record<CatTheme, BeforeAfterStyle>>>>;

export interface BeforeAfterLayout {
  layoutMode: "row" | "column";
  imageWidth: number;
  imageAspectRatio: number;
  contentGap: number;
  categoryGap: number;
  itemGap: number;
  imageColumnPercent: number;
  contentColumnPercent: number;
}

export interface BeforeAfterSettings {
  eyebrow?: string;
  title: string;
  subtitle: string;
  categories: BeforeAfterCategory[];
  items: BeforeAfterItem[];
  layout: Partial<Record<EditorDevice, BeforeAfterLayout>>;
  sectionStyle?: BeforeAfterResponsiveStyle;
  headingStyle?: BeforeAfterResponsiveStyle;
  subtitleStyle?: BeforeAfterResponsiveStyle;
  categoryStyle?: BeforeAfterResponsiveStyle;
  activeCategoryStyle?: BeforeAfterResponsiveStyle;
  itemTitleStyle?: BeforeAfterResponsiveStyle;
  itemDescriptionStyle?: BeforeAfterResponsiveStyle;
  ctaStyle?: BeforeAfterResponsiveStyle;
  comparisonStyle?: BeforeAfterResponsiveStyle;
  /** Legacy fields are kept so existing saved single-comparison sections render during migration. */
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export interface VideoSettings {
  title: string;
  subtitle: string;
  youtubeId: string;
  thumbnail?: string;
}

export interface FaqSettings {
  title: string;
  subtitle: string;
  items: { id: string; question: string; answer: string }[];
}

export interface NewsletterSettings {
  title: string;
  subtitle: string;
  placeholder: string;
  buttonLabel: string;
}

export interface BannerSettings {
  title: string;
  subtitle: string;
  image?: string;
  buttonLabel: string;
  buttonUrl: string;
}

/** Maps each predefined section type to its settings shape. */
export interface SectionSettingsMap {
  hero: HeroSettings;
  featuredProducts: FeaturedProductsSettings;
  newArrivals: NewArrivalsSettings;
  bestSellers: BestSellersSettings;
  flashSale: FlashSaleSettings;
  categories: CategoriesSettings;
  brands: BrandsSettings;
  whyUs: WhyUsSettings;
  gallery: GallerySettings;
  testimonials: TestimonialsSettings;
  beforeAfter: BeforeAfterSettings;
  video: VideoSettings;
  faq: FaqSettings;
  newsletter: NewsletterSettings;
  banner: BannerSettings;
}

// ---------------------------------------------------------------
// Custom section blocks
// ---------------------------------------------------------------

export const BLOCK_TYPES = [
  "heading",
  "paragraph",
  "image",
  "button",
  "spacer",
  "divider",
  "productGrid",
  "productSlider",
  "video",
  "icon",
  "html",
  "customWidget",
  "container",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export interface HeadingBlockSettings {
  text: string;
  level: "h2" | "h3" | "h4";
  align: "left" | "center" | "right";
}

export interface ParagraphBlockSettings {
  text: string;
  align: "left" | "center" | "right";
}

export interface ImageBlockSettings {
  url: string;
  alt: string;
  rounded: boolean;
}

export interface ButtonBlockSettings {
  label: string;
  url: string;
  variant: "primary" | "outline";
}

export interface SpacerBlockSettings {
  height: number; // px
}

export interface DividerBlockSettings {
  style: "solid" | "dashed";
}

export interface ProductGridBlockSettings {
  title?: string;
  productIds: string[];
  columns: 2 | 3 | 4;
}

export interface ProductSliderBlockSettings {
  title?: string;
  productIds: string[];
}

export interface VideoBlockSettings {
  youtubeId: string;
}

export interface IconBlockSettings {
  icon: string; // lucide icon name
  label: string;
  size: number;
}

export interface HtmlBlockSettings {
  html: string;
}

export interface CustomWidgetBlockSettings {
  tag: "div" | "section" | "article" | "aside" | "nav";
  align: "left" | "center" | "right";
  badge?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  contentHtml?: string;
  mediaType: "none" | "icon" | "image";
  icon: string;
  iconSize: number;
  imageUrl?: string;
  imageAlt?: string;
  primaryLabel?: string;
  primaryUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  openInNewTab?: boolean;
  contentGap: number;
}

export interface ContainerBlockSettings {
  name: string;
  layout: CustomSectionLayout;
  blocks: Block[];
}

// ---------------------------------------------------------------
// Responsive style & advanced settings for block-level styling
// ---------------------------------------------------------------

export type EditorDevice = "desktop" | "tablet" | "mobile";

/** A value that can differ per device. Undefined at a breakpoint inherits from the larger one. */
export type ResponsiveValue<T> = Partial<Record<EditorDevice, T>>;

/** Layout properties per device. */
export interface LayoutProps {
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  margin?: string;
  padding?: string;
  display?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;
  overflow?: string;
  gap?: string;
  alignItems?: string;
  justifyContent?: string;
  flexDirection?: string;
}

/** Typography properties per device. */
export interface TypographyProps {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  textDecoration?: string;
  textAlign?: string;
}

/** Color properties (flat, not per-device — colors don't change on mobile). */
export interface ColorProps {
  color?: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  opacity?: string;
}

/** Border properties per device. */
export interface BorderProps {
  borderType?: string;
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
}

/** Shadow properties (flat). */
export interface ShadowProps {
  shadowX?: string;
  shadowY?: string;
  shadowBlur?: string;
  shadowSpread?: string;
  shadowColor?: string;
}

/** Per-device breakpoint style data. */
export interface BlockBreakpointStyle {
  layout?: LayoutProps;
  typography?: TypographyProps;
  colors?: ColorProps;
  border?: BorderProps;
  shadow?: ShadowProps;
}

/** The responsive style object — every property can have separate desktop/tablet/mobile values. */
export interface BlockStyle {
  desktop?: BlockBreakpointStyle;
  tablet?: BlockBreakpointStyle;
  mobile?: BlockBreakpointStyle;
}

/** Per-theme/per-device block breakpoint styles. Missing slots inherit from legacy BlockStyle. */
export type ResponsiveBlockStyles = {
  [theme in SectionTheme]?: {
    [device in SectionDevice]?: BlockBreakpointStyle;
  };
};

/** Per-theme/per-device block layout. Each device stores its own columnSpan, rowSpan, order, alignSelf. */
export type ResponsiveBlockLayout = {
  [theme in SectionTheme]?: {
    [device in SectionDevice]?: BlockLayout;
  };
};

/** Per-theme/per-device block settings (content). Each device stores its own content configuration. */
export type ResponsiveBlockSettings = {
  [theme in SectionTheme]?: {
    [device in SectionDevice]?: Record<string, unknown>;
  };
};

/** Per-theme/per-device block advanced settings. Each device stores its own CSS ID, classes, animation, visibility, custom CSS. */
export type ResponsiveBlockAdvanced = {
  [theme in SectionTheme]?: {
    [device in SectionDevice]?: BlockAdvanced;
  };
};

/** Responsive visibility. */
export interface BlockVisibility {
  desktop?: boolean;
  tablet?: boolean;
  mobile?: boolean;
}

/** Animation settings. */
export type BlockAnimationType = "none" | "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn" | "slideInUp" | "slideInDown";

export interface BlockAnimation {
  type?: BlockAnimationType;
  duration?: number;
  delay?: number;
  easing?: string;
}

/** Advanced settings for a block. */
export interface BlockAdvanced {
  cssId?: string;
  cssClasses?: string;
  customAttributes?: string;
  customCSS?: string;
  visibility?: BlockVisibility;
  animation?: BlockAnimation;
}

export interface BlockSettingsMap {
  heading: HeadingBlockSettings;
  paragraph: ParagraphBlockSettings;
  image: ImageBlockSettings;
  button: ButtonBlockSettings;
  spacer: SpacerBlockSettings;
  divider: DividerBlockSettings;
  productGrid: ProductGridBlockSettings;
  productSlider: ProductSliderBlockSettings;
  video: VideoBlockSettings;
  icon: IconBlockSettings;
  html: HtmlBlockSettings;
  customWidget: CustomWidgetBlockSettings;
  container: ContainerBlockSettings;
}

export interface Block<T extends BlockType = BlockType> {
  id: string;
  type: T;
  order: number;
  settings: BlockSettingsMap[T];
  /** Legacy responsive style overrides — desktop/tablet/mobile (theme-agnostic). Kept for backward compat. */
  style?: BlockStyle;
  /** Per-theme/per-device responsive styles (CSS properties). When present, these override the legacy `style` field. */
  responsiveStyles?: ResponsiveBlockStyles;
  /** Layout positioning — column span, row span, order, align-self. Legacy global fallback. */
  layout?: BlockLayout;
  /** Per-theme/per-device responsive layout. When present, these override the legacy `layout` field. */
  responsiveLayout?: ResponsiveBlockLayout;
  /** Advanced settings: CSS ID, classes, animation, visibility, custom CSS. Legacy global fallback. */
  advanced?: BlockAdvanced;
  /** Per-theme/per-device responsive advanced settings. When present, these override the legacy `advanced` field. */
  responsiveAdvanced?: ResponsiveBlockAdvanced;
  /** Per-theme/per-device responsive content settings. When present, these override the legacy `settings` field. */
  responsiveSettings?: ResponsiveBlockSettings;
}

// ---------------------------------------------------------------
// Custom section layout system (Elementor-like grid / flex)
// ---------------------------------------------------------------

export type LayoutMode = "stack" | "grid" | "flex";

export interface CustomSectionLayout {
  /** Layout mode: stack = vertical column (default), grid = CSS grid, flex = CSS flexbox. */
  mode: LayoutMode;
  /** Number of columns for grid mode (1–12). */
  columns: number;
  /** Optional explicit column fractions for grid mode, e.g. [2,1,1]. */
  columnRatios?: number[];
  /** Gap between items in px. */
  gap: number;
  /** Flex direction for flex mode. "row-wrap" = horizontal with wrapping. */
  flexDirection: "row" | "column" | "row-wrap" | "column-wrap";
  /** CSS justify-content value for flex mode. */
  justifyContent: string;
  /** CSS align-items value for flex mode. */
  alignItems: string;
  /** Responsive overrides per device. Undefined inherits from desktop. */
  responsive?: {
    tablet?: Partial<Pick<CustomSectionLayout, "mode" | "columns" | "columnRatios" | "gap" | "flexDirection" | "justifyContent" | "alignItems">>;
    mobile?: Partial<Pick<CustomSectionLayout, "mode" | "columns" | "columnRatios" | "gap" | "flexDirection" | "justifyContent" | "alignItems">>;
  };
}

export const DEFAULT_CUSTOM_LAYOUT: CustomSectionLayout = {
  mode: "stack",
  columns: 3,
  gap: 24,
  flexDirection: "row-wrap",
  justifyContent: "flex-start",
  alignItems: "stretch",
};

export interface BlockLayout {
  /** How many grid columns this block spans (1–12). Defaults to 1. */
  columnSpan: number;
  /** How many grid rows this block spans. Defaults to 1. */
  rowSpan: number;
  /** CSS order value for flex/grid reordering. Defaults to 0. */
  order: number;
  /** CSS align-self override for this block. */
  alignSelf: string;
}

export const DEFAULT_BLOCK_LAYOUT: BlockLayout = {
  columnSpan: 1,
  rowSpan: 1,
  order: 0,
  alignSelf: "auto",
};

export interface CustomSectionSettings {
  name: string; // admin-facing label
  /** Layout configuration for blocks inside this section. */
  layout: CustomSectionLayout;
}

// ---------------------------------------------------------------
// The Section — the unit the homepage loops over
// ---------------------------------------------------------------

export interface BaseSection {
  id: string;
  enabled: boolean;
  order: number;
  style: SectionStyle;
}

export type PredefinedSection = {
  [K in PredefinedSectionType]: BaseSection & {
    type: K;
    settings: SectionSettingsMap[K];
    blocks?: never;
  };
}[PredefinedSectionType];

export interface CustomSection extends BaseSection {
  type: "custom";
  settings: CustomSectionSettings;
  blocks: Block[];
  responsiveStyles?: ResponsiveSectionStyles;
}

export type Section = PredefinedSection | CustomSection;

export interface HomepageConfig {
  sections: Section[];
  updatedAt: string;
  published: boolean;
  /** Global page layout settings (width, gaps, navbar, footer). Optional for legacy configs. */
  page?: PageSettings;
}

// ---------------------------------------------------------------
// Admin-facing metadata (labels, icons, defaults) per section type
// ---------------------------------------------------------------

export interface SectionTypeMeta {
  type: SectionType;
  label: string;
  description: string;
}

export const SECTION_TYPE_META: Record<SectionType, SectionTypeMeta> = {
  hero: { type: "hero", label: "Hero", description: "Full-width intro banner with headline and CTA." },
  featuredProducts: { type: "featuredProducts", label: "Featured Products", description: "A curated product grid." },
  newArrivals: { type: "newArrivals", label: "New Arrivals", description: "Most recently added products." },
  bestSellers: { type: "bestSellers", label: "Best Sellers", description: "Top-selling products, horizontal scroll." },
  flashSale: { type: "flashSale", label: "Flash Sale", description: "Countdown-driven promotional grid." },
  categories: { type: "categories", label: "Categories", description: "Shop-by-category card grid." },
  whyUs: { type: "whyUs", label: "Why Choose Us", description: "Icon-and-text value cards, like the homepage." },
  brands: { type: "brands", label: "Brand Partners", description: "Auto-scrolling logo marquee." },
  gallery: { type: "gallery", label: "Gallery", description: "Masonry image gallery." },
  testimonials: { type: "testimonials", label: "Testimonials", description: "Customer review cards." },
  beforeAfter: { type: "beforeAfter", label: "Before / After", description: "Interactive comparison slider." },
  video: { type: "video", label: "Video", description: "Embedded video with custom thumbnail." },
  faq: { type: "faq", label: "FAQ", description: "Expandable question accordion." },
  newsletter: { type: "newsletter", label: "Newsletter", description: "Email capture banner." },
  banner: { type: "banner", label: "Banner", description: "Full-width image banner with a single CTA." },
  custom: { type: "custom", label: "Custom Section", description: "Build a section from blocks." },
};

export const BLOCK_TYPE_META: Record<BlockType, { label: string; description: string }> = {
  heading: { label: "Heading", description: "Section title text" },
  paragraph: { label: "Paragraph", description: "Body copy" },
  image: { label: "Image", description: "Single image" },
  button: { label: "Button", description: "Call-to-action link" },
  spacer: { label: "Spacer", description: "Vertical gap" },
  divider: { label: "Divider", description: "Horizontal rule" },
  productGrid: { label: "Product Grid", description: "Grid of products" },
  productSlider: { label: "Product Slider", description: "Horizontal product scroll" },
  video: { label: "Video", description: "Embedded YouTube video" },
  icon: { label: "Icon", description: "Icon with label" },
  html: { label: "HTML", description: "Raw HTML (advanced)" },
  customWidget: { label: "Custom Widget", description: "Elementor-style fully customizable content block" },
  container: { label: "Container", description: "Nested container with its own widgets and layout" },
};
