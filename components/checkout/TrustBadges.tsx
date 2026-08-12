"use client";

import React from "react";
import { Shield, Clock, Package } from "lucide-react";

export const TrustBadges: React.FC = () => {
  const badges = [
    { icon: Shield, label: "Secure" },
    { icon: Clock, label: "Fast Delivery" },
    { icon: Package, label: "Quality Guarantee" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 text-xs text-foreground-muted sm:gap-4 sm:text-sm">
      {badges.map(({ icon: Icon, label }) => (
        <span key={label} className="flex items-center gap-1">
          <Icon className="h-4 w-4" /> {label}
        </span>
      ))}
    </div>
  );
};
