"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

interface EmptyCartProps {
  onBrowseProducts?: () => void;
}

export const EmptyCart: React.FC<EmptyCartProps> = ({ onBrowseProducts = () => (window.location.href = "/products") }) => {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-foreground-muted" />
      <h2 className="mb-1.5 text-lg font-bold text-foreground">Your cart is empty</h2>
      <p className="mb-4 text-sm text-foreground-muted">Add some products before checking out.</p>
      <button
        type="button"
        onClick={onBrowseProducts}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Browse Products
      </button>
    </div>
  );
};
