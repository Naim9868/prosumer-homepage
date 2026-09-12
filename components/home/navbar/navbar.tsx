"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, Sun, Moon, ChevronRight, Phone } from "lucide-react";
import { Container, ApertureMark } from "@/components/shared/layout-primitives";
import type { PageNavbarSettings } from "@/types/homepage";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";
import { useTheme } from "@/components/shared/theme-provider";
import { useCartContext } from "@/app/context/CartContext";
import { useWishlistContext } from "@/app/context/WishlistContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useWishlistModalContext } from "@/app/context/WishlistSidebarModalContext";
import { SearchRibbon } from "@/components/shared/SearchRibbon";
import { formatCurrency, cn } from "@/lib/utils";

const links = [
  { label: "Shop Lenses", href: "#shop-by-lens" },
  { label: "Best Sellers", href: "#best-sellers" },
  { label: "How It Works", href: "#how-it-works" },
];

export function Navbar({ settings }: { settings?: PageNavbarSettings }) {
  const s: PageNavbarSettings = { ...DEFAULT_PAGE_SETTINGS.navbar, ...settings };

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  const { theme, toggleTheme } = useTheme();
  const { openCartModal } = useCartModalContext();
  const { openWishlistModal } = useWishlistModalContext();
  const { cartCount, cartTotal } = useCartContext();
  const { wishlistCount } = useWishlistContext();

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 24);
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!s.enabled) return null;

  const navbarVars = {
    ...(s.textColor ? { "--navbar-text": s.textColor } : {}),
    ...(s.mutedTextColor ? { "--navbar-text-muted": s.mutedTextColor } : {}),
    ...(s.hoverColor ? { "--navbar-hover": s.hoverColor } : {}),
    ...(s.hoverBackgroundColor ? { "--navbar-hover-bg": s.hoverBackgroundColor } : {}),
    ...(s.accentColor ? { "--navbar-accent": s.accentColor } : {}),
    ...(s.buttonTextColor ? { "--navbar-accent-foreground": s.buttonTextColor } : {}),
  } as React.CSSProperties;

  const navStyle: React.CSSProperties = {
    ...(s.fontSize > 0 ? { fontSize: s.fontSize } : {}),
    ...(s.fontWeight > 0 ? { fontWeight: s.fontWeight } : {}),
  };

  const headerStyle: React.CSSProperties = {
    ...navbarVars,
    ...(s.borderColor ? { borderColor: s.borderColor } : {}),
    ...(s.fontFamily ? { fontFamily: s.fontFamily } : {}),
  };

  if (s.backgroundColor) {
    headerStyle.background = s.backgroundColor;
    headerStyle.opacity = s.opacity;
  } else if (scrolled || !s.transparent) {
    headerStyle.background = "var(--background)";
  }

  return (
    <header
      style={headerStyle}
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        !s.fixed && !isNavVisible && "-translate-y-full",
        "transition-all duration-500",
        s.backgroundColor
          ? "border-b shadow-sm"
          : scrolled || !s.transparent
            ? "border-b border-border shadow-sm"
            : ""
      )}
    >
      <Container
        className="relative flex items-center justify-between overflow-visible"
        style={{ height: s.height }}
      >
        <a href="#top" className="z-20 flex items-center gap-2.5" aria-label="Prosumer Lens BD home">
          <ApertureMark className="h-7 w-7 text-[var(--navbar-accent)]" />
          <span className="font-heading text-[15px] font-bold uppercase tracking-[0.14em] text-[var(--navbar-text)]">
            Prosumer<span className="text-[var(--navbar-accent)]"> Lens</span> BD
          </span>
        </a>

        <nav
          aria-label="Primary"
          style={navStyle}
          className={cn(
            "hidden items-center gap-8 transition-all duration-300 lg:flex",
            searchOpen ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-meta text-[13.5px] text-[var(--navbar-text-muted)] transition-colors hover:text-[var(--navbar-hover)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <SearchRibbon isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <div className="z-20 flex items-center gap-1.5 sm:gap-2">
          <IconButton
            label={searchOpen ? "Close search" : "Search"}
            onClick={() => setSearchOpen((v) => !v)}
            className={searchOpen ? "bg-[var(--navbar-hover-bg)] text-[var(--navbar-hover)]" : ""}
          >
            {searchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
          </IconButton>

          <IconButton label="Toggle theme" onClick={toggleTheme} className="hidden lg:inline-flex">
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </IconButton>

          <IconButton label="Wishlist" onClick={openWishlistModal} className="relative hidden sm:inline-flex">
            <Heart className="h-[18px] w-[18px]" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </IconButton>

          <IconButton label={`Cart, ${cartCount} items`} onClick={openCartModal} className="relative">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--navbar-accent)] text-[9px] font-bold text-[var(--navbar-accent-foreground)]">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </IconButton>

          <a
            href="/products"
            className="text-btn ml-2 hidden items-center rounded-full bg-[var(--navbar-accent)] px-5 py-2.5 text-[13px] text-[var(--navbar-accent-foreground)] shadow-sm transition-transform hover:scale-[1.03] active:scale-[0.98] md:inline-flex"
          >
            Shop Now
          </a>

          <IconButton
            label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden"
          >
            {menuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </IconButton>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Mobile"
            className={cn(
              "overflow-hidden border-t lg:hidden",
              s.backgroundColor ? "border-[var(--navbar-border)]" : "glass border-border"
            )}
          >
            <Container className="flex flex-col gap-1 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-meta flex items-center justify-between rounded-md px-2 py-2.5 text-[15px] text-[var(--navbar-text-muted)] hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-hover)]"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </a>
              ))}

              <div className="mt-1 space-y-2 border-t border-[var(--navbar-border)] pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openWishlistModal();
                  }}
                  className="text-meta flex w-full items-center justify-between rounded-md px-2 py-2.5 text-[15px] text-[var(--navbar-text-muted)] hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-hover)]"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Wishlist
                  </span>
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-white">{wishlistCount}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openCartModal();
                  }}
                  className="text-meta flex w-full items-center justify-between rounded-md px-2 py-2.5 text-[15px] text-[var(--navbar-text-muted)] hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-hover)]"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Cart
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--navbar-text)]">{formatCurrency(cartTotal)}</span>
                    {cartCount > 0 && (
                      <span className="rounded-full bg-[var(--navbar-accent)] px-2 py-0.5 text-xs text-[var(--navbar-accent-foreground)]">{cartCount}</span>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-2 px-2 py-2.5 text-[14px] text-[var(--navbar-text-muted)]">
                  <Phone className="h-4 w-4" />
                  <span>24/7 Support: +8801521529868</span>
                </div>
              </div>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>

      {searchOpen && (
        <div className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[1px]" onClick={() => setSearchOpen(false)} />
      )}
    </header>
  );
}

function IconButton({
  children,
  label,
  onClick,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--navbar-text-muted)] transition-colors hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-hover)]",
        className
      )}
    >
      {children}
    </button>
  );
}
