import { NextResponse } from "next/server";
import { readHomepageConfig } from "@/lib/homepage-store";

export async function GET() {
  try {
    const config = await readHomepageConfig();
    return NextResponse.json({ success: true, page: config.page });
  } catch (error) {
    console.error("Error fetching homepage config:", error);
    return NextResponse.json({ success: false, page: null }, { status: 500 });
  }
}
