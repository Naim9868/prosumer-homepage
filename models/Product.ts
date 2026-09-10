import { Schema, model, models, type Model } from "mongoose";

export type ImageGroupType =
  | "primary"
  | "product"
  | "detail"
  | "diagram"
  | "package"
  | "contents"
  | "lifestyle"
  | "usage"
  | "scale"
  | "dimensions"
  | "features"
  | "infographic"
  | "comparison"
  | "result"
  | "installation"
  | "instruction"
  | "cover"
  | "gallery"
  | "variant";

export interface ProductImage {
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface ProductImageGroup {
  type: ImageGroupType;
  title: string;
  description?: string;
  images: ProductImage[];
}

export interface VariantAttribute {
  key: string;
  value: string;
  label?: string; // optional display override for `key` (e.g. "color" -> "Color")
}

export interface ProductVariant {
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  reserved?: number;
  images?: string[];
  attributes: VariantAttribute[];
  status?: "active" | "inactive" | "discontinued" | string;
}

export interface Specification {
  key: string;
  label: string;
  value: string;
  unit?: string;
  type?: "text" | "number" | "boolean";
}

export interface SpecificationGroup {
  groupName: string;
  displayOrder?: number;
  specifications: Specification[];
}

export interface ProductBadge {
  label: string;
  color?: string;
  icon?: string;
  type?: string;
}

export interface ProductVideo {
  provider: "youtube" | "vimeo" | "other" | string;
  url: string;
  title?: string;
  thumbnail?: string;
}

export interface InventorySummary { 
  available: number;
  reserved?: number;
  lowStockThreshold?: number;
  hideExactQuantity?: boolean;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface RelatedProductSummary {
  _id: string;
  slug: string;
  name: string;
  thumbnail?: string;
  lowestPrice?: number;
  highestPrice?: number;
  ratingAverage?: number;
  ratingCount?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  brandId?: { _id: string; name: string; logo?: string } | string;
  categoryId?: { _id: string; name: string } | string;
  subcategoryId?: { _id: string; name: string } | string;
  specificationGroups?: SpecificationGroup[];
  specsFlat?: Specification[];
  variants: ProductVariant[];
  imageGroups?: ProductImageGroup[];
  thumbnail?: string;
  videos?: ProductVideo[];
  tags?: string[];
  inventorySummary?: InventorySummary;
  relatedProducts?: RelatedProductSummary[];
  featured?: boolean;
  badges?: ProductBadge[];
  ratingAverage?: number;
  ratingCount?: number;
  lowestPrice?: number;
  highestPrice?: number;
  totalInventory?: number;
  status?: string;
  seo?: ProductSEO;
}

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true, index: true },
    description: { type: String },
    shortDescription: { type: String },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    subcategoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    specificationGroups: [
      {
        groupName: String,
        displayOrder: Number,
        specifications: [
          {
            key: String,
            label: String,
            value: String,
            unit: String,
            type: { type: String, enum: ["text", "number", "boolean"] },
          },
        ],
      },
    ],
    specsFlat: [
      {
        key: String,
        label: String,
        value: String,
        unit: String,
        type: { type: String, enum: ["text", "number", "boolean"] },
      },
    ],
    variants: [
      {
        sku: String,
        price: Number,
        compareAtPrice: Number,
        inventory: { type: Number, default: 0 },
        reserved: { type: Number, default: 0 },
        images: [String],
        attributes: [
          {
            key: String,
            value: String,
            label: String,
          },
        ],
        status: { type: String, default: "active" },
      },
    ],
    imageGroups: [
      {
        type: { type: String },
        title: String,
        description: String,
        images: [
          {
            url: String,
            alt: String,
            sortOrder: Number,
          },
        ],
      },
    ],
    thumbnail: { type: String },
    videos: [
      {
        provider: String,
        url: String,
        title: String,
        thumbnail: String,
      },
    ],
    tags: { type: [String], index: true },
    inventorySummary: {
      available: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 5 },
      hideExactQuantity: { type: Boolean, default: false },
    },
    relatedProducts: [
      {
        _id: { type: Schema.Types.ObjectId },
        slug: String,
        name: String,
        thumbnail: String,
        lowestPrice: Number,
        highestPrice: Number,
        ratingAverage: Number,
        ratingCount: Number,
      },
    ],
    featured: { type: Boolean, default: false, index: true },
    badges: [
      {
        label: String,
        color: String,
        icon: String,
        type: String,
      },
    ],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    lowestPrice: { type: Number, default: 0 },
    highestPrice: { type: Number },
    totalInventory: { type: Number, default: 0 },
    status: { type: String, default: "active", index: true },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      canonicalUrl: String,
      ogImage: String,
      noIndex: { type: Boolean, default: false },
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ status: 1, deletedAt: 1 });
ProductSchema.index({ name: "text", shortDescription: "text", tags: "text" });

export const ProductModel: Model<Record<string, unknown>> =
  models.Product || model("Product", ProductSchema);
