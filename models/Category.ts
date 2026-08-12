import { Schema, model, models, type Model } from "mongoose";

/**
 * Read-only model for the shared `categories` collection (the same MongoDB
 * cluster the storefront uses). This project never writes categories — the
 * schema only describes the fields `lib/catalog.ts` reads.
 */

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: String,
    image: String,
    imagePublicId: String,
    description: String,
    parentId: { type: Schema.Types.ObjectId, default: null },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export const CategoryModel: Model<Record<string, unknown>> =
  models.Category || model("Category", CategorySchema);
