import { Schema, model, models, type Model } from "mongoose";

/**
 * Production persistence for the homepage configuration.
 *
 * MongoDB is the single source of truth for every piece of homepage data —
 * sections, hero slides, per-theme datasets, blocks, and styling all live in
 * this one `Homepage` document. `services/homepage.service.ts` reads and
 * writes through `HomepageModel` via `lib/homepage-store.ts`; nothing is
 * persisted to the local filesystem.
 */

const SectionStyleSchema = new Schema(
  {
    backgroundColor: String,
    backgroundImage: String,
    containerWidth: { type: String, enum: ["sm", "md", "lg", "xl", "7xl", "full"] },
    paddingTop: Number,
    paddingBottom: Number,
    textAlign: { type: String, enum: ["left", "center", "right"] },
    borderRadius: Number,
    hideOnDesktop: Boolean,
    hideOnMobile: Boolean,
  },
  { _id: false }
);

const BlockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    order: { type: Number, required: true },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const SectionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, required: true },
    style: { type: SectionStyleSchema, default: () => ({}) },
    settings: { type: Schema.Types.Mixed, default: {} },
    blocks: { type: [BlockSchema], default: undefined }, // only present on "custom" sections
  },
  { _id: false }
);

const HomepageSchema = new Schema(
  {
    sections: { type: [SectionSchema], default: [] },
    page: { type: Schema.Types.Mixed, default: undefined }, // global page layout settings
    published: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: false, updatedAt: "updatedAt" } }
);

export const HomepageModel: Model<Record<string, unknown>> =
  models.Homepage || model("Homepage", HomepageSchema);
