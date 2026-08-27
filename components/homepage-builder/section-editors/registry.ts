import type { ComponentType } from "react";
import type { PredefinedSectionType, SectionSettingsMap, SectionStyle } from "@/types/homepage";
import { HeroEditor } from "@/components/homepage-builder/section-editors/hero-editor";
import {
  FeaturedProductsEditor,
  NewArrivalsEditor,
  BestSellersEditor,
  FlashSaleEditor,
} from "@/components/homepage-builder/section-editors/product-section-editors";
import {
  CategoriesEditor,
  BrandsEditor,
  GalleryEditor,
} from "@/components/homepage-builder/section-editors/content-section-editors";
import { WhyUsEditor } from "@/components/homepage-builder/section-editors/why-us-editor";
import {
  TestimonialsEditor,
  VideoEditor,
  FaqEditor,
  NewsletterEditor,
  BannerEditor,
} from "@/components/homepage-builder/section-editors/misc-section-editors";
import { BeforeAfterEditor as ResponsiveBeforeAfterEditor } from "@/components/homepage-builder/section-editors/before-after-editor";

type EditorProps<K extends PredefinedSectionType> = {
  settings: SectionSettingsMap[K];
  onChange: (next: SectionSettingsMap[K]) => void;
  /** Section-level style so editors can render an exact live preview. */
  style?: SectionStyle;
};

/** Adding a new predefined section's editor: create the component, add one line here. */
export const SECTION_EDITOR_REGISTRY: { [K in PredefinedSectionType]: ComponentType<EditorProps<K>> } = {
  hero: HeroEditor,
  featuredProducts: FeaturedProductsEditor,
  newArrivals: NewArrivalsEditor,
  bestSellers: BestSellersEditor,
  flashSale: FlashSaleEditor,
  categories: CategoriesEditor,
  whyUs: WhyUsEditor,
  brands: BrandsEditor,
  gallery: GalleryEditor,
  testimonials: TestimonialsEditor,
  beforeAfter: ResponsiveBeforeAfterEditor,
  video: VideoEditor,
  faq: FaqEditor,
  newsletter: NewsletterEditor,
  banner: BannerEditor,
};
