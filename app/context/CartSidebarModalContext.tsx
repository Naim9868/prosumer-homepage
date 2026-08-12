"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CartModalContextType {
  isCartModalOpen: boolean;
  openCartModal: () => void;
  closeCartModal: () => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(undefined);

export function CartModalProvider({ children }: { children: ReactNode }) {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  return (
    <CartModalContext.Provider
      value={{
        isCartModalOpen,
        openCartModal: () => setIsCartModalOpen(true),
        closeCartModal: () => setIsCartModalOpen(false),
      }}
    >
      {children}
    </CartModalContext.Provider>
  );
}

export function useCartModalContext() {
  const context = useContext(CartModalContext);
  if (!context) {
    throw new Error("useCartModalContext must be used within a CartModalProvider");
  }
  return context;
}
