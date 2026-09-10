import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { ReviewModel } from "@/models/Review";
import { ProductModel } from "@/models/Product";
import { OrderModel } from "@/models/Order";
import { Types } from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { productId, orderId, name, phone, rating, title, comment, images } = body as {
      productId: string;
      orderId?: string;
      name: string;
      phone?: string;
      rating: number;
      title?: string;
      comment: string;
      images?: string[];
    };

    if (!productId || !Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product" }, { status: 400 });
    }

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (!comment?.trim()) {
      return NextResponse.json({ success: false, error: "Review comment is required" }, { status: 400 });
    }

    let isVerified = false;
    let orderIdRef: Types.ObjectId | undefined;

    if (orderId) {
      const order = await OrderModel.findOne({
        orderId: orderId.trim(),
        "items.productId": new Types.ObjectId(productId),
      }).lean().exec() as Record<string, unknown> | null;

      if (order) {
        isVerified = true;
        orderIdRef = new Types.ObjectId(String(order._id));
      }
    }

    const review = await ReviewModel.create({
      productId: new Types.ObjectId(productId),
      orderId: orderIdRef,
      name: name.trim(),
      phone: phone?.trim(),
      rating,
      title: title?.trim() || undefined,
      comment: comment.trim(),
      images: (images ?? []).slice(0, 3),
      isVerifiedPurchase: isVerified,
      status: "approved",
      source: "customer",
    });

    // Update product rating aggregates
    const result = await ReviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(productId), status: "approved" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const stats = result[0] ?? { avg: 0, count: 0 };
    await ProductModel.updateOne(
      { _id: new Types.ObjectId(productId) },
      { $set: { ratingAverage: Math.round(stats.avg * 10) / 10, ratingCount: stats.count } }
    );

    const doc = review.toObject();
    return NextResponse.json({
      success: true,
      review: {
        _id: String(doc._id),
        name: String(doc.name),
        rating: Number(doc.rating),
        title: doc.title ? String(doc.title) : undefined,
        comment: String(doc.comment),
        images: Array.isArray(doc.images) ? doc.images.map(String) : [],
        isVerifiedPurchase: Boolean(doc.isVerifiedPurchase),
        createdAt: String(doc.createdAt),
      },
    });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId || !Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });
    }

    const docs = await ReviewModel.find({
      productId: new Types.ObjectId(productId),
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const reviews = docs.map((d) => {
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
        images: images.length > 0 ? images : [],
        avatar: d.avatar ? String(d.avatar) : undefined,
        isVerifiedPurchase: Boolean(d.isVerifiedPurchase),
        createdAt: d.createdAt ? String(d.createdAt) : "",
      };
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
