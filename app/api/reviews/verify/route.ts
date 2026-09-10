import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { OrderModel } from "@/models/Order";
import { Types } from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { orderId, phone, productId } = body as {
      orderId?: string;
      phone?: string;
      productId: string;
    };

    if (!productId || !Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });
    }

    if (!orderId && !phone) {
      return NextResponse.json(
        { success: false, error: "Provide an order ID or phone number" },
        { status: 400 }
      );
    }

    const query: Record<string, unknown> = {
      "items.productId": new Types.ObjectId(productId),
    };

    if (orderId) {
      query.orderId = orderId.trim();
    } else if (phone) {
      query.guestPhone = phone.trim();
    }

    const order = await OrderModel.findOne(query).lean().exec() as Record<string, unknown> | null;

    if (!order) {
      return NextResponse.json(
        { success: false, error: "No matching order found. Please check your order ID or phone number." },
        { status: 404 }
      );
    }

    const deliveredStatuses = ["DELIVERED", "OUT_FOR_DELIVERY", "IN_TRANSIT", "SHIPPED"];
    if (!deliveredStatuses.includes(order.status as string)) {
      return NextResponse.json(
        { success: false, error: "Order has not been delivered yet. You can review after delivery." },
        { status: 400 }
      );
    }

    const shipping = order.shipping as Record<string, unknown> | undefined;

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        customerName: (shipping?.name as string) || "",
      },
    });
  } catch (error) {
    console.error("Order verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
