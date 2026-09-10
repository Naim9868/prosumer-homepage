import "server-only";
import { connectDB } from "@/lib/dbConnect";
import { ReviewModel } from "@/models/Review";
import { ProductModel } from "@/models/Product";
import { Types } from "mongoose";
import type { ProductReview } from "@/types/review";

export type { ProductReview };

export async function getReviewsByProductId(productId: string): Promise<ProductReview[]> {
  await connectDB();

  if (!Types.ObjectId.isValid(productId)) return [];

  const docs = await ReviewModel.find({
    productId: new Types.ObjectId(productId),
    status: "approved",
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return docs.map((d) => {
    // Support both old `image` (singular) and new `images` (array) fields
    const images: string[] = Array.isArray(d.images)
      ? d.images.map(String)
      : d.image
        ? [String(d.image)]
        : [];

    return {
      _id: String(d._id),
      name: String(d.name || ""),
      rating: Number(d.rating || 0),
      title: d.title ? String(d.title) : undefined,
      comment: String(d.comment || ""),
      images: images.length > 0 ? images : undefined,
      avatar: d.avatar ? String(d.avatar) : undefined,
      isVerifiedPurchase: Boolean(d.isVerifiedPurchase),
      createdAt: d.createdAt ? String(d.createdAt) : "",
    };
  });
}

export async function createReview(data: {
  productId: string;
  orderId?: string;
  name: string;
  email?: string;
  phone?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  avatar?: string;
}): Promise<ProductReview> {
  await connectDB();

  const review = await ReviewModel.create({
    productId: new Types.ObjectId(data.productId),
    orderId: data.orderId ? new Types.ObjectId(data.orderId) : undefined,
    name: data.name,
    email: data.email,
    phone: data.phone,
    rating: data.rating,
    title: data.title,
    comment: data.comment,
    images: data.images?.slice(0, 3) ?? [],
    avatar: data.avatar,
    isVerifiedPurchase: !!data.orderId,
    status: "approved",
    source: "customer",
  });

  // Update product rating aggregates
  await updateProductRating(data.productId);

  const doc = review.toObject();
  return {
    _id: String(doc._id),
    name: String(doc.name || ""),
    rating: Number(doc.rating || 0),
    title: doc.title ? String(doc.title) : undefined,
    comment: String(doc.comment || ""),
    images: Array.isArray(doc.images) ? doc.images.map(String) : undefined,
    avatar: doc.avatar ? String(doc.avatar) : undefined,
    isVerifiedPurchase: Boolean(doc.isVerifiedPurchase),
    createdAt: doc.createdAt ? String(doc.createdAt) : "",
  };
}

async function updateProductRating(productId: string) {
  if (!Types.ObjectId.isValid(productId)) return;

  const result = await ReviewModel.aggregate([
    { $match: { productId: new Types.ObjectId(productId), status: "approved" } },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = result[0] ?? { avg: 0, count: 0 };

  await ProductModel.updateOne(
    { _id: new Types.ObjectId(productId) },
    {
      $set: {
        ratingAverage: Math.round(stats.avg * 10) / 10,
        ratingCount: stats.count,
      },
    }
  );
}
