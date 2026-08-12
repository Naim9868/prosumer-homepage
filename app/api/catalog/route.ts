import { NextResponse } from "next/server";
import { getCatalogData } from "@/lib/catalog";

export async function GET() {
  try {
    const catalog = await getCatalogData();
    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Failed to load catalog:", error);
    return NextResponse.json({ error: "Failed to load catalog" }, { status: 500 });
  }
}
