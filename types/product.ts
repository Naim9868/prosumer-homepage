// types/product.ts
// Types mirror the existing Mongoose Product schema. Adjust field names here
// if your generated Mongoose types differ — this file is the single place
// the UI layer depends on, so the components never need to know about Mongoose.

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
  variantKey?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  reserved?: number;
  images?: string[];
  attributes: VariantAttribute[];
  isDefault?: boolean;
  status?: "active" | "inactive" | "discontinued" | "in_stock" | "out_of_stock" | string;
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
  id?: string;
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
  incoming?: number;
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
  /** Populated by some queries — present when brandId is a populated object */
  brand?: { _id: string; name: string; logo?: string; slug?: string } | null;
  /** Populated by some queries — present when categoryId is a populated object */
  category?: { _id: string; name: string; slug?: string } | null;
  /** Populated by some queries — present when subcategoryId is a populated object */
  subcategory?: { _id: string; name: string; slug?: string } | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/* ------------------------------------------------------------------ */
/* Legacy / compat aliases so existing imports continue to work         */
/* ------------------------------------------------------------------ */

/** @deprecated Use `Product` instead. */
export type IProduct = Product;

/** @deprecated Use `ProductVariant` instead. */
export type IProductVariant = ProductVariant;

export type ProductStatus = "active" | "inactive" | "draft" | "archived";
export type VariantStatus = "active" | "inactive" | "discontinued";

export interface IProductFilters {
  query?: string;
  status?: ProductStatus;
  brandId?: string;
  categoryId?: string;
  subcategoryId?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  page?: number;
  limit?: number;
  sort?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
