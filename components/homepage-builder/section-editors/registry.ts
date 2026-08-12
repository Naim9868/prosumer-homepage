import type { ComponentType } from "react";
import type { PredefinedSectionType, SectionSettingsMap } from "@/types/homepage";
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
import {
  TestimonialsEditor,
  BeforeAfterEditor,
  VideoEditor,
  FaqEditor,
  NewsletterEditor,
  BannerEditor,
} from "@/components/homepage-builder/section-editors/misc-section-editors";

type EditorProps<K extends PredefinedSectionType> = {
  settings: SectionSettingsMap[K];
  onChange: (next: SectionSettingsMap[K]) => void;
};

/** Adding a new predefined section's editor: create the component, add one line here. */
export const SECTION_EDITOR_REGISTRY: { [K in PredefinedSectionType]: ComponentType<EditorProps<K>> } = {
  hero: HeroEditor,
  featuredProducts: FeaturedProductsEditor,
  newArrivals: NewArrivalsEditor,
  bestSellers: BestSellersEditor,
  flashSale: FlashSaleEditor,
  categories: CategoriesEditor,
  brands: BrandsEditor,
  gallery: GalleryEditor,
  testimonials: TestimonialsEditor,
  beforeAfter: BeforeAfterEditor,
  video: VideoEditor,
  faq: FaqEditor,
  newsletter: NewsletterEditor,
  banner: BannerEditor,
};
