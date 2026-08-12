/**
 * The `Product` type is the catalog product shape (see `types/catalog.ts`).
 * It is kept re-exported from here so every consumer that historically
 * imported it from `@/lib/data` keeps working unchanged.
 */
export type { CatalogProduct as Product } from "@/types/catalog";

export const whyUs = [
  { title: "Fast Delivery", description: "Dhaka within 24 hours, nationwide in 2–3 days.", icon: "truck" },
  { title: "Cash on Delivery", description: "Pay when your lens arrives, anywhere in Bangladesh.", icon: "banknote" },
  { title: "2-Year Warranty", description: "Optical and mechanical coverage on every lens.", icon: "shield-check" },
  { title: "Live Support", description: "Real photographers on chat, 7 days a week.", icon: "headset" },
  { title: "Authentic Glass", description: "Multi-coated optical glass, sourced and verified.", icon: "gem" },
  { title: "Easy Returns", description: "14-day no-questions return window.", icon: "rotate-ccw" },
] as const;

export const howItWorks = [
  {
    step: "01",
    title: "Choose your lens",
    description: "Match a lens to your subject — macro for detail, tele for reach, wide for scale.",
  },
  {
    step: "02",
    title: "Attach the clip",
    description: "Spring-loaded titanium clip finds your camera housing in one motion, no adapters.",
  },
  {
    step: "03",
    title: "Capture the shot",
    description: "Multi-coated glass corrects for distortion so the shot looks native to your phone.",
  },
] as const;

export const faqs = [
  {
    question: "Will a lens from Prosumer fit my phone case?",
    answer:
      "Most slim and medium cases work fine with our universal clip. For thick or rugged cases, we recommend removing the case or using the included mounting ring.",
  },
  {
    question: "Do you ship outside Dhaka?",
    answer:
      "Yes — we deliver nationwide through courier partners, with most divisional cities receiving orders within 2–3 business days.",
  },
  {
    question: "Can I pay cash on delivery?",
    answer: "Yes, COD is available everywhere in Bangladesh alongside card and mobile banking payments.",
  },
  {
    question: "What's covered under the 2-year warranty?",
    answer:
      "Optical defects, coating faults, and clip mechanism failures under normal use. Physical damage from drops isn't covered.",
  },
  {
    question: "Do the lenses work with front cameras?",
    answer:
      "The Macro and Wide Angle lenses work well on most front cameras; Telephoto is optimized for rear sensors with autofocus.",
  },
] as const;

export const brandPartners = [
  "Kodak Labs",
  "Fujichrome",
  "Aperture Guild",
  "Lumen Optics",
  "Silverhalide",
  "Meridian Glass",
  "Northlight",
  "Cascade Optics",
];
