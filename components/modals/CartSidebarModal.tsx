"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartContext } from "@/app/context/CartContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { formatCurrency } from "@/lib/utils";
import { ApertureMark } from "@/components/shared/layout-primitives";

export default function CartSidebarModal() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCartContext();
  const { isCartModalOpen, closeCartModal } = useCartModalContext();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCartModal();
    };
    if (isCartModalOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCartModalOpen, closeCartModal]);

  useEffect(() => {
    document.body.style.overflow = isCartModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartModalOpen]);

  const handleCheckout = () => {
    closeCartModal();
    window.location.href = "/checkout";
  };

  return (
    <AnimatePresence>
      {isCartModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCartModal}
            className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-[1001] flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Cart ({cartItems.length})
              </h2>
              <button
                type="button"
                aria-label="Close cart"
                onClick={closeCartModal}
                className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <ApertureMark className="h-16 w-16 text-muted" />
                  <p className="mt-4 text-[15px] font-medium text-foreground">Your cart is empty</p>
                  <p className="mt-1 text-[13px] text-foreground-muted">
                    Add some lenses to start building your kit.
                  </p>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="mt-6 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  >
                    Shop Lenses
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-[var(--radius-md)] border border-border bg-background-elevated p-3">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg" style={{ background: item.gradient }}>
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <ApertureMark className="absolute inset-0 m-auto h-8 w-8 text-white/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{item.name}</h3>
                        <p className="mt-0.5 text-xs text-foreground-muted">{item.category}</p>
                        <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(item.price.sale)}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name} from cart`}
                            onClick={() => removeFromCart(item.id)}
                            className="rounded-lg p-1.5 text-destructive transition-colors hover:bg-muted"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="space-y-4 border-t border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">Subtotal</span>
                  <span className="font-heading text-xl font-bold text-foreground">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary py-3.5 font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
                <p className="text-center text-[11.5px] text-foreground-muted">
                  Free Dhaka delivery · Cash on delivery available nationwide
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
