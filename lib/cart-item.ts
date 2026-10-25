import type { OrderItem, ProductVariant } from "@/types/checkout";
import type { CatalogProduct } from "@/types/catalog";
import type { IProduct, IProductVariant, ImageGroupType } from "@/types/product";

export function catalogToIProduct(product: CatalogProduct): IProduct {
  // Use variants from catalog if available (including attributes)
  if (product.variants && product.variants.length > 0) {
    const variants = product.variants.map((v) => ({
      sku: v.sku || product.id,
      variantKey: v.variantKey || "default",
      attributes: v.attributes || [],
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      inventory: v.inventory,
      reserved: 0,
      images: v.images?.length ? v.images : (product.images?.length ? product.images : [product.image]),
      isDefault: v.isDefault ?? false,
      status: v.status || "in_stock",
    }));

    const totalInventory = variants.reduce((sum, v) => sum + v.inventory, 0);
    const defaultVariant = variants.find(v => v.isDefault) || variants[0];
    const prices = variants.map(v => v.price);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);

    return {
      _id: product.id,
      name: product.name,
      slug: product.slug,
      description: "",
      shortDescription: "",
      brandId: product.brandId || product.categoryId,
      brand: product.brand
        ? { _id: product.brandId || "", name: product.brand, slug: product.brandSlug || "" }
        : null,
      categoryId: product.categoryId,
      category: { _id: product.categoryId, name: product.category, slug: product.categorySlug },
      variants,
      imageGroups: [
        {
          type: "product" as ImageGroupType,
          title: "default",
          images: (product.images?.length ? product.images : [product.image]).filter(Boolean).map((url) => ({ url })),
        },
      ],
      thumbnail: product.image,
      tags: [],
      badges: product.badge ? [{ label: product.badge }] : [],
      featured: product.featured,
      inventorySummary: { available: totalInventory, reserved: 0, incoming: 0, lowStockThreshold: 5 },
      lowestPrice,
      highestPrice: highestPrice > lowestPrice ? highestPrice : undefined,
      totalInventory,
      ratingAverage: product.rating,
      ratingCount: product.reviewCount,
      status: totalInventory > 0 ? "active" : "draft",
      deletedAt: null,
      createdAt: product.createdAt,
      updatedAt: product.createdAt,
    };
  }

  // Fallback for products without variants in catalog
  const inventory = product.stock === "in-stock" ? 99 : product.stock === "low-stock" ? 5 : 0;
  const price = product.price || 0;
  return {
    _id: product.id,
    name: product.name,
    slug: product.slug,
    description: "",
    shortDescription: "",
    brandId: product.brandId || product.categoryId,
    brand: product.brand
      ? { _id: product.brandId || "", name: product.brand, slug: product.brandSlug || "" }
      : null,
    categoryId: product.categoryId,
    category: { _id: product.categoryId, name: product.category, slug: product.categorySlug },
    variants: [
      {
        sku: product.id,
        variantKey: "default",
        attributes: [],
        price,
        compareAtPrice: product.compareAtPrice,
        inventory,
        images: product.images?.length ? product.images : [product.image],
        isDefault: true,
        status: inventory > 0 ? "in_stock" : "out_of_stock",
      },
    ],
    imageGroups: [
      {
        type: "product" as ImageGroupType,
        title: "default",
        images: (product.images?.length ? product.images : [product.image]).filter(Boolean).map((url) => ({ url })),
      },
    ],
    thumbnail: product.image,
    tags: [],
    badges: product.badge ? [{ label: product.badge }] : [],
    featured: product.featured,
    inventorySummary: { available: inventory, reserved: 0, incoming: 0, lowStockThreshold: 5 },
    lowestPrice: price,
    highestPrice: product.compareAtPrice && product.compareAtPrice > price ? product.compareAtPrice : price,
    totalInventory: inventory,
    ratingAverage: product.rating,
    ratingCount: product.reviewCount,
    status: inventory > 0 ? "active" : "draft",
    deletedAt: null,
    createdAt: product.createdAt,
    updatedAt: product.createdAt,
  };
}

export type CartProductInput = CatalogProduct | IProduct;

export function getProductId(product: CartProductInput): string {
  return (product as IProduct)._id || (product as CatalogProduct).id || "";
}

export function getProductSlug(product: CartProductInput): string {
  return (product as IProduct).slug || (product as CatalogProduct).slug || "";
}

export function getProductName(product: CartProductInput): string {
  return product.name;
}

export function getProductImage(product: CartProductInput): string {
  if ((product as IProduct).thumbnail) return (product as IProduct).thumbnail!;
  if ((product as IProduct).imageGroups && (product as IProduct).imageGroups!.length > 0) {
    const firstGroup = (product as IProduct).imageGroups![0];
    if (firstGroup.images && firstGroup.images.length > 0) {
      return firstGroup.images[0].url;
    }
  }
  return (product as CatalogProduct).image || "";
}

export function getProductCategory(product: CartProductInput): string {
  const cat = (product as IProduct).category;
  if (cat && typeof cat === "object") return cat.name || "";
  return (product as CatalogProduct).category || "";
}

export function getProductGradient(product: CartProductInput): string {
  return (product as CatalogProduct).gradient || "";
}

export function toProductVariant(variant?: IProductVariant): ProductVariant | undefined {
  if (!variant) return undefined;
  const attributes: Record<string, string> = {};
  (variant.attributes || []).forEach((a: { key: string; value: string }) => {
    attributes[a.key] = a.value;
  });
  return {
    variantKey: variant.variantKey || "",
    sku: variant.sku,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    inventory: variant.inventory - (variant.reserved || 0),
    attributes,
    images: variant.images || [],
    isDefault: variant.isDefault,
  };
}

export function buildCartItem(
  product: CartProductInput,
  variant?: IProductVariant | ProductVariant | undefined,
  quantity: number = 1
): OrderItem {
  const productId = getProductId(product);
  const productImage = getProductImage(product);

  let salePrice = 0;
  let originalPrice = 0;
  let variantKey = "default";
  let variantName = "";
  let sku = "";
  let attributes: Record<string, string> | undefined;

  if (variant) {
    const v = variant as IProductVariant;
    const hasAttributes = Array.isArray(v.attributes);
    const pv: ProductVariant = {
      variantKey: v.variantKey || "",
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      inventory: v.inventory - (v.reserved || 0),
      attributes: hasAttributes
        ? v.attributes.reduce((acc: Record<string, string>, a: { key: string; value: string }) => ({ ...acc, [a.key]: a.value }), {} as Record<string, string>)
        : (v as unknown as ProductVariant).attributes || {},
      images: Array.isArray(v.images) ? v.images : (v as unknown as ProductVariant).images || [],
      isDefault: v.isDefault,
    };
    salePrice = v.price;
    originalPrice = v.compareAtPrice || v.price;
    variantKey = v.variantKey || "";
    sku = v.sku || "";
    variantName = hasAttributes ? v.attributes.map((a: { key: string; value: string }) => a.value).join(" - ") : "";
    attributes = pv.attributes;
  } else {
    const flat = product as CatalogProduct;
    salePrice = flat.price || 0;
    originalPrice = flat.compareAtPrice || flat.price || 0;
  }

  const cartItemId = `${productId}-${variantKey}`;

  return {
    id: cartItemId,
    productId,
    name: product.name,
    slug: getProductSlug(product),
    image: productImage,
    sku: sku || undefined,
    brand:
      (product as IProduct).brand && typeof (product as IProduct).brand === "object"
        ? (product as IProduct).brand!.name
        : undefined,
    category: getProductCategory(product),
    gradient: getProductGradient(product),
    price: {
      original: originalPrice,
      sale: salePrice,
    },
    variantKey,
    variantName,
    attributes,
    quantity,
    maxQuantity: variant
      ? Math.max(0, (variant.inventory || 0) - ((variant as IProductVariant).reserved || 0))
      : (product as CatalogProduct).stock === "in-stock"
        ? 99
        : (product as CatalogProduct).stock === "low-stock"
          ? 5
          : 0,
    inventory: variant ? Math.max(0, (variant.inventory || 0) - ((variant as IProductVariant).reserved || 0)) : undefined,
    variants: (product as IProduct).variants?.map(toProductVariant).filter(Boolean) as ProductVariant[] | undefined,
    selectedVariantKey: variant?.variantKey,
  };
}
