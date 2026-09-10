import { z } from "zod";
import { BLOCK_TYPES, PREDEFINED_SECTION_TYPES } from "@/types/homepage";

const sectionStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
  containerWidth: z.enum(["sm", "md", "lg", "xl", "7xl", "full"]).optional(),
  paddingTop: z.number().min(0).max(400).optional(),
  paddingBottom: z.number().min(0).max(400).optional(),
  paddingLeft: z.number().min(0).max(400).optional(),
  paddingRight: z.number().min(0).max(400).optional(),
  minHeight: z.number().min(0).max(3000).optional(),
  overflow: z.enum(["visible", "hidden", "auto"]).optional(),
  position: z.enum(["static", "relative", "absolute", "sticky"]).optional(),
  zIndex: z.number().optional(),
  marginTop: z.number().min(-400).max(400).optional(),
  marginBottom: z.number().min(-400).max(400).optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  borderRadius: z.number().min(0).max(64).optional(),
  hideOnDesktop: z.boolean().optional(),
  hideOnMobile: z.boolean().optional(),
});

const responsiveSectionStylesSchema = z.object({
  light: z.object({
    desktop: sectionStyleSchema.partial().optional(),
    tablet: sectionStyleSchema.partial().optional(),
    mobile: sectionStyleSchema.partial().optional(),
  }).partial().optional(),
  dark: z.object({
    desktop: sectionStyleSchema.partial().optional(),
    tablet: sectionStyleSchema.partial().optional(),
    mobile: sectionStyleSchema.partial().optional(),
  }).partial().optional(),
}).partial().optional();

const pageSettingsSchema = z.object({
  containerWidth: z.number().min(960).max(2560),
  sidePadding: z.number().min(0).max(200),
  productsPerPage: z.number().min(4).max(100),
  navbar: z.object({
    enabled: z.boolean(),
    fixed: z.boolean(),
    transparent: z.boolean(),
    height: z.number().min(40).max(140),
  }),
  footer: z.object({
    enabled: z.boolean(),
    backgroundColor: z.string(),
    paddingTop: z.number().min(0).max(200),
  }),
  trustBadges: z.object({
    enabled: z.boolean(),
    badges: z.array(z.object({
      icon: z.string(),
      title: z.string(),
      subtitle: z.string(),
    })),
  }).optional(),
  productGrid: z.object({
    desktop: z.object({
      columns: z.number().min(2).max(6),
      gap: z.number().min(0).max(60),
    }),
    tablet: z.object({
      columns: z.number().min(2).max(6),
      gap: z.number().min(0).max(60),
    }),
  }).optional(),
});

const blockBreakpointStyleSchema = z.record(z.string(), z.unknown());

const responsiveBlockStylesSchema = z.object({
  light: z.object({
    desktop: blockBreakpointStyleSchema.optional(),
    tablet: blockBreakpointStyleSchema.optional(),
    mobile: blockBreakpointStyleSchema.optional(),
  }).partial().optional(),
  dark: z.object({
    desktop: blockBreakpointStyleSchema.optional(),
    tablet: blockBreakpointStyleSchema.optional(),
    mobile: blockBreakpointStyleSchema.optional(),
  }).partial().optional(),
}).partial().optional();

const blockStyleSchema = z.object({
  desktop: z.record(z.string(), z.unknown()).optional(),
  tablet: z.record(z.string(), z.unknown()).optional(),
  mobile: z.record(z.string(), z.unknown()).optional(),
});

const blockLayoutSchema = z.object({
  columnSpan: z.number().min(1).max(12),
  rowSpan: z.number().min(1).max(12),
  order: z.number(),
  alignSelf: z.string(),
});

const blockAdvancedSchema = z.object({
  cssId: z.string().optional(),
  cssClasses: z.string().optional(),
  customAttributes: z.string().optional(),
  customCSS: z.string().optional(),
  visibility: z.object({
    desktop: z.boolean().optional(),
    tablet: z.boolean().optional(),
    mobile: z.boolean().optional(),
  }).optional(),
  animation: z.object({
    type: z.string().optional(),
    duration: z.number().optional(),
    delay: z.number().optional(),
    easing: z.string().optional(),
  }).optional(),
});

const responsiveBlockLayoutSchema = z.object({
  light: z.object({
    desktop: blockLayoutSchema.optional(),
    tablet: blockLayoutSchema.optional(),
    mobile: blockLayoutSchema.optional(),
  }).partial().optional(),
  dark: z.object({
    desktop: blockLayoutSchema.optional(),
    tablet: blockLayoutSchema.optional(),
    mobile: blockLayoutSchema.optional(),
  }).partial().optional(),
}).partial().optional();

const responsiveBlockSettingsSchema = z.object({
  light: z.object({
    desktop: z.record(z.string(), z.unknown()).optional(),
    tablet: z.record(z.string(), z.unknown()).optional(),
    mobile: z.record(z.string(), z.unknown()).optional(),
  }).partial().optional(),
  dark: z.object({
    desktop: z.record(z.string(), z.unknown()).optional(),
    tablet: z.record(z.string(), z.unknown()).optional(),
    mobile: z.record(z.string(), z.unknown()).optional(),
  }).partial().optional(),
}).partial().optional();

const responsiveBlockAdvancedSchema = z.object({
  light: z.object({
    desktop: blockAdvancedSchema.optional(),
    tablet: blockAdvancedSchema.optional(),
    mobile: blockAdvancedSchema.optional(),
  }).partial().optional(),
  dark: z.object({
    desktop: blockAdvancedSchema.optional(),
    tablet: blockAdvancedSchema.optional(),
    mobile: blockAdvancedSchema.optional(),
  }).partial().optional(),
}).partial().optional();

const blockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(BLOCK_TYPES),
  order: z.number(),
  settings: z.record(z.string(), z.unknown()),
  style: blockStyleSchema.optional(),
  responsiveStyles: responsiveBlockStylesSchema.optional(),
  layout: blockLayoutSchema.optional(),
  responsiveLayout: responsiveBlockLayoutSchema.optional(),
  advanced: blockAdvancedSchema.optional(),
  responsiveAdvanced: responsiveBlockAdvancedSchema.optional(),
  responsiveSettings: responsiveBlockSettingsSchema.optional(),
}).passthrough();

const sectionTypeSchema = z.union([z.enum(PREDEFINED_SECTION_TYPES), z.literal("custom")]);

const sectionSchema = z.object({
  id: z.string().min(1),
  type: sectionTypeSchema,
  enabled: z.boolean(),
  order: z.number(),
  style: sectionStyleSchema,
  responsiveStyles: responsiveSectionStylesSchema,
  settings: z.record(z.string(), z.unknown()),
  blocks: z.array(blockSchema).optional(),
});

export const homepageConfigSchema = z
  .object({
    sections: z.array(sectionSchema),
    page: pageSettingsSchema.optional(),
    updatedAt: z.string(),
    published: z.boolean(),
  })
  .superRefine((config, ctx) => {
    const hero = config.sections.find((s) => s.type === "hero");
    if (!hero) return;

    const slides = Array.isArray(hero.settings.slides) ? (hero.settings.slides as unknown[]) : [];
    if (slides.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["sections", "hero", "slides"],
        message: "Hero: at least one slide is required.",
      });
    }
    if (!slides.some((s) => s && typeof s === "object" && (s as { enabled?: boolean }).enabled !== false)) {
      ctx.addIssue({
        code: "custom",
        path: ["sections", "hero", "slides"],
        message: "Hero: at least one slide must be enabled.",
      });
    }

    const slider = (hero.settings.slider ?? {}) as Record<string, unknown>;
    if (typeof slider.interval === "number" && (slider.interval < 1500 || slider.interval > 30000)) {
      ctx.addIssue({
        code: "custom",
        path: ["sections", "hero", "slider", "interval"],
        message: "Hero: autoplay interval must be between 1.5s and 30s.",
      });
    }

    for (const [i, slide] of slides.entries()) {
      if (!slide || typeof slide !== "object") continue;
      const s = slide as Record<string, unknown>;
      const buttons = (s.buttons ?? {}) as Record<string, Record<string, unknown>>;
      const primary = (buttons.primary ?? {}) as Record<string, unknown>;
      if (!primary.text || String(primary.text).trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["sections", "hero", "slides", i, "buttons", "primary"],
          message: `Hero slide ${i + 1}: primary CTA text is required.`,
        });
      }

      // Each theme (light/dark) stores its own full dataset — validate them too.
      // New shape: per-device datasets under `breakpoints.*`. Legacy shape: flat theme dataset.
      const themes = (s.themes ?? {}) as Record<string, Record<string, unknown>>;
      for (const theme of ["dark", "light"]) {
        const themeData = (themes[theme] ?? {}) as Record<string, unknown>;
        const breakpoints = (themeData.breakpoints ?? null) as Record<string, Record<string, unknown>> | null;
        const datasets: [string, Record<string, unknown>][] =
          breakpoints && Object.keys(breakpoints).length > 0 ? Object.entries(breakpoints) : [["default", themeData]];
        for (const [bp, bpData] of datasets) {
          const themeButtons = (bpData.buttons ?? {}) as Record<string, Record<string, unknown>>;
          const themePrimary = (themeButtons.primary ?? {}) as Record<string, unknown>;
          if (!themePrimary.text || String(themePrimary.text).trim() === "") {
            const scope = breakpoints ? ` (${theme} / ${bp})` : ` (${theme} theme)`;
            ctx.addIssue({
              code: "custom",
              path: ["sections", "hero", "slides", i, "themes", theme, "buttons", "primary"],
              message: `Hero slide ${i + 1}${scope}: primary CTA text is required.`,
            });
          }
        }
      }
    }

    const beforeAfter = config.sections.find((section) => section.type === "beforeAfter");
    if (beforeAfter) {
      const settings = beforeAfter.settings as Record<string, unknown>;
      const items = Array.isArray(settings.items) ? settings.items : [];
      for (const [i, item] of items.entries()) {
        if (!item || typeof item !== "object") continue;
        const comparison = item as Record<string, unknown>;
        if (!String(comparison.title ?? "").trim()) {
          ctx.addIssue({ code: "custom", path: ["sections", "beforeAfter", "items", i, "title"], message: `Before/After comparison ${i + 1}: title is required.` });
        }
        if (!String(comparison.categoryId ?? "").trim()) {
          ctx.addIssue({ code: "custom", path: ["sections", "beforeAfter", "items", i, "categoryId"], message: `Before/After comparison ${i + 1}: category is required.` });
        }
        if (!String(comparison.beforeImage ?? "").trim() || !String(comparison.afterImage ?? "").trim()) {
          ctx.addIssue({ code: "custom", path: ["sections", "beforeAfter", "items", i, "images"], message: `Before/After comparison ${i + 1}: both images are required.` });
        }
      }
    }
  });

export type HomepageConfigInput = z.infer<typeof homepageConfigSchema>;
