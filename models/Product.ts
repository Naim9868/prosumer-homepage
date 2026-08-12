import { Schema, model, models, type Model } from "mongoose";

/**
 * Read-only model for the shared `products` collection (the same MongoDB
 * cluster the storefront uses). This project never writes products — the
 * schema only describes the fields `lib/catalog.ts`, the product pages and
 * the cart-validation route read.
 */

const ProductImageSchema = new Schema(
  {
    url: String,
    alt: String,
    sortOrder: Number,
  },
  { _id: false }
);

const VariantAttributeSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const ProductVariantSchema = new Schema(
  {
    sku: { type: String, required: true },
    variantKey: { type: String, required: true },
    attributes: { type: [VariantAttributeSchema], default: [] },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: 0 },
    inventory: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    isDefault: { type: Boolean, default: false },
    status: { type: String, enum: ["in_stock", "out_of_stock", "discontinued"] },
  },
  { _id: false }
);

const ProductImageGroupSchema = new Schema(
  {
    type: { type: String, enum: ["product", "package", "sample", "lifestyle", "installation", "comparison", "other"], required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    images: { type: [ProductImageSchema], default: [] },
  },
  { _id: false }
);

const ProductBadgeSchema = new Schema(
  {
    id: String,
    label: String,
    color: String,
    icon: String,
    type: String,
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: String,
    description: String,
    shortDescription: String,
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    subcategoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    thumbnail: String,
    images: { type: [ProductImageSchema], default: [] },
    imageGroups: { type: [ProductImageGroupSchema], default: [] },
    lowestPrice: Number,
    highestPrice: Number,
    totalInventory: Number,
    inventorySummary: {
      available: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 },
      incoming: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 5 },
    },
    ratingAverage: Number,
    ratingCount: Number,
    featured: { type: Boolean, default: false },
    badges: { type: [ProductBadgeSchema], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    tags: { type: [String], default: [] },
    specificationGroups: { type: Schema.Types.Mixed, default: [] },
    status: { type: String, default: "active" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ProductSchema.index({ searchKeywords: "text", name: "text", shortDescription: "text" });
ProductSchema.index({ status: 1 });
ProductSchema.index({ deletedAt: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ lowestPrice: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ ratingCount: -1 });
ProductSchema.index({ ratingAverage: -1 });

export const ProductModel: Model<Record<string, unknown>> =
  models.Product || model("Product", ProductSchema);
