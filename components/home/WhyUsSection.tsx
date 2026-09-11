"use client";

import { Rocket, ShieldCheck, Heart, Star, MessageCircle, Leaf, CreditCard, Lock, ArrowRight, Sparkles, Truck } from "lucide-react";

const benefits = [
  {
    icon: Rocket,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    title: "Lightning-Fast Delivery",
    description: (
      <>
        Get your order in{" "}
        <span className="inline-block rounded bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
          1–3 Business Days
        </span>
        . Free shipping on orders over{" "}
        <span className="inline-block rounded bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
          ৳1500+
        </span>
        .
      </>
    ),
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    title: "2-Year Warranty",
    description: (
      <>
        Every lens is backed by a{" "}
        <span className="inline-block rounded bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
          2-Year
        </span>{" "}
        manufacturer warranty. Not satisfied? 30-day hassle-free returns, no questions asked.
      </>
    ),
  },
  {
    icon: Heart,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400",
    title: "Trusted by Thousands",
    description: (
      <>
        Join{" "}
        <span className="inline-block rounded bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
          10,000+
        </span>{" "}
        happy photographers across Bangladesh. Rated{" "}
        <span className="inline-block rounded bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
          4.8/5
        </span>{" "}
        Stars.
      </>
    ),
  },
];

const trustItems = [
  {
    icon: Star,
    color: "text-amber-500",
    title: "Verified Reviews",
    subtitle: "5,000+ real customer ratings",
  },
  {
    icon: MessageCircle,
    color: "text-indigo-500",
    title: "Live Human Support",
    subtitle: "Reply in under 2 minutes",
  },
  {
    icon: Leaf,
    color: "text-emerald-500",
    title: "Eco-Friendly Packaging",
    subtitle: "100% recyclable materials",
  },
];

const paymentMethods = [
  { icon: Lock, label: "SSL Secure" },
  { icon: CreditCard, label: "bKash / Nagad" },
  { icon: Truck, label: "Insured Shipping" },
];

export function WhyUsSection() {
  return (
    <section className="bg-background py-16 transition-colors duration-300 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Why Shop{" "}
            <span className="bg-gradient-to-r from-[color:var(--brass-500)] to-[color:var(--titanium-400)] bg-clip-text text-transparent">
              With Us?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-foreground-muted sm:text-lg">
            We cut the fluff and focus on what actually matters to you.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-start">

          {/* Left Column — Benefits */}
          <div className="flex flex-col gap-5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="group flex items-center gap-6 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 sm:p-8"
                >
                  <div
                    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16 ${b.color}`}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base font-bold text-foreground sm:text-lg">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground-muted sm:text-base">
                      {b.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column — Trust Sidebar */}
          <div className="rounded-2xl border border-border bg-card p-6 transition-colors duration-300 sm:p-8">
            <h4 className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-foreground-muted">
              <Lock className="mr-1.5 inline-block h-3.5 w-3.5" />
              Peace of Mind
            </h4>

            <div className="flex flex-col gap-0">
              {trustItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`flex items-center gap-4 py-4 ${
                      i < trustItems.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <Icon className={`h-6 w-6 flex-shrink-0 ${item.color}`} strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <strong className="block text-sm font-bold text-foreground">
                        {item.title}
                      </strong>
                      <span className="text-xs text-foreground-muted">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Methods */}
            <div className="mt-6 flex flex-wrap justify-center gap-2.5 border-t border-border pt-6">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                return (
                  <span
                    key={pm.label}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground-muted transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    {pm.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <a
            href="/products"
            className="group inline-flex items-center gap-2.5 rounded-full border-2 border-foreground bg-foreground px-10 py-4 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-foreground hover:shadow-lg sm:text-base"
          >
            <Sparkles className="h-4 w-4" />
            Shop Now — Fast Shipping & Quality Guaranteed
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
