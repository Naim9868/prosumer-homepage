"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SubmitButtonProps {
  loading: boolean;
  isValidating: boolean;
  disabled?: boolean;
  total: number;
  label?: string;
  onClick: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  isValidating,
  disabled = false,
  total,
  label = "Place Order",
  onClick,
}) => {
  const isDisabled = loading || disabled || isValidating;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition hover:scale-[1.01] hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-lg"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" /> Processing...
        </>
      ) : isValidating ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" /> Validating...
        </>
      ) : (
        <>
          {label} - {formatCurrency(total)}
        </>
      )}
    </button>
  );
};
