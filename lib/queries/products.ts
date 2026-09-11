import "server-only";
import { connectDB } from "@/lib/dbConnect";
import "@/models/index";
import { ProductModel } from "@/models/Product";
import type { Product } from "@/models/Product";

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await connectDB();

  const doc = await ProductModel.findOne({ slug, deletedAt: null, status: { $ne: "archived" } })
    .populate("brandId", "name slug logo")
    .populate("categoryId", "name slug")
    .populate("subcategoryId", "name slug")
    .lean()
    .exec();

  if (!doc) return null;

  const p = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;

  const product: Product = {
    _id: String(p._id),
    name: String(p.name || ""),
    slug: String(p.slug || ""),
    description: p.description ? String(p.description) : undefined,
    shortDescription: p.shortDescription ? String(p.shortDescription) : undefined,
    brandId: p.brandId as Product["brandId"],
    categoryId: p.categoryId as Product["categoryId"],
    subcategoryId: p.subcategoryId as Product["subcategoryId"],
    specificationGroups: Array.isArray(p.specificationGroups) ? (p.specificationGroups as Product["specificationGroups"]) : undefined,
    specsFlat: Array.isArray(p.specsFlat) ? (p.specsFlat as Product["specsFlat"]) : undefined,
    variants: Array.isArray(p.variants) ? (p.variants as Product["variants"]) : [],
    imageGroups: Array.isArray(p.imageGroups) ? (p.imageGroups as Product["imageGroups"]) : undefined,
    thumbnail: p.thumbnail ? String(p.thumbnail) : undefined,
    videos: Array.isArray(p.videos) ? (p.videos as Product["videos"]) : undefined,
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : undefined,
    inventorySummary: p.inventorySummary as Product["inventorySummary"],
    relatedProducts: Array.isArray(p.relatedProducts)
      ? (p.relatedProducts as unknown as Array<Record<string, unknown>>).map((rp) => ({
          _id: String(rp._id),
          slug: String(rp.slug || ""),
          name: String(rp.name || ""),
          thumbnail: String(rp.thumbnail || ""),
          lowestPrice: typeof rp.lowestPrice === "number" ? rp.lowestPrice : undefined,
          highestPrice: typeof rp.highestPrice === "number" ? rp.highestPrice : undefined,
          ratingAverage: typeof rp.ratingAverage === "number" ? rp.ratingAverage : undefined,
          ratingCount: typeof rp.ratingCount === "number" ? rp.ratingCount : undefined,
        }))
      : undefined,
    featured: Boolean(p.featured),
    badges: Array.isArray(p.badges) ? (p.badges as Product["badges"]) : undefined,
    ratingAverage: typeof p.ratingAverage === "number" ? p.ratingAverage : undefined,
    ratingCount: typeof p.ratingCount === "number" ? p.ratingCount : undefined,
    lowestPrice: typeof p.lowestPrice === "number" ? p.lowestPrice : undefined,
    highestPrice: typeof p.highestPrice === "number" ? p.highestPrice : undefined,
    totalInventory: typeof p.totalInventory === "number" ? p.totalInventory : undefined,
    status: p.status ? String(p.status) : undefined,
    seo: p.seo as Product["seo"],
  };

  return product;
}
