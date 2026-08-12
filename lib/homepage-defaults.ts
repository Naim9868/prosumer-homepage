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
} from "@/types/homepage";
import { createDefaultHeroSettings } from "@/lib/hero";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

const defaultSectionSettings: SectionSettingsMap = {
  hero: createDefaultHeroSettings(),
  featuredProducts: {
    title: "This season's optics",
    subtitle: "The lenses our customers reach for first.",
    productIds: [],
    columns: 4,
    limit: 8,
  },
  newArrivals: {
    title: "Just landed",
    subtitle: "Fresh off the production line.",
    limit: 8,
  },
  bestSellers: {
    title: "Best sellers this month",
    subtitle: "Ranked by shooters.",
    productIds: [],
    limit: 6,
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
    settings: { name: "Custom Section" },
    blocks: [],
  };
}

export function createDefaultBlock(type: BlockType, order: number): Block {
  return {
    id: uid("blk"),
    type,
    order,
    settings: defaultBlockSettings[type],
  } as Block;
}

export function isPredefinedBlockType(type: string): type is BlockType {
  return (BLOCK_TYPES as readonly string[]).includes(type);
}
