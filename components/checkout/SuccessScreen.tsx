"use client";

import React from "react";
import { CheckCircle } from "lucide-react";

interface SuccessScreenProps {
  orderId: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ orderId, onClose, isModal = false }) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/15">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">Order Placed!</h2>
      <p className="mb-4 text-foreground-muted">
        Your order <span className="font-bold text-primary">#{orderId}</span> has been placed successfully.
      </p>
      <p className="mb-8 text-sm text-foreground-muted">We will contact you shortly to confirm your order.</p>
      <button
        type="button"
        onClick={handleClose}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        {isModal ? "Close" : "Continue Shopping"}
      </button>
    </div>
  );
};
