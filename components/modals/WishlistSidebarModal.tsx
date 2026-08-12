"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trash2, ShoppingBag, Plus } from "lucide-react";
import { useWishlistContext } from "@/app/context/WishlistContext";
import { useWishlistModalContext } from "@/app/context/WishlistSidebarModalContext";
import { useCartContext } from "@/app/context/CartContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { formatCurrency } from "@/lib/utils";
import { useCatalogData } from "@/hooks/use-catalog-client";
import { ApertureMark } from "@/components/shared/layout-primitives";

export default function WishlistSidebarModal() {
  const { wishlistItems, removeFromWishlist } = useWishlistContext();
  const { isWishlistModalOpen, closeWishlistModal } = useWishlistModalContext();
  const { addToCart } = useCartContext();
  const { openCartModal } = useCartModalContext();
  const { productsById } = useCatalogData();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWishlistModal();
    };
    if (isWishlistModalOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isWishlistModalOpen, closeWishlistModal]);

  useEffect(() => {
    document.body.style.overflow = isWishlistModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isWishlistModalOpen]);

  const handleContinue = () => {
    closeWishlistModal();
    document.getElementById("shop-by-lens")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isWishlistModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeWishlistModal}
            className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Wishlist"
            className="fixed right-0 top-0 z-[1001] flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                <Heart className="h-5 w-5 text-destructive" />
                Wishlist ({wishlistItems.length})
              </h2>
              <button
                type="button"
                aria-label="Close wishlist"
                onClick={closeWishlistModal}
                className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Heart className="h-16 w-16 text-muted" />
                  <p className="mt-4 text-[15px] font-medium text-foreground">Your wishlist is empty</p>
                  <p className="mt-1 text-[13px] text-foreground-muted">
                    Tap the heart on any lens to save it here.
                  </p>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="mt-6 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  >
                    Explore Lenses
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-[var(--radius-md)] border border-border bg-background-elevated p-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg" style={{ background: item.gradient }}>
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <ApertureMark className="absolute inset-0 m-auto h-6 w-6 text-white/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{item.name}</h3>
                        <p className="mt-0.5 text-xs text-foreground-muted">{item.category}</p>
                        <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from wishlist`}
                          onClick={() => removeFromWishlist(item.id)}
                          className="rounded-lg p-1.5 text-destructive transition-colors hover:bg-muted"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Add ${item.name} to cart`}
                          onClick={() => {
                            const product = productsById[item.productId];
                            if (product) {
                              addToCart(product);
                              closeWishlistModal();
                              openCartModal();
                            }
                          }}
                          className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          <Plus size={11} /> Add to cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {wishlistItems.length > 0 && (
              <div className="border-t border-border p-4">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary py-3 font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ShoppingBag size={18} /> Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
