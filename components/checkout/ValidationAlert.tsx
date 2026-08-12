"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationAlertProps {
  error: string | null;
  type?: "error" | "warning" | "info";
  className?: string;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({ error, type = "error", className = "" }) => {
  if (!error) return null;

  const styles = {
    error: "border-destructive/30 bg-destructive/10 text-destructive",
    warning: "border-warning/30 bg-warning/10 text-warning",
    info: "border-secondary/30 bg-secondary/10 text-secondary",
  };

  return (
    <div className={cn("rounded-xl border p-3", styles[type], className)}>
      <p className="flex items-center gap-2 text-xs">
        <AlertCircle size={14} />
        {error}
      </p>
    </div>
  );
};
