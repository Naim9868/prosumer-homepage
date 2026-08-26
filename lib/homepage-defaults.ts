import {
  BLOCK_TYPES,
  BlockType,
  BlockSettingsMap,
  Block,
  PredefinedSectionType,
  Section,
  SectionSettingsMap,
  DEFAULT_SECTION_STYLE,
  CustomSection,
  DEFAULT_CUSTOM_LAYOUT,
  DEFAULT_BLOCK_LAYOUT,
} from "@/types/homepage";
import { createDefaultHeroSettings } from "@/lib/hero";
import { whyUs as whyUsSeed } from "@/lib/data";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

const defaultSectionSettings: SectionSettingsMap = {
  hero: createDefaultHeroSettings(),
  featuredProducts: {
    title: "This season's optics",
    subtitle: "The lenses our customers reach for first.",
    productIds: [],
    layout: {
      desktop: { columns: 4, gridGap: 20, limit: 8 },
      tablet: { columns: 3, gridGap: 16, limit: 6 },
      mobile: { columns: 2, gridGap: 12, limit: 4 },
    },
  },
  newArrivals: {
    eyebrow: "Just In",
    title: "Just landed",
    subtitle: "Fresh off the production line.",
    days: 30,
    layout: {
      desktop: { columns: 4, gridGap: 20, limit: 8 },
      tablet: { columns: 3, gridGap: 16, limit: 6 },
      mobile: { columns: 2, gridGap: 12, limit: 4 },
    },
  },
  bestSellers: {
    eyebrow: "Best Sellers",
    title: "Best sellers this month",
    subtitle: "Ranked by shooters.",
    productIds: [],
    viewAllLabel: "View all",
    viewAllUrl: "/best-sellers",
    layout: {
      desktop: { columns: 4, gridGap: 20, limit: 8 },
      tablet: { columns: 3, gridGap: 16, limit: 6 },
      mobile: { columns: 2, gridGap: 12, limit: 4 },
    },
  },
  flashSale: {
    title: "Flash Sale",
    subtitle: "Limited-time pricing on select lenses.",
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    productIds: [],
    buttonLabel: "Shop the sale",
    buttonUrl: "/collections/all",
  },
  categories: {
    title: "Shop by lens type",
    subtitle: "Browse the catalog by category.",
    categoryIds: [],
  },
  brands: {
    title: "Optical glass sourced from",
    logos: [],
  },
  whyUs: {
    eyebrow: "Why Prosumer",
    title: "Built around Bangladeshi shooters",
    subtitle: "",
    columns: 3,
    animated: true,
    iconVariant: "soft",
    iconSize: 20,
    items: whyUsSeed.map((w, i) => ({
      id: `why_${i}`,
      icon: w.icon,
      title: w.title,
      description: w.description,
    })),
  },
  gallery: {
    title: "Shot on Prosumer",
    subtitle: "Tag @prosumerlensbd to be featured here.",
    images: [],
  },
  testimonials: {
    title: "Trusted by shooters across Bangladesh",
    subtitle: "",
    testimonialIds: [],
  },
  beforeAfter: {
    title: "Same phone. Different glass.",
    subtitle: "Drag the divider to see the difference multi-coated glass makes.",
    beforeImage: "",
    afterImage: "",
    beforeLabel: "Phone Camera",
    afterLabel: "With Prosumer Glass",
  },
  video: {
    title: "Watch the glass go to work",
    subtitle: "",
    youtubeId: "dQw4w9WgXcQ",
  },
  faq: {
    title: "Frequently asked",
    subtitle: "",
    items: [],
  },
  newsletter: {
    title: "Get first access to new glass",
    subtitle: "One email a month, no spam.",
    placeholder: "Your email",
    buttonLabel: "Subscribe",
  },
  banner: {
    title: "Your phone is ready for real glass.",
    subtitle: "Free delivery in Dhaka, COD nationwide, 2-year warranty.",
    buttonLabel: "Start Shopping",
    buttonUrl: "#shop-by-lens",
  },
};

const defaultBlockSettings: BlockSettingsMap = {
  heading: { text: "New heading", level: "h2", align: "left" },
  paragraph: { text: "Add your copy here.", align: "left" },
  image: { url: "", alt: "", rounded: true },
  button: { label: "Click here", url: "#", variant: "primary" },
  spacer: { height: 40 },
  divider: { style: "solid" },
  productGrid: { title: "", productIds: [], columns: 4 },
  productSlider: { title: "", productIds: [] },
  video: { youtubeId: "" },
  icon: { icon: "Star", label: "Feature", size: 32 },
  html: { html: "<p>Custom HTML</p>" },
  customWidget: {
    tag: "div",
    align: "left",
    badge: "New",
    eyebrow: "Widget",
    title: "Custom widget title",
    description: "Use this as a fully customizable content card with your own structure, media, and CTAs.",
    contentHtml: "",
    mediaType: "icon",
    icon: "Sparkles",
    iconSize: 22,
    imageUrl: "",
    imageAlt: "",
    primaryLabel: "Primary action",
    primaryUrl: "#",
    secondaryLabel: "Secondary action",
    secondaryUrl: "#",
    openInNewTab: false,
    contentGap: 12,
  },
  container: {
    name: "Inner Container",
    layout: {
      mode: "grid",
      columns: 2,
      gap: 16,
      flexDirection: "row-wrap",
      justifyContent: "flex-start",
      alignItems: "stretch",
    },
    blocks: [],
  },
};

export function createDefaultSection<T extends PredefinedSectionType>(type: T, order: number): Extract<Section, { type: T }> {
  return {
    id: uid("sec"),
    type,
    enabled: true,
    order,
    style: { ...DEFAULT_SECTION_STYLE },
    settings: defaultSectionSettings[type],
  } as Extract<Section, { type: T }>;
}

export function createCustomSection(order: number): CustomSection {
  return {
    id: uid("sec"),
    type: "custom",
    enabled: true,
    order,
    style: { ...DEFAULT_SECTION_STYLE },
    settings: { name: "Custom Section", layout: { ...DEFAULT_CUSTOM_LAYOUT } },
    blocks: [],
  };
}

export function createDefaultBlock(type: BlockType, order: number): Block {
  return {
    id: uid("blk"),
    type,
    order,
    settings: defaultBlockSettings[type],
    layout: { ...DEFAULT_BLOCK_LAYOUT },
  } as Block;
}

export function isPredefinedBlockType(type: string): type is BlockType {
  return (BLOCK_TYPES as readonly string[]).includes(type);
}
