import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Coupon removed successfully",
    });
  } catch (error) {
    console.error("Remove coupon error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to remove coupon" },
      { status: 500 }
    );
  }
}
