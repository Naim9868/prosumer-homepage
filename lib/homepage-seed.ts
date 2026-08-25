import { createDefaultSection, createCustomSection, createDefaultBlock } from "@/lib/homepage-defaults";
import type { HomepageConfig, Section } from "@/types/homepage";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";
import { faqs, brandPartners } from "@/lib/data";

/**
 * The starting configuration — mirrors the previously hardcoded homepage
 * so switching to the dynamic builder doesn't change what visitors see
 * on day one.
 */
export function buildSeedHomepage(): HomepageConfig {
  let order = 0;
  const sections: Section[] = [];

  const hero = createDefaultSection("hero", order++);
  sections.push(hero);

  const categories = createDefaultSection("categories", order++);
  sections.push(categories);

  const featuredProducts = createDefaultSection("featuredProducts", order++);
  sections.push(featuredProducts);

  // "Why Choose Us" is a first-class predefined section — the builder's
  // editor shows an exact homepage preview and per-card customization.
  const whyUs = createDefaultSection("whyUs", order++);
  sections.push(whyUs);

  const beforeAfter = createDefaultSection("beforeAfter", order++);
  sections.push(beforeAfter);

  const howItWorks = createCustomSection(order++);
  howItWorks.settings.name = "How It Works";
  howItWorks.blocks = [
    { ...createDefaultBlock("heading", 0), settings: { text: "From box to first shot in a minute", level: "h2", align: "center" } },
    { ...createDefaultBlock("paragraph", 1), settings: { text: "01 — Choose your lens: match a lens to your subject.", align: "left" } },
    { ...createDefaultBlock("paragraph", 2), settings: { text: "02 — Attach the clip: spring-loaded titanium clip, no adapters.", align: "left" } },
    { ...createDefaultBlock("paragraph", 3), settings: { text: "03 — Capture the shot: multi-coated glass corrects distortion.", align: "left" } },
  ];
  sections.push(howItWorks);

  const bestSellers = createDefaultSection("bestSellers", order++);
  sections.push(bestSellers);

  const testimonials = createDefaultSection("testimonials", order++);
  sections.push(testimonials);

  const video = createDefaultSection("video", order++);
  sections.push(video);

  const gallery = createDefaultSection("gallery", order++);
  sections.push(gallery);

  const faq = createDefaultSection("faq", order++);
  faq.settings.items = faqs.map((f, i) => ({ id: `faq_${i}`, question: f.question, answer: f.answer }));
  sections.push(faq);

  const brands = createDefaultSection("brands", order++);
  brands.settings.logos = brandPartners.map((name) => ({ name, url: "" }));
  sections.push(brands);

  const banner = createDefaultSection("banner", order++);
  sections.push(banner);

  return {
    sections,
    page: { ...DEFAULT_PAGE_SETTINGS, navbar: { ...DEFAULT_PAGE_SETTINGS.navbar }, footer: { ...DEFAULT_PAGE_SETTINGS.footer } },
    updatedAt: new Date().toISOString(),
    published: true,
  };
}
