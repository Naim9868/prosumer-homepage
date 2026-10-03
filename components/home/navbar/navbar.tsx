"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, Sun, Moon, ChevronRight, Phone, ArrowUpRight } from "lucide-react";
import { Container, ApertureMark } from "@/components/shared/layout-primitives";
import type { PageNavbarSettings } from "@/types/homepage";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";
import type { CatalogCategory } from "@/types/catalog";
import { useTheme } from "@/components/shared/theme-provider";
import { useCartContext } from "@/app/context/CartContext";
import { useWishlistContext } from "@/app/context/WishlistContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useWishlistModalContext } from "@/app/context/WishlistSidebarModalContext";
import { SearchRibbon } from "@/components/shared/SearchRibbon";
import { formatCurrency, cn } from "@/lib/utils";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { resolveNavbarTypography } from "@/lib/page-settings";

const links = [
  { label: "Shop Lenses", href: "#shop-by-lens", hasDropdown: true },
  { label: "Best Sellers", href: "#best-sellers", hasDropdown: false },
  { label: "How It Works", href: "#how-it-works", hasDropdown: false },
];

export function Navbar({ settings, categories }: { settings?: PageNavbarSettings; categories?: CatalogCategory[] }) {
  const s: PageNavbarSettings = { ...DEFAULT_PAGE_SETTINGS.navbar, ...settings };
  const device = useBreakpoint();
  const typo = resolveNavbarTypography(s.typography, device);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const lastScrollY = useRef(0);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setShopDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  if (!s.enabled) return null;

  const isTransparent = !scrolled && s.transparent;

  // Resolve per-theme text colors — theme-specific overrides fall back to base color.
  const themeTextColor = (theme === "dark" ? s.darkTextColor : s.lightTextColor) || s.textColor;
  const themeMutedTextColor = (theme === "dark" ? s.darkMutedTextColor : s.lightMutedTextColor) || s.mutedTextColor;

  const navbarVars = {
    ...(s.accentColor ? { "--navbar-accent": s.accentColor } : {}),
    ...(s.buttonTextColor ? { "--navbar-accent-foreground": s.buttonTextColor } : {}),
    ...(isTransparent
      ? {
          "--navbar-text": themeTextColor || "#ffffff",
          "--navbar-text-muted": themeMutedTextColor || "rgba(255,255,255,0.85)",
          "--navbar-hover": s.hoverColor || "#ffffff",
          "--navbar-hover-bg": s.hoverBackgroundColor || "rgba(255,255,255,0.12)",
        }
      : {
          ...(themeTextColor ? { "--navbar-text": themeTextColor } : {}),
          ...(themeMutedTextColor ? { "--navbar-text-muted": themeMutedTextColor } : {}),
          ...(s.hoverColor ? { "--navbar-hover": s.hoverColor } : {}),
          ...(s.hoverBackgroundColor ? { "--navbar-hover-bg": s.hoverBackgroundColor } : {}),
        }),
  } as React.CSSProperties;

  const navLinkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.fontSize > 0 ? { fontSize: typo.fontSize } : {}),
    ...(typo.fontWeight > 0 ? { fontWeight: typo.fontWeight } : {}),
  };

  const headerStyle: React.CSSProperties = {
    ...navbarVars,
    ...(s.borderColor ? { borderColor: s.borderColor } : {}),
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
      suppressHydrationWarning
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
        <a href="/" className="z-20 flex items-center gap-2.5" aria-label="Prosumer Lens BD home">
          <ApertureMark className="h-7 w-7 text-[var(--navbar-accent)]" />
          <span className="font-heading text-[15px] font-bold uppercase tracking-[0.14em] text-[var(--navbar-text)]">
            Prosumer<span className="text-[var(--navbar-accent)]"> Lens</span> BD
          </span>
        </a>

        <nav
          aria-label="Primary"
          className={cn(
            "hidden items-center gap-8 transition-all duration-300 lg:flex",
            searchOpen ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          {links.map((link) => (
            <div
              key={link.href}
              className="relative"
              onMouseEnter={link.hasDropdown ? handleDropdownEnter : undefined}
              onMouseLeave={link.hasDropdown ? handleDropdownLeave : undefined}
            >
              <a
                href={link.href}
                style={navLinkStyle}
                className="text-meta text-[var(--navbar-text-muted)] transition-colors hover:text-[var(--navbar-hover)]"
              >
                {link.label}
              </a>
              {link.hasDropdown && shopDropdownOpen && categories && categories.length > 0 && (
                <div
                  className="absolute left-1/2 top-full -translate-x-1/2 pt-3"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="glass w-[520px] rounded-2xl border border-border/60 p-4 shadow-lg"
                  >
                    <div className="mb-3 px-2">
                      <span className="text-eyebrow text-[10px] text-[var(--navbar-accent)]">
                        All Categories
                      </span>
                      <h3 className="font-heading text-sm font-semibold text-[var(--navbar-text)]">
                        Shop by Lens Type
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <a
                          key={cat.id}
                          href={`/products?categoryId=${cat.id}`}
                          className="group relative flex items-center gap-3 overflow-hidden rounded-xl p-3 transition-all duration-200 hover:bg-[var(--navbar-hover-bg)]"
                        >
                          <div
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg"
                            style={{ background: cat.gradient }}
                          >
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-white/80">
                                {cat.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-meta block truncate text-[13px] font-medium text-[var(--navbar-text)] group-hover:text-[var(--navbar-hover)]">
                              {cat.name}
                            </span>
                            {cat.tagline && (
                              <span className="text-[11px] text-[var(--navbar-text-muted)] line-clamp-1">
                                {cat.tagline}
                              </span>
                            )}
                          </div>
                          <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-[var(--navbar-text-muted)] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                        </a>
                      ))}
                    </div>
                    <div className="mt-3 border-t border-border/50 pt-3">
                      <a
                        href="#shop-by-lens"
                        className="text-meta flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] text-[var(--navbar-accent)] transition-colors hover:bg-[var(--navbar-hover-bg)]"
                      >
                        View All Categories
                        <ChevronRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
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
                <div key={link.href}>
                  {link.hasDropdown ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShopDropdownOpen((v) => !v)}
                        style={navLinkStyle}
                        className="text-meta flex w-full items-center justify-between rounded-md px-2 py-2.5 text-[15px] text-[var(--navbar-text-muted)] hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-hover)]"
                      >
                        {link.label}
                        <ChevronRight className={cn("h-4 w-4 opacity-50 transition-transform duration-200", shopDropdownOpen && "rotate-90")} />
                      </button>
                      <AnimatePresence>
                        {shopDropdownOpen && categories && categories.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden pl-3"
                          >
                            <div className="grid grid-cols-1 gap-1 py-1">
                              {categories.map((cat) => (
                                <a
                                  key={cat.id}
                                  href={`/products?categoryId=${cat.id}`}
                                  onClick={() => setMenuOpen(false)}
                                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--navbar-hover-bg)]"
                                >
                                  <div
                                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-md"
                                    style={{ background: cat.gradient }}
                                  >
                                    {cat.image ? (
                                      <img
                                        src={cat.image}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-[10px] font-bold text-white/80">
                                        {cat.name.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-meta text-[13px] text-[var(--navbar-text-muted)]">
                                    {cat.name}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      style={navLinkStyle}
                      className="text-meta flex items-center justify-between rounded-md px-2 py-2.5 text-[15px] text-[var(--navbar-text-muted)] hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-hover)]"
                    >
                      {link.label}
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </a>
                  )}
                </div>
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
