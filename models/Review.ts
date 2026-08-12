import { Schema, model, models, type Model } from "mongoose";

/**
 * Read-only model for the shared `reviews` collection (the same MongoDB
 * cluster the storefront uses). This project never writes reviews — the
 * schema only describes the fields `lib/catalog.ts` reads for the
 * testimonials section.
 */

const ReviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: String,
    rating: { type: Number, min: 1, max: 5 },
    image: String,
    comment: String,
    isVerifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    source: { type: String, enum: ["admin", "customer"], default: "customer" },
  },
  { timestamps: true }
);

export const ReviewModel: Model<Record<string, unknown>> =
  models.Review || model("Review", ReviewSchema);
