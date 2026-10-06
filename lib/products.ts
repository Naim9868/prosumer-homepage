import "server-only";
import { connectDB } from "@/lib/dbConnect";
import { ProductModel } from "@/models/Product";
import { BrandModel } from "@/models/Brand";
import { CategoryModel } from "@/models/Category";
import type { IProduct, IProductFilters, IProductListResponse, ProductStatus, VariantStatus } from "@/types/product";
import { Types } from "mongoose";

interface CategoryDoc {
  _id: unknown;
  name?: string;
  slug?: string;
  image?: string;
  description?: string;
  parentId?: unknown | null;
}

interface BrandDoc {
  _id: unknown;
  name?: string;
  slug?: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
}

interface VariantDoc {
  sku?: string;
  variantKey?: string;
  attributes?: { key: string; value: string }[];
  price?: number;
  compareAtPrice?: number;
  inventory?: number;
  reserved?: number;
  images?: string[];
  isDefault?: boolean;
  status?: string;
}

interface ProductDoc {
  _id: unknown;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  brandId?: unknown;
  categoryId?: unknown;
  thumbnail?: string;
  tags?: string[];
  badges?: unknown[];
  imageGroups?: unknown[];
  relatedProducts?: { _id: unknown; slug?: string; name?: string; thumbnail?: string; lowestPrice?: number; highestPrice?: number; ratingAverage?: number; ratingCount?: number }[];
  specificationGroups?: { groupName?: string; displayOrder?: number; specifications?: { key?: string; label?: string; value?: string; unit?: string; type?: string }[] }[];
  featured?: boolean;
  inventorySummary?: { available?: number; reserved?: number; incoming?: number; lowStockThreshold?: number };
  totalInventory?: number;
  variants?: VariantDoc[];
  lowestPrice?: number;
  highestPrice?: number;
  ratingAverage?: number;
  ratingCount?: number;
  status?: string;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

function toCategorySummary(doc: CategoryDoc | null | undefined) {
  if (!doc) return null;
  return {
    _id: String(doc._id),
    name: doc.name || "",
    slug: doc.slug || "",
    image: doc.image || "",
    description: doc.description || "",
    parentId: doc.parentId ? String(doc.parentId) : null,
  };
}

function toBrandSummary(doc: BrandDoc | null | undefined) {
  if (!doc) return null;
  return {
    _id: String(doc._id),
    name: doc.name || "",
    slug: doc.slug || "",
    logo: doc.logo || "",
    description: doc.description || "",
    isActive: !!doc.isActive,
  };
}

function serializeProduct(p: ProductDoc, categoryMap: Map<string, CategoryDoc>, brandMap: Map<string, BrandDoc>): IProduct {
  const variants = (p.variants || []).map((v: VariantDoc) => ({
    sku: v.sku || "",
    variantKey: v.variantKey || "",
    attributes: Array.isArray(v.attributes) ? v.attributes : [],
    price: typeof v.price === "number" ? v.price : 0,
    compareAtPrice: typeof v.compareAtPrice === "number" ? v.compareAtPrice : undefined,
    inventory: typeof v.inventory === "number" ? v.inventory : 0,
    reserved: typeof v.reserved === "number" ? v.reserved : 0,
    images: Array.isArray(v.images) ? v.images : [],
    isDefault: !!v.isDefault,
    status: (v.status || "in_stock") as VariantStatus,
  }));

  const categoryId = p.categoryId ? String(p.categoryId) : "";
  const brandId = p.brandId ? String(p.brandId) : "";
  const category = toCategorySummary(categoryMap.get(categoryId));
  const brand = toBrandSummary(brandMap.get(brandId));

  const inventorySummary = p.inventorySummary || {};
  const totalInventory =
    typeof p.totalInventory === "number"
      ? p.totalInventory
      : variants.reduce((sum: number, v: VariantDoc) => sum + (v.inventory || 0), 0);

  return {
    _id: String(p._id),
    name: p.name,
    slug: p.slug || "",
    description: p.description || "",
    shortDescription: p.shortDescription || "",
    brandId,
    brand,
    categoryId,
    category,
    variants,
    imageGroups: Array.isArray(p.imageGroups) ? (p.imageGroups as IProduct["imageGroups"]) : [],
    thumbnail: p.thumbnail || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    badges: Array.isArray(p.badges) ? (p.badges as IProduct["badges"]) : [],
    featured: !!p.featured,
    relatedProducts: Array.isArray(p.relatedProducts)
      ? p.relatedProducts.map((rp) => ({
          _id: String(rp._id),
          slug: rp.slug || "",
          name: rp.name || "",
          thumbnail: rp.thumbnail || "",
          lowestPrice: typeof rp.lowestPrice === "number" ? rp.lowestPrice : undefined,
          highestPrice: typeof rp.highestPrice === "number" ? rp.highestPrice : undefined,
          ratingAverage: typeof rp.ratingAverage === "number" ? rp.ratingAverage : undefined,
          ratingCount: typeof rp.ratingCount === "number" ? rp.ratingCount : undefined,
        }))
      : undefined,
    specificationGroups: Array.isArray(p.specificationGroups)
      ? (p.specificationGroups as IProduct["specificationGroups"])
      : undefined,
    inventorySummary: {
      available: typeof inventorySummary.available === "number" ? inventorySummary.available : totalInventory,
      reserved: typeof inventorySummary.reserved === "number" ? inventorySummary.reserved : 0,
      incoming: typeof inventorySummary.incoming === "number" ? inventorySummary.incoming : 0,
      lowStockThreshold: typeof inventorySummary.lowStockThreshold === "number" ? inventorySummary.lowStockThreshold : 5,
    },
    lowestPrice: typeof p.lowestPrice === "number" ? p.lowestPrice : 0,
    highestPrice: typeof p.highestPrice === "number" ? p.highestPrice : undefined,
    totalInventory,
    ratingAverage: typeof p.ratingAverage === "number" ? p.ratingAverage : 0,
    ratingCount: typeof p.ratingCount === "number" ? p.ratingCount : 0,
    status: (p.status || "active") as ProductStatus,
    deletedAt: p.deletedAt ? String(p.deletedAt) : null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export async function getProducts(filters: IProductFilters = {}): Promise<IProductListResponse> {
  await connectDB();

  const {
    page = 1,
    limit = 20,
    query,
    categoryId,
    brandId,
    minPrice,
    maxPrice,
    tags,
    status,
    sort = "newest",
  } = filters;

  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 20, 100);
  const skip = (pageNum - 1) * limitNum;
  const matchStage: Record<string, unknown> = {
    deletedAt: null,
    status: { $ne: "archived" },
  };

  if (query && query.trim()) {
    const q = query.trim();
    matchStage.$or = [
      { name: { $regex: q, $options: "i" } },
      { shortDescription: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ];
  }

  if (categoryId && Types.ObjectId.isValid(categoryId)) {
    matchStage.categoryId = new Types.ObjectId(categoryId);
  }

  if (brandId && Types.ObjectId.isValid(brandId)) {
    matchStage.brandId = new Types.ObjectId(brandId);
  }

  if (status) {
    matchStage.status = status;
  }

  if (tags && tags.length > 0) {
    matchStage.tags = { $in: tags };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    matchStage.lowestPrice = {};
    if (minPrice !== undefined) (matchStage.lowestPrice as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice !== undefined) (matchStage.lowestPrice as Record<string, number>).$lte = Number(maxPrice);
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  switch (sort) {
    case "price_low":
      sortOption = { lowestPrice: 1 };
      break;
    case "price_high":
      sortOption = { lowestPrice: -1 };
      break;
    case "popular":
      sortOption = { ratingCount: -1 };
      break;
    case "rating":
      sortOption = { ratingAverage: -1 };
      break;
    case "newest":
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const [count, rawProducts] = await Promise.all([
    ProductModel.countDocuments(matchStage).exec(),
    ProductModel.find(matchStage).sort(sortOption).skip(skip).limit(limitNum).lean().exec(),
  ]);

  const rawCats = (await CategoryModel.find({ status: "active" }).lean().exec()) as unknown as CategoryDoc[];
  const rawBrands = (await BrandModel.find({ isActive: true }).lean().exec()) as unknown as BrandDoc[];
  const categoryMap = new Map(rawCats.map((c) => [String(c._id), c]));
  const brandMap = new Map(rawBrands.map((b) => [String(b._id), b]));

  const products = (rawProducts as unknown as ProductDoc[]).map((p) =>
    serializeProduct(p, categoryMap, brandMap)
  );

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      totalPages: Math.ceil(count / limitNum),
    },
  };
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  await connectDB();

  const raw = (await ProductModel.findOne({
    slug,
    deletedAt: null,
    status: { $ne: "archived" },
  })
    .lean()
    .exec()) as unknown as ProductDoc | null;

  if (!raw) return null;

  const [rawCats, rawBrands] = await Promise.all([
    CategoryModel.find({ status: "active" }).lean().exec(),
    BrandModel.find({ isActive: true }).lean().exec(),
  ]);
  const categoryMap = new Map((rawCats as unknown as CategoryDoc[]).map((c) => [String(c._id), c]));
  const brandMap = new Map((rawBrands as unknown as BrandDoc[]).map((b) => [String(b._id), b]));

  return serializeProduct(raw, categoryMap, brandMap);
}

export async function getProductsByIds(ids: string[]): Promise<IProduct[]> {
  await connectDB();

  const objectIds = ids.map((id) => {
    try { return new Types.ObjectId(id); } catch { return null; }
  }).filter(Boolean);

  if (objectIds.length === 0) return [];

  const docs = await ProductModel.find({
    _id: { $in: objectIds },
    deletedAt: null,
    status: { $ne: "archived" },
  }).lean().exec();

  if (docs.length === 0) return [];

  const categoryIds = new Set<string>();
  const brandIds = new Set<string>();
  for (const doc of docs) {
    const p = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
    if (p.categoryId) categoryIds.add(String(p.categoryId));
    if (p.brandId) brandIds.add(String(p.brandId));
  }

  const [categoryDocs, brandDocs] = await Promise.all([
    categoryIds.size > 0 ? CategoryModel.find({ _id: { $in: [...categoryIds] } }).lean().exec() : [],
    brandIds.size > 0 ? BrandModel.find({ _id: { $in: [...brandIds] } }).lean().exec() : [],
  ]);

  const categoryMap = new Map(categoryDocs.map((c) => [String(c._id), c as unknown as CategoryDoc]));
  const brandMap = new Map(brandDocs.map((b) => [String(b._id), b as unknown as BrandDoc]));

  return docs.map((doc) => {
    const plain = JSON.parse(JSON.stringify(doc)) as ProductDoc;
    return serializeProduct(plain, categoryMap, brandMap);
  });
}
