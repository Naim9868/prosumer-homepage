"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Checkout } from "@/components/checkout";
import type { OrderItem } from "@/types/checkout";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  userId?: string;
  onSuccess?: (orderId: string) => void;
}

export default function OrderModal({ isOpen, onClose, items, userId, onSuccess }: OrderModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSuccess = () => {
    setOrderPlaced(true);
    if (onSuccess) {
      onSuccess("order-created");
    }
    setTimeout(() => {
      onClose();
      setOrderPlaced(false);
    }, 3000);
  };

  if (!isOpen || typeof document === "undefined") return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        ref={modalRef}
        className="relative flex h-[95vh] w-[95vw] max-w-6xl flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border p-4">
          <div>
            <h2 id="modal-title" className="font-heading text-lg font-semibold text-foreground">
              {orderPlaced ? "Order Placed!" : "Complete Your Order"}
            </h2>
            <p className="text-sm text-foreground-muted">
              {orderPlaced
                ? "Your order has been placed successfully"
                : "Review your items and provide delivery details"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={orderPlaced}
            className="rounded-md p-2 text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scroll flex-1 overflow-y-auto p-4">
          <Checkout items={items} userId={userId} onSuccess={handleSuccess} onClose={onClose} isModal={true} />
        </div>

        <style jsx>{`
          .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: var(--border) transparent;
          }

          .custom-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scroll::-webkit-scrollbar-thumb {
            background-color: var(--border);
            border-radius: 20px;
          }

          .custom-scroll::-webkit-scrollbar-thumb:hover {
            background-color: var(--foreground-muted);
          }
        `}</style>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}