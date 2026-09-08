"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Eye, Zap, AlertCircle, CheckCircle, ShoppingCart, Package, Star } from "lucide-react";
import type { IProduct, IProductVariant, ProductBadge } from "@/types/product";
import type { CatalogProduct } from "@/types/catalog";
import type { CartProductInput } from "@/lib/cart-item";
import { catalogToIProduct, getProductId, getProductName, getProductSlug, getProductImage } from "@/lib/cart-item";
import { useCartContext } from "@/app/context/CartContext";
import { useWishlistContext } from "@/app/context/WishlistContext";
import { useProductDrawer } from "@/app/context/ProductDrawerContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useGuestInfo } from "@/app/context/GuestInfoContext";
import GuestInfoModal from "@/components/GuestInfoModal";
import BuyNowButton from "@/components/product/BuyNowButton";
import { formatCurrency, cn } from "@/lib/utils";

interface ProductCardProps {
  product: CartProductInput;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const { addToCart } = useCartContext();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistContext();
  const { openDrawer } = useProductDrawer();
  const { openCartModal } = useCartModalContext();
  const { hasGuestInfo } = useGuestInfo();

  const richProduct = useMemo<IProduct>(() => {
    if ((product as IProduct)._id) return product as IProduct;
    return catalogToIProduct(product as CatalogProduct);
  }, [product]);


  const productId = getProductId(product);
  const slug = getProductSlug(product);
  const name = getProductName(product);
  const isWishlisted = isInWishlist(productId);

  const defaultVariant = useMemo<IProductVariant | undefined>(() => {
    if (!richProduct.variants?.length) return undefined;
    return richProduct.variants.find((v: IProductVariant) => v.isDefault === true) || richProduct.variants[0];
  }, [richProduct.variants]);

  const availableStock = useMemo(() => {
    if (richProduct.inventorySummary?.available !== undefined && richProduct.inventorySummary.available > 0) {
      return richProduct.inventorySummary.available;
    }
    if (richProduct.totalInventory !== undefined && richProduct.totalInventory > 0) {
      return richProduct.totalInventory;
    }
    if (richProduct.variants && richProduct.variants.length > 0) {
      const totalStock = richProduct.variants.reduce((sum: number, variant: IProductVariant) => sum + (variant.inventory !== undefined ? variant.inventory : 0), 0);
      if (totalStock > 0) return totalStock;
    }
    return 0;
  }, [richProduct.inventorySummary, richProduct.totalInventory, richProduct.variants]);

  const discountPercentage = useMemo(() => {
    if (defaultVariant?.compareAtPrice && defaultVariant.compareAtPrice > defaultVariant.price) {
      return Math.round(((defaultVariant.compareAtPrice - defaultVariant.price) / defaultVariant.compareAtPrice) * 100);
    }
    return 0;
  }, [defaultVariant]);

  const hasDiscount = discountPercentage > 0;

  const { currentPrice, originalPrice } = useMemo(() => {
    if (defaultVariant) {
      return {
        currentPrice: defaultVariant.price,
        originalPrice: defaultVariant.compareAtPrice || defaultVariant.price,
      };
    }
    const flat = product as CatalogProduct;
    const price = flat.price ?? richProduct.lowestPrice ?? 0;
    return {
      currentPrice: price,
      originalPrice: flat.compareAtPrice || price,
    };
  }, [defaultVariant, product, richProduct.lowestPrice]);

  const stockStatus = useMemo(() => {
    const isActive = richProduct.status === "active" || richProduct.status === "draft";
    const hasStock = availableStock > 0;
    const isNotDeleted = !richProduct.deletedAt;
    const isInStock = isActive && hasStock && isNotDeleted;
    const lowStockThreshold = richProduct.inventorySummary?.lowStockThreshold || 5;
    const isLowStock = isInStock && availableStock <= lowStockThreshold;

    return {
      isInStock,
      isLowStock,
      text: !isInStock ? "Out of Stock" : isLowStock ? `Only ${availableStock} left` : "In Stock",
      color: !isInStock
        ? "text-destructive"
        : isLowStock
          ? "text-warning"
          : "text-success",
      icon: !isInStock || isLowStock ? AlertCircle : CheckCircle,
    };
  }, [richProduct.status, availableStock, richProduct.deletedAt, richProduct.inventorySummary]);

  const productImage = useMemo(() => {
    if (imageError) return null;
    return getProductImage(product) || null;
  }, [product, imageError]);

  const brandName = useMemo(() => {
    if (richProduct.brand && typeof richProduct.brand === "object") {
      return richProduct.brand.name || "";
    }
    return "";
  }, [richProduct.brand]);

  const categoryName = useMemo(() => {
    if (richProduct.category && typeof richProduct.category === "object") {
      return richProduct.category.name || "";
    }
    return (product as CatalogProduct).category || "";
  }, [richProduct.category, product]);

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) return;
      openDrawer(richProduct);
    },
    [richProduct, openDrawer]
  );

  const addCurrentProductToCart = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(richProduct, defaultVariant, 1);
      openCartModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [richProduct, defaultVariant, addToCart, openCartModal]);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!stockStatus.isInStock) return;
      if (!hasGuestInfo) {
        setShowGuestModal(true);
        return;
      }
      addCurrentProductToCart();
    },
    [stockStatus.isInStock, hasGuestInfo, addCurrentProductToCart]
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isWishlisted) {
        removeFromWishlist(productId);
      } else {
        addToWishlist(richProduct, defaultVariant);
      }
    },
    [isWishlisted, productId, richProduct, defaultVariant, removeFromWishlist, addToWishlist]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openDrawer(richProduct);
    },
    [richProduct, openDrawer]
  );

  const StockIcon = stockStatus.icon;
  const variantCount = richProduct.variants?.length || 0;

  const renderStars = useCallback(() => {
    const avg = richProduct.ratingAverage ?? 0;
    const fullStars = Math.floor(avg);
    const hasHalfStar = avg % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative h-3 w-3">
            <Star className="absolute h-3 w-3 text-muted" />
            <div className="absolute w-1.5 overflow-hidden">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-3 w-3 text-muted" />
        ))}
        {(richProduct.ratingCount ?? 0) > 0 && (
          <span className="ml-1 text-xs text-foreground-muted">({richProduct.ratingCount})</span>
        )}
      </div>
    );
  }, [richProduct.ratingAverage, richProduct.ratingCount]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
        className="group relative overflow-hidden rounded-[var(--radius-rdm)] border border-border bg-card transition-all duration-500 hover:border-primary/40 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        role="article"
        aria-label={`Product: ${name}`}
      >
        <div className="relative overflow-hidden bg-muted">
          <div className="relative aspect-square">
            {productImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productImage}
                alt={name}
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-foreground-muted">
                <Package className="h-16 w-16 opacity-30" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {hasDiscount && (
              <div className="absolute right-2 top-2 z-10 rounded-full bg-gradient-to-r from-destructive to-destructive/90 px-2 py-1 text-[11px] font-bold text-white shadow-lg md:right-3 md:top-3">
                -{discountPercentage}%
              </div>
            )}

            <button
              type="button"
              onClick={handleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute left-2 top-2 z-10 rounded-full bg-background-elevated/80 p-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 md:left-3 md:top-3"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isWishlisted ? "fill-destructive text-destructive" : "text-foreground"
                )}
              />
            </button>

            <button
              type="button"
              onClick={handleQuickView}
              aria-label="Quick view"
              className="absolute left-12 top-2 z-10 rounded-full bg-background-elevated/80 p-2 shadow-lg backdrop-blur-sm transition-all duration-300 opacity-0 hover:scale-110 group-hover:opacity-100 md:left-14 md:top-3"
            >
              <Eye className="h-4 w-4 text-foreground" />
            </button>

            {!stockStatus.isInStock && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="-rotate-6 rounded-full border-2 border-destructive bg-card px-6 py-3 text-sm font-bold text-foreground shadow-2xl">
                  Out of Stock
                </div>
              </div>
            )}

            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 transition-all duration-500",
                isHovered && stockStatus.isInStock ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              )}
            >
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !stockStatus.isInStock}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed md:text-xs"
                >
                  {isAddingToCart ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Add to Cart
                    </>
                  )}
                </button>

                <BuyNowButton
                  product={richProduct}
                  variant={defaultVariant}
                  showModal
                  className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-secondary py-2.5 text-xs font-semibold text-secondary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed md:text-xs"
                >
                  Buy Now
                </BuyNowButton>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1 p-4">
          <div className="flex items-center justify-between gap-2">
            {brandName ? (
              <Link
                href={`/products/${slug}`}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-foreground-muted transition-colors hover:text-primary"
              >
                {brandName}
              </Link>
            ) : (
              <span className="text-[10px] text-foreground-muted uppercase tracking-wider">{categoryName || "Lens"}</span>
            )}

            {categoryName && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[8px] font-medium uppercase tracking-wider text-foreground-muted">
                {categoryName}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {richProduct.ratingAverage && richProduct.ratingAverage > 0 ? renderStars() : <span />}
          </div>

          <Link href={`/products/${slug}`} onClick={(e) => e.stopPropagation()} className="block group/title">
            <h3 className="line-clamp-2 font-heading text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover/title:text-primary md:text-sm">
              {name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-heading text-[15px] font-bold tracking-tight text-foreground md:text-lg">
              {formatCurrency(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-foreground-muted line-through md:text-sm">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          {variantCount > 1 && (
            <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
              <Zap size={10} className="text-primary" />
              <span>{variantCount} variants</span>
              {richProduct.highestPrice && richProduct.lowestPrice != null && richProduct.highestPrice > richProduct.lowestPrice && (
                <>
                  <span className="mx-1">•</span>
                  <span>From {formatCurrency(richProduct.lowestPrice!)}</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {richProduct.badges && richProduct.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {richProduct.badges.slice(0, 2).map((badge: ProductBadge, badgeIndex: number) => (
                  <span
                    key={badge.id || badgeIndex}
                    className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-medium text-primary"
                  >
                    {badge.label}
                  </span>
                ))}
                {richProduct.badges.length > 2 && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-foreground-muted">
                    +{richProduct.badges.length - 2}
                  </span>
                )}
              </div>
            )}

            {stockStatus.isInStock && (
              <div className="inline-flex items-center gap-1">
                <StockIcon size={9} className={stockStatus.color} />
                <span className={cn("text-[9px] font-medium", stockStatus.color)}>{stockStatus.text}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showGuestModal && (
        <GuestInfoModal
          onClose={() => setShowGuestModal(false)}
          onConfirm={async () => {
            setShowGuestModal(false);
            await addCurrentProductToCart();
          }}
        />
      )}
    </>
  );
}
