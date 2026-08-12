/**
 * Rich product shape as returned by the storefront `/api/products` routes.
 * This is the same product document the shared MongoDB cluster stores
 * (variants, image groups, brand/category lookups) mapped into a
 * serializable shape for the product pages, drawer and cart validation.
 */

export type ProductStatus = "draft" | "active" | "archived";
export type VariantStatus = "in_stock" | "out_of_stock" | "discontinued";

export interface IVariantAttribute {
  key: string;
  value: string;
}

export interface IProductVariant {
  sku: string;
  variantKey: string;
  attributes: IVariantAttribute[];
  price: number;
  compareAtPrice?: number;
  inventory: number;
  reserved?: number;
  images: string[];
  isDefault?: boolean;
  status: VariantStatus;
}

export interface IProductImage {
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface IProductImageGroup {
  type: string;
  title: string;
  description?: string;
  images: IProductImage[];
}

export interface IProductBadge {
  id?: string;
  label: string;
  color?: string;
  icon?: string;
  type?: "default" | "custom";
}

export interface IInventorySummary {
  available: number;
  reserved: number;
  incoming: number;
  lowStockThreshold: number;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  brandId?: string;
  brand?: { _id: string; name: string; slug?: string; logo?: string } | null;
  categoryId?: string;
  category?: { _id: string; name: string; slug?: string; image?: string } | null;
  variants: IProductVariant[];
  imageGroups: IProductImageGroup[];
  thumbnail: string;
  tags: string[];
  badges: IProductBadge[];
  featured: boolean;
  inventorySummary: IInventorySummary;
  lowestPrice: number;
  highestPrice?: number;
  totalInventory: number;
  ratingAverage: number;
  ratingCount: number;
  status: ProductStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProductFilters {
  page?: number;
  limit?: number;
  query?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  status?: ProductStatus;
  sort?: string;
  specs?: Record<string, string | number | boolean | string[]>;
}

export interface IProductListResponse {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
