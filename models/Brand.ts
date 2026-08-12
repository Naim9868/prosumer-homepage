import { Schema, model, models, type Model } from "mongoose";

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true, index: true },
    logo: { type: String, trim: true },
    logoPublicId: String,
    description: String,
    website: String,
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const BrandModel: Model<Record<string, unknown>> =
  models.Brand || model("Brand", BrandSchema);
