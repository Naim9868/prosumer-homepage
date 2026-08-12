"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { CartModalProvider } from "./CartSidebarModalContext";
import { WishlistModalProvider } from "./WishlistSidebarModalContext";
import { GuestInfoProvider } from "./GuestInfoContext";
import { ProductDrawerProvider } from "./ProductDrawerContext";
import { OrderModalProvider } from "./OrderModalContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <GuestInfoProvider>
        <CartProvider>
          <WishlistProvider>
            <CartModalProvider>
              <WishlistModalProvider>
                <ProductDrawerProvider>
                  <OrderModalProvider>{children}</OrderModalProvider>
                </ProductDrawerProvider>
              </WishlistModalProvider>
            </CartModalProvider>
          </WishlistProvider>
        </CartProvider>
      </GuestInfoProvider>
    </ThemeProvider>
  );
}
