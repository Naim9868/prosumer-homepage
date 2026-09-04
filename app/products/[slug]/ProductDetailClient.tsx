"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import type { IProduct, IProductVariant } from "@/types/product";
import { useCartContext } from "@/app/context/CartContext";
import { useWishlistContext } from "@/app/context/WishlistContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useGuestInfo } from "@/app/context/GuestInfoContext";
import GuestInfoModal from "@/components/GuestInfoModal";
import { formatCurrency, cn } from "@/lib/utils";
import { ApertureMark } from "@/components/shared/layout-primitives";

interface Props {
  product: IProduct;
}

export default function ProductDetailClient({ product }: Props) {
  const { addToCart } = useCartContext();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistContext();
  const { openCartModal } = useCartModalContext();
  const { hasGuestInfo } = useGuestInfo();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const def = product.variants?.find((v: IProductVariant) => v.isDefault) || product.variants?.[0];
    if (!def) return {};
    const attrs: Record<string, string> = {};
    def.attributes?.forEach((a: { key: string; value: string }) => {
      attrs[a.key] = a.value;
    });
    return attrs;
  });
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [pendingAction, setPendingAction] = useState<"addToCart" | "buyNow" | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const selectedVariant = useMemo<IProductVariant | undefined>(() => {
    const variants = product.variants || [];
    if (!variants.length) return undefined;
    const match = variants.find((v: IProductVariant) => v.attributes?.every((a: { key: string; value: string }) => selectedAttributes[a.key] === a.value));
    return match || variants.find((v: IProductVariant) => v.isDefault) || variants[0];
  }, [product.variants, selectedAttributes]);

  const attributeTypes = useMemo(() => {
    if (!product.variants?.length) return [];
    const map = new Map<string, Set<string>>();
    product.variants.forEach((v: IProductVariant) => {
      v.attributes?.forEach((a: { key: string; value: string }) => {
        if (!map.has(a.key)) map.set(a.key, new Set());
        map.get(a.key)!.add(a.value);
      });
    });
    return Array.from(map.entries()).map(([key, values]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      values: Array.from(values),
    }));
  }, [product.variants]);

  const currentPrice = selectedVariant?.price || product.lowestPrice || 0;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const hasDiscount = compareAtPrice && compareAtPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((compareAtPrice! - currentPrice) / compareAtPrice!) * 100) : 0;

  const currentStock = useMemo(() => {
    if (selectedVariant) return selectedVariant.inventory - (selectedVariant.reserved || 0);
    if (product.variants?.length) {
      return product.variants.reduce((sum: number, v: IProductVariant) => sum + (v.inventory || 0), 0);
    }
    return product.totalInventory || product.inventorySummary?.available || 0;
  }, [selectedVariant, product]);

  const isInStock = currentStock > 0 || (product.variants?.length ?? 0) > 0;

  const allImages = useMemo(() => {
    if (selectedVariant?.images?.length) return selectedVariant.images;
    const images: string[] = [];
    product.imageGroups?.forEach((g: { images?: { url: string }[] }) => g.images?.forEach((img: { url: string }) => images.push(img.url)));
    if (images.length === 0 && product.thumbnail) images.push(product.thumbnail);
    return images;
  }, [product, selectedVariant]);

  const brandName = useMemo(() => {
    if (typeof product.brand === "object" && product.brand !== null) {
      return (product.brand as { name: string }).name || "";
    }
    return "";
  }, [product.brand]);

  const categoryName = useMemo(() => {
    if (typeof product.category === "object" && product.category !== null) {
      return (product.category as { name: string }).name || "";
    }
    return "";
  }, [product.category]);

  const isWishlisted = isInWishlist(product._id);

  const addCurrentProductToCart = useCallback(async () => {
    if (!isInStock) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product, selectedVariant, quantity);
      openCartModal();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
      setPendingAction(null);
    }
  }, [product, selectedVariant, quantity, addToCart, openCartModal, isInStock]);

  const buyNow = useCallback(async () => {
    if (!isInStock) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product, selectedVariant, quantity);
      window.location.href = "/checkout";
    } catch (error) {
      console.error("Error buying now:", error);
    } finally {
      setIsAddingToCart(false);
      setPendingAction(null);
    }
  }, [product, selectedVariant, quantity, addToCart, isInStock]);

  const handleAddToCart = () => {
    if (!isInStock) return;
    if (!hasGuestInfo) {
      setPendingAction("addToCart");
      setShowGuestModal(true);
      return;
    }
    addCurrentProductToCart();
  };

  const handleBuyNow = () => {
    if (!isInStock) return;
    buyNow();
  };

  const handleGuestConfirm = async () => {
    setShowGuestModal(false);
    if (pendingAction === "addToCart") {
      await addCurrentProductToCart();
    } else if (pendingAction === "buyNow") {
      await buyNow();
    }
    setPendingAction(null);
  };

  const handleWishlist = () => {
    if (isWishlisted) removeFromWishlist(product._id);
    else addToWishlist(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-8 lg:flex-row lg:gap-12"
    >
      <div className="lg:w-1/2">
        <div className="lg:sticky lg:top-24">
          <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-muted">
            {allImages[selectedImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-foreground-muted">
                <ApertureMark className="h-16 w-16" />
              </div>
            )}
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute right-4 top-4 rounded-full bg-background-elevated/90 p-2.5 shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
            >
              <Heart size={20} className={cn(isWishlisted ? "fill-destructive text-destructive" : "text-foreground")} />
            </button>
            {hasDiscount && (
              <div className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                -{discountPercent}%
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img: string, i: number) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                    selectedImage === i ? "border-primary shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 lg:w-1/2">
        <nav className="flex items-center gap-2 text-xs text-foreground-muted" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="transition-colors hover:text-primary">
            Products
          </Link>
          {categoryName && (
            <>
              <span>/</span>
              <span className="text-foreground">{categoryName}</span>
            </>
          )}
        </nav>

        {brandName && (
          <p className="text-sm font-medium uppercase tracking-wide text-primary">{brandName}</p>
        )}

        <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{product.name}</h1>

        {product.ratingAverage != null && product.ratingAverage > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn("h-4 w-4", i < Math.floor(product.ratingAverage!) ? "text-yellow-400" : "text-muted")}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-foreground-muted">({product.ratingCount} reviews)</span>
          </div>
        )}

        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-heading text-3xl font-bold text-foreground">{formatCurrency(currentPrice)}</span>
          {hasDiscount && (
            <>
              <span className="text-lg text-foreground-muted line-through">{formatCurrency(compareAtPrice!)}</span>
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-sm font-semibold text-success">
                Save {formatCurrency(compareAtPrice! - currentPrice)}
              </span>
            </>
          )}
        </div>

        {isInStock ? (
          <p className="flex items-center gap-1 text-sm font-medium text-success">
            <CheckCircle size={16} />
            In Stock
            {currentStock <= 10 && currentStock > 0 && (
              <span className="ml-2 text-xs text-warning">Only {currentStock} left</span>
            )}
          </p>
        ) : (
          <p className="text-sm font-medium text-destructive">Out of Stock</p>
        )}

        {product.shortDescription && (
          <p className="text-sm leading-relaxed text-foreground-muted">{product.shortDescription}</p>
        )}

        {attributeTypes.map((attr) => (
          <div key={attr.key} className="space-y-3">
            <label className="text-sm font-medium text-foreground">Select {attr.label}</label>
            <div className="flex flex-wrap gap-2">
              {attr.values.map((val) => {
                const isSelected = selectedAttributes[attr.key] === val;
                return (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setSelectedAttributes((p) => ({ ...p, [attr.key]: val }))}
                    className={cn(
                      "rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:border-primary/50"
                    )}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {isInStock && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity((p) => Math.max(1, p - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[40px] text-center text-lg font-semibold text-foreground">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((p) => Math.min(currentStock, p + 1))}
                disabled={quantity >= currentStock}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isInStock || isAddingToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary py-3.5 font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAddingToCart && pendingAction === "addToCart" ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <ShoppingBag size={18} /> Add to Cart
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!isInStock || isAddingToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-secondary py-3.5 font-semibold text-secondary-foreground shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAddingToCart && pendingAction === "buyNow" ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              "Buy Now"
            )}
          </button>
        </div>

        <div className="flex justify-around border-y border-border py-4">
          {[
            { icon: Truck, label: "Free Shipping", desc: "On orders ৳1500+" },
            { icon: RotateCcw, label: "Easy Returns", desc: "30 days return" },
            { icon: Shield, label: "Secure Checkout", desc: "100% secure" },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <item.icon size={20} className="mx-auto mb-1 text-foreground-muted" />
              <p className="text-xs font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-foreground-muted">{item.desc}</p>
            </div>
          ))}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
          >
            {showFullDescription ? "Show Less" : "Read More"} {showFullDescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showFullDescription && (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground-muted">{product.description}</p>
          )}
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {product.tags!.map((tag: string) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground-muted">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {showGuestModal && (
        <GuestInfoModal
          actionType={pendingAction === "buyNow" ? "buyNow" : "addToCart"}
          onClose={() => {
            setShowGuestModal(false);
            setPendingAction(null);
          }}
          onConfirm={handleGuestConfirm}
        />
      )}
    </motion.div>
  );
}
