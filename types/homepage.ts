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
  textAlign?: "left" | "center" | "right";
  borderRadius?: number; // px
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
}

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
// Predefined section types
// ---------------------------------------------------------------

export const PREDEFINED_SECTION_TYPES = [
  "hero",
  "featuredProducts",
  "newArrivals",
  "bestSellers",
  "flashSale",
  "categories",
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

export type HeroLayout = "premium-split" | "cinematic" | "product-focus" | "collection" | "promotion";
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
  width: number; // % of the section (default 100)
  height: number; // % of the section (default 100)
}

export interface HeroMedia {
  source: HeroMediaSource;
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
  backgroundImage: string;
  backgroundImageDark?: string;
  productImage: string;
  productId: string;
  position: HeroImagePosition;
  backgroundSize: HeroBackgroundSize;
  floatingBadge: HeroFloatingBadge;
}

export interface HeroButton {
  text: string;
  url: string;
  style: HeroButtonStyle;
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

/** Per-breakpoint layout controls. */
export interface HeroResponsiveSettings {
  headingSize: number; // px
  descriptionSize: number; // px
  eyebrowSize: number; // px
  textAlign: HeroTextAlign;
  contentOrder: "content-first" | "media-first";
  /** Auto → fits content, full-screen → viewport height, custom → customHeight px. */
  heightMode: HeroHeightMode;
  customHeight: number; // px, used when heightMode === "custom"
  contentGap: number; // px between text/media
  imagePosition: HeroImagePosition;
  showSecondaryCta: boolean;
  showBadges: boolean;
}

export interface HeroResponsive {
  desktop: HeroResponsiveSettings;
  tablet: HeroResponsiveSettings;
  mobile: HeroResponsiveSettings;
}

export interface HeroSlideStyling {
  colors: HeroColors;
  typography: HeroTypography;
  spacing: HeroSpacing;
  /** 0..1 — dark scrim strength over the background image (0 = fully visible). */
  overlayOpacity: number;
}

/**
 * The complete dataset for one theme (dark or light). Each theme stores its
 * own text content, buttons, badges, background media, styling, and
 * responsive settings — so light and dark variants are fully independent.
 */
export interface HeroThemeData {
  content: HeroContent;
  buttons: { primary: HeroButton; secondary: HeroButton };
  badges: HeroBadge[];
  media: HeroMedia;
  styling: HeroSlideStyling;
  responsive: HeroResponsive;
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
  title: string;
  subtitle: string;
  productIds: string[];
  columns: 2 | 3 | 4;
  limit: number;
}

export interface NewArrivalsSettings {
  title: string;
  subtitle: string;
  limit: number;
}

export interface BestSellersSettings {
  title: string;
  subtitle: string;
  productIds: string[];
  limit: number;
}

export interface FlashSaleSettings {
  title: string;
  subtitle: string;
  endsAt: string; // ISO date
  productIds: string[];
  buttonLabel: string;
  buttonUrl: string;
}

export interface CategoriesSettings {
  title: string;
  subtitle: string;
  categoryIds: string[];
  /**
   * Grid column layout. 2 = compact two-up on mobile, 3 = three-up.
   * Desktop always uses a readable multi-column editorial grid.
   */
  columns?: 2 | 3;
}

export interface BrandsSettings {
  title: string;
  logos: { name: string; url: string }[];
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

export interface BeforeAfterSettings {
  title: string;
  subtitle: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
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
}

export interface Block<T extends BlockType = BlockType> {
  id: string;
  type: T;
  order: number;
  settings: BlockSettingsMap[T];
}

export interface CustomSectionSettings {
  name: string; // admin-facing label
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
}

export type Section = PredefinedSection | CustomSection;

export interface HomepageConfig {
  sections: Section[];
  updatedAt: string;
  published: boolean;
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
};
