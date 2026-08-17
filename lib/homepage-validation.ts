import { z } from "zod";
import { BLOCK_TYPES, PREDEFINED_SECTION_TYPES } from "@/types/homepage";

const sectionStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
  containerWidth: z.enum(["sm", "md", "lg", "xl", "7xl", "full"]).optional(),
  paddingTop: z.number().min(0).max(400).optional(),
  paddingBottom: z.number().min(0).max(400).optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  borderRadius: z.number().min(0).max(64).optional(),
  hideOnDesktop: z.boolean().optional(),
  hideOnMobile: z.boolean().optional(),
});

const pageSettingsSchema = z.object({
  containerWidth: z.number().min(960).max(2560),
  sidePadding: z.number().min(0).max(200),
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
});

const blockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(BLOCK_TYPES),
  order: z.number(),
  settings: z.record(z.string(), z.unknown()),
});

const sectionTypeSchema = z.union([z.enum(PREDEFINED_SECTION_TYPES), z.literal("custom")]);

const sectionSchema = z.object({
  id: z.string().min(1),
  type: sectionTypeSchema,
  enabled: z.boolean(),
  order: z.number(),
  style: sectionStyleSchema,
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
  });

export type HomepageConfigInput = z.infer<typeof homepageConfigSchema>;
