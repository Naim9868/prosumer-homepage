"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Truck, Shield, RotateCcw, Heart, ChevronDown, ChevronUp, CheckCircle, Package, Clock, Star, Award, Zap } from "lucide-react";
import { useProductDrawer } from "@/app/context/ProductDrawerContext";
import { useCartContext } from "@/app/context/CartContext";
import { useWishlistContext } from "@/app/context/WishlistContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useGuestInfo } from "@/app/context/GuestInfoContext";
import GuestInfoModal from "@/components/GuestInfoModal";
import type { IProduct, IProductVariant } from "@/types/product";
import type { TrustBadge } from "@/types/homepage";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";
import { formatCurrency } from "@/lib/utils";
import { ApertureMark } from "@/components/shared/layout-primitives";
import { ProductSpecifications } from "./sections/ProductSpecifications";
import { ShareButton } from "./ui/ShareButton";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Truck, Shield, RotateCcw, Package, Clock, Star, Award, Zap, CheckCircle,
};

export default function ProductDrawer() {
  const { product, isOpen, closeDrawer } = useProductDrawer();
  const { addToCart } = useCartContext();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistContext();
  const { openCartModal } = useCartModalContext();
  const { hasGuestInfo } = useGuestInfo();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | undefined>(undefined);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [pendingAction, setPendingAction] = useState<"addToCart" | "buyNow" | null>(null);
  const [fullProduct, setFullProduct] = useState<IProduct | null>(null);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>(DEFAULT_PAGE_SETTINGS.trustBadges.badges);

  useEffect(() => {
    if (!isOpen || !product?.slug) {
      setFullProduct(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/products/${product.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && data.product) {
          setFullProduct(data.product);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isOpen, product?.slug]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.page?.trustBadges?.badges?.length) {
          setTrustBadges(data.page.trustBadges.badges);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isOpen]);

  const displayProduct = fullProduct || product;

  const productVariants = product?.variants;
  const attributeTypes = useMemo(() => {
    if (!productVariants?.length) return [];
    const map = new Map<string, Set<string>>();
    productVariants.forEach((v: { attributes?: { key: string; value: string }[] }) => {
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
  }, [productVariants]);

  const currentPrice = selectedVariant?.price || product?.lowestPrice || 0;
  const compareAtPriceDefault = useMemo(() => {
    if (!product) return 0;
    if (product.variants?.length) {
      const def = product.variants.find((v) => v.isDefault) || product.variants[0];
      return def?.compareAtPrice || 0;
    }
    return 0;
  }, [product]);
  const compareAtPrice = selectedVariant?.compareAtPrice || compareAtPriceDefault;
  const hasDiscount = compareAtPrice && compareAtPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((compareAtPrice! - currentPrice) / compareAtPrice!) * 100) : 0;

  const currentStock = useMemo(() => {
    if (selectedVariant) return selectedVariant.inventory - (selectedVariant.reserved || 0);
    if (product?.variants?.length) {
      return product.variants.reduce((sum: number, v: { inventory?: number }) => sum + (v.inventory || 0), 0);
    }
    return product?.totalInventory || product?.inventorySummary?.available || 0;
  }, [selectedVariant, product]);

  const isInStock = currentStock > 0 || (product?.variants?.length ?? 0) > 0;

  const allImages = useMemo(() => {
    if (!product) return [];
    if (selectedVariant?.images?.length) return selectedVariant.images.filter(Boolean);
    const images: string[] = [];
    product.imageGroups?.forEach((g: { images?: { url: string }[] }) => g.images?.forEach((img: { url: string }) => { if (img.url) images.push(img.url); }));
    if (images.length === 0 && product.thumbnail) images.push(product.thumbnail);
    return images;
  }, [product, selectedVariant]);

  const getCurrentImage = () => allImages[selectedImage] || allImages[0] || null;

  const drawerProduct = isOpen ? product : null;
  const resetKey = drawerProduct ? drawerProduct._id : "closed";
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    if (drawerProduct) {
      setSelectedImage(0);
      setQuantity(1);
      setSelectedAttributes({});
      setShowFullDescription(false);
      setPendingAction(null);
      setIsAddingToCart(false);

      const def = drawerProduct.variants?.find((v) => v.isDefault) || drawerProduct.variants?.[0];
      if (def) {
        const attrs: Record<string, string> = {};
        def.attributes?.forEach((a: { key: string; value: string }) => {
          attrs[a.key] = a.value;
        });
        setSelectedAttributes(attrs);
        setSelectedVariant(def);
      } else {
        setSelectedVariant(undefined);
      }
    }
  }

  const matchedVariant = useMemo(() => {
    if (!product?.variants?.length || !Object.keys(selectedAttributes).length) return undefined;
    return product.variants.find((v: { attributes?: { key: string; value: string }[]; variantKey?: string }) => v.attributes?.every((a: { key: string; value: string }) => selectedAttributes[a.key] === a.value));
  }, [product, selectedAttributes]);

  if (matchedVariant && matchedVariant.variantKey !== selectedVariant?.variantKey) {
    setSelectedVariant(matchedVariant);
    setSelectedImage(0);
    setQuantity(1);
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeDrawer]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addCurrentProductToCart = useCallback(async () => {
    if (!product || !isInStock) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product, selectedVariant, quantity);
      closeDrawer();
      openCartModal();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
      setPendingAction(null);
    }
  }, [product, selectedVariant, quantity, addToCart, closeDrawer, openCartModal, isInStock]);

  const buyNow = useCallback(async () => {
    if (!product || !isInStock) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product, selectedVariant, quantity);
      closeDrawer();
      window.location.href = "/checkout";
    } catch (error) {
      console.error("Error buying now:", error);
    } finally {
      setIsAddingToCart(false);
      setPendingAction(null);
    }
  }, [product, selectedVariant, quantity, addToCart, closeDrawer, isInStock]);

  const handleAddToCart = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!isInStock) return;
      if (!hasGuestInfo) {
        setPendingAction("addToCart");
        setShowGuestModal(true);
        return;
      }
      addCurrentProductToCart();
    },
    [isInStock, hasGuestInfo, addCurrentProductToCart]
  );

  const handleBuyNow = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!isInStock) return;
      buyNow();
    },
    [isInStock, buyNow]
  );

  const handleGuestConfirm = useCallback(async () => {
    setShowGuestModal(false);
    if (pendingAction === "addToCart") {
      await addCurrentProductToCart();
    } else if (pendingAction === "buyNow") {
      await buyNow();
    }
    setPendingAction(null);
  }, [pendingAction, addCurrentProductToCart, buyNow]);

  const handleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product._id)) removeFromWishlist(product._id);
    else addToWishlist(product);
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            className="fixed right-0 top-0 z-[1001] flex h-full w-full flex-col border-l border-border bg-card shadow-2xl md:w-[760px] lg:w-[900px]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 p-4 backdrop-blur-md">
              <h2 className="line-clamp-1 font-heading text-xl font-semibold text-foreground">{product.name}</h2>
              <div className="flex items-center gap-1">
                <ShareButton slug={product.slug} productName={product.name} />
                <button
                  type="button"
                  aria-label="Close drawer"
                  onClick={closeDrawer}
                  className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-8 p-4 md:p-6 lg:flex-row">
                <div className="lg:w-1/2">
                  <div className="sticky top-6">
                    <div className="group relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-muted">
                      {getCurrentImage() ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getCurrentImage() ?? undefined}
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <ApertureMark className="absolute inset-0 m-auto h-16 w-16 text-foreground-muted" />
                      )}
                      <button
                        type="button"
                        aria-label="Toggle wishlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlist();
                        }}
                        className="absolute right-4 top-4 z-10 rounded-full bg-background-elevated/90 p-2.5 shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                      >
                        <Heart
                          size={18}
                          className={isInWishlist(product._id) ? "fill-destructive text-destructive" : "text-foreground"}
                        />
                      </button>
                      {hasDiscount && (
                        <div className="absolute left-4 top-4 z-10 rounded-full bg-destructive px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                          -{discountPercent}%
                        </div>
                      )}
                    </div>
                    {allImages.length > 1 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((img: string, i: number) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setSelectedImage(i)}
                            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                              selectedImage === i
                                ? "border-primary shadow-md"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 lg:w-1/2">
                  <h1 className="text-2xl font-bold text-foreground lg:text-3xl">{product.name}</h1>

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

                  <div className="flex items-center gap-2">
                    {isInStock ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-success">
                        <CheckCircle size={16} /> In Stock
                        {currentStock <= 10 && currentStock > 0 && (
                          <span className="ml-2 text-xs text-warning">Only {currentStock} left</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-destructive">Out of Stock</span>
                    )}
                  </div>

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
                              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-foreground hover:border-primary/50"
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {product.shortDescription && (
                    <p className="text-sm leading-relaxed text-foreground-muted">{product.shortDescription}</p>
                  )}

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
                    {trustBadges.map((badge, idx) => {
                      const Icon = ICON_MAP[badge.icon] || Shield;
                      return (
                        <div key={idx} className="text-center">
                          <Icon size={20} className="mx-auto mb-1 text-foreground-muted" />
                          <p className="text-xs font-medium text-foreground">{badge.title}</p>
                          <p className="text-xs text-foreground-muted">{badge.subtitle}</p>
                        </div>
                      );
                    })}
                  </div>

                  {displayProduct?.description && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                      >
                        {showFullDescription ? "Show Less" : "Read More"}
                        {showFullDescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {showFullDescription && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground-muted">
                          {displayProduct.description}
                        </p>
                      )}
                    </div>
                  )}

                  {displayProduct && (
                    <ProductSpecifications product={displayProduct} />
                  )}

                  {displayProduct?.tags && displayProduct.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {displayProduct.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-3 py-1 text-xs text-foreground-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {displayProduct && (
                    <Link
                      href={`/products/${displayProduct.slug}`}
                      onClick={closeDrawer}
                      className="block pt-2 text-center text-sm font-medium text-primary hover:text-primary/80"
                    >
                      View Full Details →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>

          {showGuestModal && (
            <GuestInfoModal
              onClose={() => {
                setShowGuestModal(false);
                setPendingAction(null);
              }}
              onConfirm={handleGuestConfirm}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
