"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Minus, Plus, ShoppingBag, Truck, Shield, RotateCcw, Heart,
  ChevronDown, ChevronUp, CheckCircle, Package, Clock, Star, Award, Zap,
  ChevronLeft, ChevronRight, ArrowRight,
} from "lucide-react";
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

const stagger = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
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
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !product?.slug) return;
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

  const displayProduct =
    fullProduct && product && fullProduct.slug === product.slug ? fullProduct : product;

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
    const source = displayProduct || product;
    if (!source) return [];
    const seen = new Set<string>();
    const merged: string[] = [];
    const push = (url?: string) => {
      if (url && !seen.has(url)) {
        seen.add(url);
        merged.push(url);
      }
    };
    selectedVariant?.images?.filter(Boolean).forEach(push);
    source.imageGroups?.forEach((g: { images?: { url: string }[] }) =>
      g.images?.forEach((img: { url: string }) => push(img.url))
    );
    if (merged.length === 0) push(source.thumbnail);
    return merged;
  }, [displayProduct, product, selectedVariant]);

  const getCurrentImage = () => allImages[selectedImage] || allImages[0] || null;

  const goToImage = useCallback((i: number) => {
    if (!allImages.length) return;
    setSelectedImage((i + allImages.length) % allImages.length);
  }, [allImages.length]);

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
      setFullProduct(null);

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

  const shortDescription = displayProduct?.shortDescription;

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[6px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            className="fixed right-0 top-0 z-[1001] flex h-full w-full flex-col border-l border-border bg-card shadow-[var(--shadow-lg)] md:w-[780px] lg:w-[940px]"
          >
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border/70 bg-card/90 px-5 py-4 backdrop-blur-xl md:px-7">
              <div className="min-w-0">
                <p className="text-eyebrow text-[10px] text-foreground-muted">Quick View</p>
                <h2 className="mt-0.5 line-clamp-1 font-heading text-base font-semibold tracking-tight text-foreground md:text-lg">
                  {product.name}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <ShareButton slug={product.slug} productName={product.name} />
                <button
                  type="button"
                  aria-label="Close drawer"
                  onClick={closeDrawer}
                  className="rounded-full border border-border/60 p-2 text-foreground-muted transition-all hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── Body ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="flex flex-col gap-8 p-5 md:p-7 lg:flex-row lg:gap-10">

                {/* ── Gallery (The White Company style) ───────────── */}
                <div className="lg:w-[52%] lg:shrink-0">
                  <div className="lg:sticky lg:top-6">
                    <div
                      className="group relative aspect-[4/3] touch-pan-y overflow-hidden rounded-[var(--radius-lg)] bg-muted"
                      onTouchStart={(e) => {
                        touchStartX.current = e.touches[0].clientX;
                      }}
                      onTouchEnd={(e) => {
                        if (touchStartX.current == null) return;
                        const delta = e.changedTouches[0].clientX - touchStartX.current;
                        if (Math.abs(delta) > 40) goToImage(selectedImage + (delta < 0 ? 1 : -1));
                        touchStartX.current = null;
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={selectedImage}
                          initial={{ opacity: 0, scale: 1.03 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          whileHover={{ scale: 1.04 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          src={getCurrentImage() ?? undefined}
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </AnimatePresence>

                      {!getCurrentImage() && (
                        <ApertureMark className="absolute inset-0 m-auto h-16 w-16 text-foreground-muted" />
                      )}

                      {/* Wishlist */}
                      <button
                        type="button"
                        aria-label="Toggle wishlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlist();
                        }}
                        className="absolute right-4 top-4 z-10 rounded-full border border-border/50 bg-background-elevated/90 p-2.5 shadow-[var(--shadow-sm)] backdrop-blur-md transition-transform hover:scale-110"
                      >
                        <Heart
                          size={17}
                          className={isInWishlist(product._id) ? "fill-destructive text-destructive" : "text-foreground"}
                        />
                      </button>

                      {/* Discount badge */}
                      {hasDiscount && (
                        <div className="absolute left-4 top-4 z-10 rounded-full bg-destructive px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-[var(--shadow-md)]">
                          −{discountPercent}%
                        </div>
                      )}

                      {/* Image counter */}
                      {allImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur-md">
                          {selectedImage + 1} / {allImages.length}
                        </div>
                      )}

                      {/* Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Previous image"
                            onClick={() => goToImage(selectedImage - 1)}
                            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background-elevated/85 text-foreground shadow-[var(--shadow-sm)] backdrop-blur-md transition-all hover:bg-background-elevated lg:opacity-0 lg:group-hover:opacity-100"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            type="button"
                            aria-label="Next image"
                            onClick={() => goToImage(selectedImage + 1)}
                            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background-elevated/85 text-foreground shadow-[var(--shadow-sm)] backdrop-blur-md transition-all hover:bg-background-elevated lg:opacity-0 lg:group-hover:opacity-100"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                      <div className="no-scrollbar mt-3 flex snap-x gap-2.5 overflow-x-auto pb-1">
                        {allImages.map((img: string, i: number) => (
                          <button
                            type="button"
                            key={i}
                            aria-label={`View image ${i + 1}`}
                            aria-current={selectedImage === i}
                            onClick={() => setSelectedImage(i)}
                            className={`relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-[var(--radius-sm)] border transition-all duration-300 sm:h-[68px] sm:w-[68px] ${
                              selectedImage === i
                                ? "border-primary shadow-[0_0_0_1px_var(--primary)]"
                                : "border-border/70 opacity-65 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Details ─────────────────────────────────────── */}
                <div className="flex flex-col gap-7 lg:w-[48%]">

                  {/* Title + price */}
                  <motion.div variants={stagger} initial="hidden" animate="show" custom={0} className="flex flex-col gap-4">
                    <h1 className="text-product-title text-[26px] text-foreground md:text-[30px]">
                      {product.name}
                    </h1>

                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-price text-[28px] text-foreground">{formatCurrency(currentPrice)}</span>
                      {hasDiscount && (
                        <>
                          <span className="text-lg text-foreground-muted line-through decoration-destructive/60">
                            {formatCurrency(compareAtPrice!)}
                          </span>
                          <span className="rounded-full bg-success/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-success">
                            Save {formatCurrency(compareAtPrice! - currentPrice)}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isInStock ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
                          <CheckCircle size={13} /> In Stock
                          {currentStock <= 10 && currentStock > 0 && (
                            <span className="font-medium text-warning">· Only {currentStock} left</span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </motion.div>

                  {/* Variants */}
                  {attributeTypes.length > 0 && (
                    <motion.div variants={stagger} initial="hidden" animate="show" custom={1} className="flex flex-col gap-3">
                      {attributeTypes.map((attr) => (
                        <div key={attr.key} className="flex flex-col gap-2.5">
                          <label className="text-eyebrow text-[10px] text-foreground-muted">
                            Select {attr.label}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {attr.values.map((val) => {
                              const isSelected = selectedAttributes[attr.key] === val;
                              return (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => setSelectedAttributes((p) => ({ ...p, [attr.key]: val }))}
                                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
                                    isSelected
                                      ? "border-primary bg-primary text-primary-foreground shadow-[0_2px_10px_rgba(176,141,70,0.28)]"
                                      : "border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Quantity */}
                  {isInStock && (
                    <motion.div variants={stagger} initial="hidden" animate="show" custom={2} className="flex flex-col gap-2.5">
                      <label className="text-eyebrow text-[10px] text-foreground-muted">Quantity</label>
                      <div className="inline-flex w-fit items-center rounded-full border border-border bg-background-elevated/60 p-1">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity((p) => Math.max(1, p - 1))}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="min-w-[44px] text-center text-sm font-semibold tabular-nums text-foreground">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity((p) => Math.min(currentStock, p + 1))}
                          disabled={quantity >= currentStock}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* CTAs */}
                  <motion.div variants={stagger} initial="hidden" animate="show" custom={3} className="flex flex-col gap-3">
                    <div className="hidden gap-3 lg:flex">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!isInStock || isAddingToCart}
                        className="hover-fill-btn hover-fill-btn--primary flex flex-1 items-center justify-center gap-2 py-3.5 text-btn text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="btn-fill" aria-hidden="true" />
                        <span className="btn-text relative z-10 flex items-center gap-2">
                          {isAddingToCart && pendingAction === "addToCart" ? (
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <>
                              <ShoppingBag size={17} /> Add to Cart
                            </>
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={!isInStock || isAddingToCart}
                        className="hover-fill-btn hover-fill-btn--secondary flex flex-1 items-center justify-center gap-2 py-3.5 text-btn text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="btn-fill" aria-hidden="true" />
                        <span className="btn-text relative z-10 flex items-center justify-center gap-2">
                          {isAddingToCart && pendingAction === "buyNow" ? (
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            "Buy Now"
                          )}
                        </span>
                      </button>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-2 gap-3 rounded-[var(--radius-md)] border border-border/60 bg-muted/40 p-4 sm:grid-cols-4">
                      {trustBadges.map((badge, idx) => {
                        const Icon = ICON_MAP[badge.icon] || Shield;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1 text-center">
                            <Icon size={17} className="text-primary" />
                            <p className="text-[11px] font-semibold leading-tight text-foreground">{badge.title}</p>
                            <p className="text-[10px] leading-tight text-foreground-muted">{badge.subtitle}</p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* ── Short description ──────────────────────────── */}
                  {(shortDescription || displayProduct?.description) && (
                    <motion.div variants={stagger} initial="hidden" animate="show" custom={4} className="border-y border-border/60 py-5">
                      <p className="text-eyebrow mb-2 text-[10px] text-foreground-muted">Description</p>
                      <p className="text-body-premium text-[15px] leading-relaxed text-foreground-muted">
                        {shortDescription || displayProduct?.description}
                      </p>
                      {shortDescription && displayProduct?.description && (
                        <button
                          type="button"
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary transition-colors hover:text-primary/75"
                        >
                          {showFullDescription ? "Show Less" : "Read More"}
                          {showFullDescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                      <AnimatePresence initial={false}>
                        {showFullDescription && shortDescription && displayProduct?.description && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground-muted">
                              {displayProduct.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* ── Specifications ─────────────────────────────── */}
                  {displayProduct && (
                    <motion.div variants={stagger} initial="hidden" animate="show" custom={5}>
                      <ProductSpecifications product={displayProduct} collapsible />
                    </motion.div>
                  )}

                  {/* Tags */}
                  {displayProduct?.tags && displayProduct.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {displayProduct.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-[11px] font-medium text-foreground-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View full details */}
                  {displayProduct && (
                    <Link
                      href={`/products/${displayProduct.slug}`}
                      onClick={closeDrawer}
                      className="group mt-1 flex items-center justify-between rounded-[var(--radius-md)] border border-border/70 bg-background-elevated/50 px-5 py-4 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                    >
                      <span className="text-btn text-sm text-foreground">View Full Details</span>
                      <ArrowRight
                        size={17}
                        className="text-primary transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* ── Mobile sticky purchase bar ─────────────────────── */}
            <div className="shrink-0 border-t border-border/70 bg-card/95 px-5 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-price text-[17px] leading-tight text-foreground">
                    {formatCurrency(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[11px] leading-tight text-foreground-muted line-through">
                      {formatCurrency(compareAtPrice!)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isInStock || isAddingToCart}
                  className="hover-fill-btn hover-fill-btn--primary flex flex-1 items-center justify-center gap-2 py-3 text-btn text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="btn-fill" aria-hidden="true" />
                  <span className="btn-text relative z-10 flex items-center gap-2">
                    {isAddingToCart && pendingAction === "addToCart" ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <ShoppingBag size={16} /> {isInStock ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </span>
                </button>
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
