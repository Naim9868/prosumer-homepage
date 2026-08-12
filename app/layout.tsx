import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/context/Provider";
import CartSidebarModal from "@/components/modals/CartSidebarModal";
import WishlistSidebarModal from "@/components/modals/WishlistSidebarModal";
import ProductDrawer from "@/components/product/ProductDrawer";

export const metadata: Metadata = {
  title: "Prosumer Lens BD — Optical-Grade Mobile Lenses",
  description:
    "Multi-coated macro, telephoto, wide-angle and filter lenses for mobile photography in Bangladesh. Free Dhaka delivery, cash on delivery, 2-year warranty.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-full bg-background font-body text-foreground antialiased">
        <Providers>
          {children}
          <CartSidebarModal />
          <WishlistSidebarModal />
          <ProductDrawer />
        </Providers>
      </body>
    </html>
  );
}
