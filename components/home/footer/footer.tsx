"use client";

import { Share2, Camera, PlaySquare, ArrowRight } from "lucide-react";
import { Container, ApertureMark } from "@/components/shared/layout-primitives";
import type { PageFooterSettings } from "@/types/homepage";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";

const linkGroups = [
  {
    title: "Shop",
    links: ["Macro Lenses", "Telephoto Lenses", "Wide Angle", "Filters", "Kits & Bundles"],
  },
  {
    title: "Support",
    links: ["Track Order", "Warranty Claim", "Returns", "Shipping Info", "Contact Us"],
  },
  {
    title: "Company",
    links: ["About Prosumer", "Reviews", "Affiliate Program", "Wholesale"],
  },
];

const paymentMethods = ["bKash", "Nagad", "Rocket", "Visa", "Mastercard", "COD"];

export function Footer({ settings }: { settings?: PageFooterSettings }) {
  const s: PageFooterSettings = { ...DEFAULT_PAGE_SETTINGS.footer, ...settings };
  if (!s.enabled) return null;

  return (
    <footer
      className="border-t border-border pt-16"
      style={{
        backgroundColor: s.backgroundColor || "var(--background)",
        paddingTop: s.paddingTop,
      }}
    >
      <Container>
        <div className="grid grid-cols-1 gap-12 pb-14 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <a href="#top" className="flex items-center gap-2.5" aria-label="Prosumer Lens BD home">
              <ApertureMark className="h-7 w-7 text-primary" />
              <span className="font-heading text-[15px] font-bold uppercase tracking-[0.14em] text-foreground">
                Prosumer<span className="text-primary"> Lens</span> BD
              </span>
            </a>
            <p className="text-body-premium mt-4 max-w-xs text-[13.5px] text-foreground-muted">
              Optical-grade mobile lenses, engineered for photographers across Bangladesh who refuse
              to compromise on glass.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 flex max-w-xs items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-4"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Your email"
                className="w-full bg-transparent text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex gap-3">
              {[Share2, Camera, PlaySquare].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-eyebrow text-[11px] text-foreground">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[13.5px] text-foreground-muted transition-colors hover:text-foreground">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 sm:flex-row">
          <p className="text-[12.5px] text-foreground-muted">
            © {new Date().getFullYear()} Prosumer Lens BD. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="rounded-md border border-border px-2.5 py-1 text-[10.5px] font-semibold text-foreground-muted"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
