"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Send, Mail, X } from "lucide-react";
import type { ContactSettings } from "@/types/homepage";

const CHANNEL_CONFIG: Record<
  string,
  { icon: typeof Phone; color: string; bg: string; getHref: (v: string) => string }
> = {
  phone: {
    icon: Phone,
    color: "#ffffff",
    bg: "#1a1a2e",
    getHref: (v) => `tel:${v}`,
  },
  whatsapp: {
    icon: MessageCircle,
    color: "#ffffff",
    bg: "#25D366",
    getHref: (v) => `https://wa.me/${v.replace(/[^0-9]/g, "")}`,
  },
  messenger: {
    icon: MessageCircle,
    color: "#ffffff",
    bg: "#0084FF",
    getHref: (v) => `https://m.me/${v}`,
  },
  telegram: {
    icon: Send,
    color: "#ffffff",
    bg: "#0088CC",
    getHref: (v) => `https://t.me/${v.replace(/^@/, "")}`,
  },
  email: {
    icon: Mail,
    color: "#ffffff",
    bg: "#EA4335",
    getHref: (v) => `mailto:${v}`,
  },
};

export function FloatingContact({ settings }: { settings?: ContactSettings }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const enabledChannels =
    settings?.channels?.filter((ch) => ch.enabled && ch.value) ?? [];

  const accentColor = settings?.accentColor || "#25D366";

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  if (!settings?.enabled || enabledChannels.length === 0) return null;

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open &&
          enabledChannels.map((ch, i) => {
            const cfg = CHANNEL_CONFIG[ch.type];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <motion.a
                key={ch.type}
                href={cfg.getHref(ch.value)}
                target={ch.type !== "phone" && ch.type !== "email" ? "_blank" : undefined}
                rel={ch.type !== "phone" && ch.type !== "email" ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.2, delay: (enabledChannels.length - 1 - i) * 0.05 }}
                className="group relative flex items-center"
                title={ch.label}
              >
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {ch.label}
                </span>
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <Icon size={20} style={{ color: cfg.color }} />
                </span>
              </motion.a>
            );
          })}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={open ? "Close contact menu" : "Contact us"}
        onClick={() => setOpen((p) => !p)}
        whileTap={{ scale: 0.92 }}
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-shadow hover:shadow-2xl"
        style={{ backgroundColor: accentColor }}
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {open ? (
            <X size={24} className="text-white" />
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          )}
        </motion.span>
      </motion.button>
    </div>
  );
}
