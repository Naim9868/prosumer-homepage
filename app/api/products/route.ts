import { NextRequest, NextResponse } from "next/server";
import { getProducts, getProductsByIds } from "@/lib/products";
import type { IProductFilters } from "@/types/product";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const ids = sp.get("ids");
    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      const products = await getProductsByIds(idList);
      return NextResponse.json({ success: true, products });
    }

    const filters: IProductFilters = {
      page: sp.get("page") ? Number(sp.get("page")) : 1,
      limit: sp.get("limit") ? Number(sp.get("limit")) : 20,
      query: sp.get("query") || sp.get("search") || undefined,
      categoryId: sp.get("categoryId") || undefined,
      brandId: sp.get("brandId") || undefined,
      minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
      maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
      tags: sp.get("tags")?.split(",").filter(Boolean),
      status: (sp.get("status") as IProductFilters["status"]) || undefined,
      sort: sp.get("sort") || "newest",
    };

    const result = await getProducts(filters);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        products: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      { status: 500 }
    );
  }
}
