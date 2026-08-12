import type { ComponentType } from "react";
import type { Section, SectionType } from "@/types/homepage";
import type { CatalogData } from "@/types/catalog";
import { HeroSection } from "@/components/homepage-sections/hero-section";
import { CategoriesSection } from "@/components/homepage-sections/categories-section";
import { FeaturedProductsSection } from "@/components/homepage-sections/featured-products-section";
import { NewArrivalsSection } from "@/components/homepage-sections/new-arrivals-section";
import { BestSellersSection } from "@/components/homepage-sections/best-sellers-section";
import { FlashSaleSection } from "@/components/homepage-sections/flash-sale-section";
import { BrandsSection } from "@/components/homepage-sections/brands-section";
import { GallerySection } from "@/components/homepage-sections/gallery-section";
import { TestimonialsSection } from "@/components/homepage-sections/testimonials-section";
import { BeforeAfterSection } from "@/components/homepage-sections/before-after-section";
import { VideoSection } from "@/components/homepage-sections/video-section";
import { FaqSection } from "@/components/homepage-sections/faq-section";
import { NewsletterSection } from "@/components/homepage-sections/newsletter-section";
import { BannerSection } from "@/components/homepage-sections/banner-section";
import { CustomSectionRenderer } from "@/components/homepage-sections/custom-section-renderer";

/**
 * Adding a new predefined section type:
 *  1. add its settings shape to types/homepage.ts
 *  2. create the renderer component
 *  3. register it here
 *  4. create an editor form under components/homepage-builder/section-editors
 * The homepage loop (app/page.tsx) never changes.
 */
export const SECTION_REGISTRY: {
  [K in SectionType]: ComponentType<{
    section: Extract<Section, { type: K }>;
    catalog?: CatalogData;
    preview?: boolean;
  }>;
} = {
  hero: HeroSection,
  featuredProducts: FeaturedProductsSection,
  newArrivals: NewArrivalsSection,
  bestSellers: BestSellersSection,
  flashSale: FlashSaleSection,
  categories: CategoriesSection,
  brands: BrandsSection,
  gallery: GallerySection,
  testimonials: TestimonialsSection,
  beforeAfter: BeforeAfterSection,
  video: VideoSection,
  faq: FaqSection,
  newsletter: NewsletterSection,
  banner: BannerSection,
  custom: CustomSectionRenderer,
};
