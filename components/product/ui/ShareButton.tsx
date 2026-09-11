"use client";

import { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  slug: string;
  productName: string;
  className?: string;
}

export function ShareButton({ slug, productName, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/products/${slug}` : "";

    if (navigator.share) {
      try {
        await navigator.share({ title: productName, url });
      } catch {
        // User cancelled or share failed — fall through
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed — silently ignore
    }
  }, [slug, productName]);

  return (
    <button
      type="button"
      aria-label="Share product"
      onClick={handleShare}
      className={`rounded-full p-2 text-foreground-muted transition-colors hover:bg-muted hover:text-foreground ${className ?? ""}`}
    >
      {copied ? <Check size={18} className="text-success" /> : <Share2 size={18} />}
    </button>
  );
}
