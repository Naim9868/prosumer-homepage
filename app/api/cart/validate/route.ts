import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { ProductModel } from "@/models/Product";
import { BrandModel } from "@/models/Brand";
import { CategoryModel } from "@/models/Category";
import { Types } from "mongoose";

interface CartItem {
  productId: string;
  variantKey: string;
  quantity: number;
}

interface VariantDoc {
  sku?: string;
  variantKey?: string;
  attributes?: { key: string; value: string }[];
  price?: number;
  compareAtPrice?: number;
  inventory?: number;
  reserved?: number;
  images?: string[];
  isDefault?: boolean;
}

interface ImageDoc {
  url?: string;
  alt?: string;
}

interface ImageGroupDoc {
  images?: ImageDoc[];
}

interface ProductLeanDoc {
  _id: unknown;
  name: string;
  slug?: string;
  sku?: string;
  thumbnail?: string;
  imageGroups?: ImageGroupDoc[];
  brandId?: unknown;
  categoryId?: unknown;
  lowestPrice?: number;
  highestPrice?: number;
  totalInventory?: number;
  variants?: VariantDoc[];
}

interface CategoryLeanDoc {
  _id: unknown;
  name?: string;
}

interface BrandLeanDoc {
  _id: unknown;
  name?: string;
}

interface ValidatedItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image?: string;
  sku?: string;
  brand?: string;
  category?: string;
  price: {
    original: number;
    sale: number;
  };
  variantKey?: string;
  variantName?: string;
  attributes?: Record<string, string>;
  quantity: number;
  maxQuantity?: number;
  inventory?: number;
  isAvailable: boolean;
  variants?: Array<{
    variantKey: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    inventory: number;
    attributes: Record<string, string>;
    images?: string[];
    isDefault?: boolean;
  }>;
  selectedVariantKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { items, deliveryType }: { items: CartItem[]; deliveryType: string } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "No items to validate" }, { status: 400 });
    }

    if (!deliveryType || !["INSIDE_DHAKA", "OUTSIDE_DHAKA"].includes(deliveryType)) {
      return NextResponse.json({ success: false, error: "Invalid delivery type" }, { status: 400 });
    }

    const validatedItems: ValidatedItem[] = [];
    let subtotal = 0;
    let totalDiscount = 0;
    const productIds: string[] = [];
    const categories: string[] = [];
    const lineTotals: Array<{ productId: string; lineTotal: number }> = [];

    for (const cartItem of items) {
      const { productId, variantKey, quantity } = cartItem;

      if (!productId) {
        return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
      }

      if (!quantity || quantity < 1) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity for product ${productId}` },
          { status: 400 }
        );
      }

      if (!Types.ObjectId.isValid(productId)) {
        return NextResponse.json(
          { success: false, error: `Invalid product ID format: ${productId}` },
          { status: 400 }
        );
      }

      const objectId = new Types.ObjectId(productId);

      const productRaw = await ProductModel.findOne({
        _id: objectId,
        deletedAt: null,
        status: "active",
      })
        .lean()
        .exec();

      if (!productRaw) {
        return NextResponse.json(
          {
            success: false,
            error: `Product not found or unavailable`,
            data: { productId, productName: "Unknown Product" },
          },
          { status: 404 }
        );
      }

      const product: ProductLeanDoc = productRaw as unknown as ProductLeanDoc;

      let variant: VariantDoc | null = null;
      let variantIndex = -1;

      if (variantKey && product.variants && product.variants.length > 0) {
        variantIndex = product.variants.findIndex((v) => v.variantKey === variantKey);
        if (variantIndex !== -1) {
          variant = product.variants[variantIndex];
        }
      }

      if (!variant && product.variants && product.variants.length > 0) {
        const defaultVariant = product.variants.find((v) => v.isDefault);
        variant = defaultVariant || product.variants[0];
        variantIndex = product.variants.indexOf(variant);
      }

      const availableStock = variant?.inventory || product.totalInventory || 0;
      const reserved = variant?.reserved || 0;
      const available = Math.max(0, availableStock - reserved);

      if (available < quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${product.name}`,
            data: {
              available,
              requested: quantity,
              productName: product.name,
              productId: String(product._id),
            },
          },
          { status: 400 }
        );
      }

      const salePrice = variant?.price || product.lowestPrice || 0;
      const originalPrice = variant?.compareAtPrice || product.highestPrice || salePrice;
      const itemTotal = salePrice * quantity;
      const discount = Math.max(0, (originalPrice - salePrice) * quantity);

      subtotal += itemTotal;
      totalDiscount += discount;
      productIds.push(String(product._id));
      lineTotals.push({ productId: String(product._id), lineTotal: itemTotal });

      let categoryName = "";
      if (product.categoryId) {
        try {
          const category = await CategoryModel.findById(product.categoryId).lean().exec();
          categoryName = (category as unknown as CategoryLeanDoc | null)?.name || "";
          if (categoryName) {
            categories.push(categoryName);
          }
        } catch (e) {
          console.error("Error fetching category:", e);
        }
      }

      let image = product.thumbnail || "";
      const imageGroups = product.imageGroups || [];
      if (!image && imageGroups.length > 0) {
        const firstGroup = imageGroups[0];
        if (firstGroup.images?.length) {
          image = firstGroup.images[0].url || "";
        }
      }

      let brandName = "";
      if (product.brandId) {
        try {
          const brand = await BrandModel.findById(product.brandId).lean().exec();
          brandName = (brand as unknown as BrandLeanDoc | null)?.name || "";
        } catch (e) {
          console.error("Error fetching brand:", e);
        }
      }

      let variantAttributes: Record<string, string> = {};
      let variantName = "";
      if (variant?.attributes && Array.isArray(variant.attributes)) {
        variantAttributes = variant.attributes.reduce((acc: Record<string, string>, a) => {
          acc[a.key] = a.value;
          return acc;
        }, {});
        variantName = variant.attributes.map((a) => a.value).join(" - ");
      }

      const compositeId = `${productId}-${variantKey || "default"}`;
      const validatedItem: ValidatedItem = {
        id: compositeId,
        productId: String(product._id),
        name: product.name,
        slug: product.slug || "",
        image: image || undefined,
        sku: variant?.sku || product.sku || "",
        brand: brandName || undefined,
        category: categoryName || undefined,
        price: {
          original: originalPrice,
          sale: salePrice,
        },
        variantKey: variant?.variantKey || "default",
        variantName: variantName || "",
        attributes: variantAttributes,
        quantity: quantity,
        maxQuantity: available,
        inventory: available,
        isAvailable: true,
        selectedVariantKey: variant?.variantKey || "default",
        variants: product.variants?.map((v) => ({
          variantKey: v.variantKey || "default",
          sku: v.sku || "",
          price: v.price || 0,
          compareAtPrice: v.compareAtPrice || undefined,
          inventory: Math.max(0, (v.inventory || 0) - (v.reserved || 0)),
          attributes: v.attributes?.reduce((acc: Record<string, string>, a) => {
            acc[a.key] = a.value;
            return acc;
          }, {}) || {},
          images: v.images || [],
          isDefault: v.isDefault || false,
        })) || [],
      };

      validatedItems.push(validatedItem);
    }

    const deliveryCharge = deliveryType === "INSIDE_DHAKA" ? 60 : 120;
    const finalDeliveryCharge = subtotal >= 5000 ? 0 : deliveryCharge;
    const finalTotal = subtotal - totalDiscount + finalDeliveryCharge;

    return NextResponse.json({
      success: true,
      data: {
        items: validatedItems,
        summary: {
          subtotal,
          totalDiscount,
          deliveryCharge: finalDeliveryCharge,
          total: finalTotal,
          currency: "BDT",
        },
        status: "valid",
        message: "Cart validated successfully",
      },
    });
  } catch (error) {
    console.error("Cart validation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to validate cart",
      },
      { status: 500 }
    );
  }
}
