"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

interface EmptyCartProps {
  onBrowseProducts?: () => void;
}

export const EmptyCart: React.FC<EmptyCartProps> = ({ onBrowseProducts = () => (window.location.href = "/products") }) => {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-foreground-muted" />
      <h2 className="mb-2 text-xl font-bold text-foreground">Your cart is empty</h2>
      <p className="mb-6 text-foreground-muted">Add some products before checking out.</p>
      <button
        type="button"
        onClick={onBrowseProducts}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Browse Products
      </button>
    </div>
  );
};
