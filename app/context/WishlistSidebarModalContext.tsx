"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface WishlistModalContextType {
  isWishlistModalOpen: boolean;
  openWishlistModal: () => void;
  closeWishlistModal: () => void;
}

const WishlistModalContext = createContext<WishlistModalContextType | undefined>(undefined);

export function WishlistModalProvider({ children }: { children: ReactNode }) {
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  return (
    <WishlistModalContext.Provider
      value={{
        isWishlistModalOpen,
        openWishlistModal: () => setIsWishlistModalOpen(true),
        closeWishlistModal: () => setIsWishlistModalOpen(false),
      }}
    >
      {children}
    </WishlistModalContext.Provider>
  );
}

export function useWishlistModalContext() {
  const context = useContext(WishlistModalContext);
  if (!context) {
    throw new Error("useWishlistModalContext must be used within a WishlistModalProvider");
  }
  return context;
}
