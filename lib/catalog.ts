import "server-only";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/dbConnect";
import { ProductModel } from "@/models/Product";
import { CategoryModel } from "@/models/Category";
import { BrandModel } from "@/models/Brand";
import { ReviewModel } from "@/models/Review";
import type { CatalogCategory, CatalogData, CatalogProduct, CatalogReview, CatalogStock } from "@/types/catalog";

const CATALOG_TAG = "catalog";

const CATEGORY_GRADIENTS = [
  "linear-gradient(160deg, #234a5c 0%, #0e0f11 100%)",
  "linear-gradient(160deg, #4c3a1a 0%, #0e0f11 100%)",
  "linear-gradient(160deg, #1a3a2c 0%, #0e0f11 100%)",
  "linear-gradient(160deg, #3a1a3a 0%, #0e0f11 100%)",
  "linear-gradient(160deg, #123044 0%, #0e0f11 100%)",
  "linear-gradient(160deg, #3a2c12 0%, #0e0f11 100%)",
  "linear-gradient(160deg, #2c2418 0%, #0e0f11 100%)",
  "linear-gradient(160deg, #331c33 0%, #0e0f11 100%)",
];

const PRODUCT_GRADIENTS = [
  "linear-gradient(150deg, #2a2c30 0%, #0e0f11 100%)",
  "linear-gradient(150deg, #332a1c 0%, #0e0f11 100%)",
  "linear-gradient(150deg, #1c3327 0%, #0e0f11 100%)",
  "linear-gradient(150deg, #14293a 0%, #0e0f11 100%)",
  "linear-gradient(150deg, #331c33 0%, #0e0f11 100%)",
  "linear-gradient(150deg, #332818 0%, #0e0f11 100%)",
  "linear-gradient(150deg, #2c2418 0%, #0e0f11 100%)",
  "linear-gradient(150deg, #24201c 0%, #0e0f11 100%)",
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface CategoryDoc {
  _id: unknown;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  parentId?: unknown | null;
}

interface BrandDoc {
  _id: unknown;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  isActive?: boolean;
}

interface ProductDoc {
  _id: unknown;
  name: string;
  slug?: string;
  thumbnail?: string;
  images?: { url?: string }[];
  brandId?: unknown;
  categoryId?: unknown;
  lowestPrice?: number;
  highestPrice?: number;
  totalInventory?: number;
  ratingAverage?: number;
  ratingCount?: number;
  featured?: boolean;
  badges?: { label?: string }[];
  variants?: { price?: number; compareAtPrice?: number; inventory?: number; status?: string }[];
  status?: string;
  deletedAt?: Date | null;
  createdAt?: Date;
}

interface ReviewDoc {
  _id: unknown;
  productId?: unknown;
  name: string;
  rating?: number;
  image?: string;
  comment?: string;
  isVerifiedPurchase?: boolean;
  createdAt?: Date;
}

function toCatalogCategory(doc: CategoryDoc, index: number): CatalogCategory {
  const description = doc.description ?? "";
  const firstSentence = description.split(/[.\n]/)[0]?.trim() ?? "";
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug ?? "",
    tagline: firstSentence && firstSentence.length <= 60 ? firstSentence : firstSentence ? `${firstSentence.slice(0, 57)}...` : "",
    description,
    image: doc.image ?? "",
    gradient: CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length],
    parentId: doc.parentId ? String(doc.parentId) : null,
  };
}

function toCatalogProduct(
  doc: ProductDoc,
  categories: Map<string, CatalogCategory>,
  brands: Map<string, BrandDoc>
): CatalogProduct {
  const variants = doc.variants ?? [];
  const prices = variants.map((v) => v.price).filter((p): p is number => typeof p === "number");
  const minVariantPrice = prices.length ? Math.min(...prices) : undefined;
  const price = doc.lowestPrice ?? minVariantPrice ?? 0;

  const comparePrices = variants
    .map((v) => v.compareAtPrice)
    .filter((c): c is number => typeof c === "number" && c > price);
  const compareAtPrice = comparePrices.length ? Math.min(...comparePrices) : undefined;

  const totalInventory =
    doc.totalInventory ??
    variants.reduce((sum, v) => sum + (typeof v.inventory === "number" ? v.inventory : 0), 0);
  const stock: CatalogStock =
    totalInventory > 20 ? "in-stock" : totalInventory > 0 ? "low-stock" : "preorder";

  const categoryId = doc.categoryId ? String(doc.categoryId) : "";
  const category = categories.get(categoryId);
  const brandId = doc.brandId ? String(doc.brandId) : "";
  const brand = brands.get(brandId);

  const images = (doc.images ?? []).map((img) => img.url).filter((url): url is string => !!url);

  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug ?? "",
    category: category?.name ?? "",
    categorySlug: category?.slug ?? "",
    categoryId,
    brand: brand?.name ?? "",
    brandSlug: brand?.slug ?? "",
    brandId,
    price,
    compareAtPrice,
    rating: doc.ratingAverage ?? 0,
    reviewCount: doc.ratingCount ?? 0,
    stock,
    badge: doc.badges?.find((b) => b.label)?.label,
    image: doc.thumbnail || images[0] || "",
    images,
    gradient: PRODUCT_GRADIENTS[hashString(categoryId || doc.name) % PRODUCT_GRADIENTS.length],
    featured: !!doc.featured,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date().toISOString(),
  };
}

function toCatalogReview(doc: ReviewDoc, productNames: Map<string, string>): CatalogReview {
  const productId = doc.productId ? String(doc.productId) : "";
  return {
    id: String(doc._id),
    name: doc.name,
    rating: doc.rating ?? 0,
    comment: doc.comment ?? "",
    product: productNames.get(productId) ?? "Prosumer Lens",
    productId,
    image: doc.image ?? "",
    isVerifiedPurchase: !!doc.isVerifiedPurchase,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : "",
  };
}

/**
 * The single source of catalog truth for both the public homepage and the
 * admin builder. Reads active, non-deleted products, active categories and
 * approved reviews from MongoDB and maps them into serializable shapes.
 * Cached with the same 60s revalidate window as the homepage.
 */
export const getCatalogData = unstable_cache(
  async (): Promise<CatalogData> => {
    await connectDB();
    const [cats, brandsRaw, prods, revs] = await Promise.all([
      CategoryModel.find({ status: "active" }).lean().exec(),
      BrandModel.find({ isActive: true }).lean().exec(),
      ProductModel.find({ status: "active", deletedAt: null }).lean().exec(),
      ReviewModel.find({ status: "approved" }).lean().exec(),
    ]);

    const categories = (cats as unknown as CategoryDoc[]).map(toCatalogCategory);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const brandMap = new Map(
      (brandsRaw as unknown as BrandDoc[]).map((b) => [String(b._id), b])
    );
    const products = (prods as unknown as ProductDoc[]).map((p) =>
      toCatalogProduct(p, categoryMap, brandMap)
    );

    const productNames = new Map(
      (prods as unknown as ProductDoc[]).map((p) => [String(p._id), p.name])
    );
    const reviews = (revs as unknown as ReviewDoc[])
      .map((r) => toCatalogReview(r, productNames))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

    return { products, categories, reviews };
  },
  ["catalog-data"],
  { tags: [CATALOG_TAG], revalidate: 60 }
);
