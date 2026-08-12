import { Schema, model, models, type Model } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, unique: true, required: true, uppercase: true },
    type: { type: String, enum: ["FIXED", "PERCENTAGE", "FREE_SHIPPING"], required: true },
    value: { type: Number, required: true },
    minOrder: Number,
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    allowedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    allowedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    allowedCategories: [String],
    startDate: Date,
    endDate: Date,
    active: { type: Boolean, default: true },
    description: String,
  },
  { timestamps: true }
);

export const CouponModel: Model<Record<string, unknown>> =
  models.Coupon || model("Coupon", CouponSchema);
