"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, ShoppingBag, User, Sparkles } from "lucide-react";
import { useGuestInfo } from "@/app/context/GuestInfoContext";

interface GuestInfoModalProps {
  onClose: () => void;
  onConfirm: () => void;
  actionType?: "addToCart" | "buyNow";
}

export default function GuestInfoModal({ onClose, onConfirm, actionType = "addToCart" }: GuestInfoModalProps) {
  const { setGuestInfo } = useGuestInfo();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; phone?: string } = {};
    if (!phone.trim() || !/^01[3-9]\d{8}$/.test(phone)) {
      newErrors.phone = "Valid Bangladeshi phone number is required";
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setGuestInfo({ email: email.trim(), phone: phone.trim() });
    onConfirm();
  };

  const getTitle = () => (actionType === "buyNow" ? "Quick Buy" : "Quick Add to Cart");
  const getDescription = () =>
    actionType === "buyNow" ? "Enter your details to proceed with purchase" : "Enter your details to add item to cart";
  const getButtonText = () => (actionType === "buyNow" ? "Continue to Buy" : "Continue to Cart");
  const getIcon = () =>
    actionType === "buyNow" ? <Sparkles className="h-5 w-5 text-primary" /> : <ShoppingBag className="h-5 w-5 text-primary" />;

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[1002] bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[1003] flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">{getIcon()}</div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">{getTitle()}</h2>
                  <p className="text-sm text-foreground-muted">{getDescription()}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-foreground-muted" /> Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  autoFocus
                  className={`w-full rounded-[var(--radius-md)] border bg-background-elevated px-4 py-3 text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.phone ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-foreground-muted" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com (optional)"
                  className={`w-full rounded-[var(--radius-md)] border bg-background-elevated px-4 py-3 text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary py-3.5 font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <User size={18} />
                {getButtonText()}
              </button>

              <p className="text-center text-xs text-foreground-muted">Your information is saved for future orders</p>
            </form>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
