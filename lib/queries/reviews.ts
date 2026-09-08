import "server-only";
import { connectDB } from "@/lib/dbConnect";
import { ReviewModel } from "@/models/Review";
import { Types } from "mongoose";

export interface ProductReview {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  image?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

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

  return docs.map((d) => ({
    _id: String(d._id),
    name: String(d.name || ""),
    rating: Number(d.rating || 0),
    comment: String(d.comment || ""),
    image: d.image ? String(d.image) : undefined,
    isVerifiedPurchase: Boolean(d.isVerifiedPurchase),
    createdAt: d.createdAt ? String(d.createdAt) : "",
  }));
}
