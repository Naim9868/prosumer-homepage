import { Schema, model, models, type Model } from "mongoose";

const ReviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    name: { type: String, required: true },
    email: String,
    phone: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: { type: String, required: true },
    images: [{ type: String }],
    avatar: String,
    isVerifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    source: { type: String, enum: ["admin", "customer"], default: "customer" },
  },
  { timestamps: true }
);

ReviewSchema.index({ productId: 1, status: 1 });
ReviewSchema.index({ orderId: 1 });

export const ReviewModel: Model<Record<string, unknown>> =
  models.Review || model("Review", ReviewSchema);
