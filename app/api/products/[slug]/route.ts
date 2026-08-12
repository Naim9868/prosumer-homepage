import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ success: false, product: null }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ success: false, product: null }, { status: 500 });
  }
}
