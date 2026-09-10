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
    <div className="flex flex-wrap justify-center gap-2 text-[11px] text-foreground-muted sm:gap-3 sm:text-xs">
      {badges.map(({ icon: Icon, label }) => (
        <span key={label} className="flex items-center gap-1">
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {label}
        </span>
      ))}
    </div>
  );
};
