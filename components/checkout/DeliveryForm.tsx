"use client";

import React from "react";
import { Truck } from "lucide-react";
import type { CheckoutFormData, DeliveryType } from "@/types/checkout";
import { DELIVERY_LABELS } from "@/constants/checkout-constant";
import { cn } from "@/lib/utils";

interface DeliveryFormProps {
  deliveryType: DeliveryType;
  address: string;
  area: string;
  city: string;
  division: string;
  notes: string;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onDeliveryTypeChange: (type: DeliveryType) => void;
  onAddressChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onDivisionChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  deliveryType,
  address,
  area,
  city,
  division,
  notes,
  errors,
  onDeliveryTypeChange,
  onAddressChange,
  onAreaChange,
  onCityChange,
  onDivisionChange,
  onNotesChange,
}) => {
  const deliveryTypes: DeliveryType[] = ["INSIDE_DHAKA", "OUTSIDE_DHAKA"];

  const inputClass = (hasError?: string) =>
    cn(
      "w-full rounded-xl border bg-background-elevated px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent sm:py-3",
      hasError ? "border-destructive" : "border-border"
    );

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-semibold text-foreground">
        <Truck className="h-4 w-4 text-primary" /> Delivery Information
      </h3>

      <div className="flex flex-col gap-3 sm:flex-row">
        {deliveryTypes.map((type) => (
          <label
            key={type}
            className={cn(
              "flex flex-1 cursor-pointer items-center gap-2 rounded-xl border-2 p-3 transition sm:p-4",
              deliveryType === type
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            )}
          >
            <input
              type="radio"
              name="deliveryType"
              value={type}
              checked={deliveryType === type}
              onChange={(e) => onDeliveryTypeChange(e.target.value as DeliveryType)}
              className="text-primary"
            />
            <span className="text-sm font-medium text-foreground">{DELIVERY_LABELS[type]}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Address *</label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className={inputClass(errors.address)}
            placeholder="House #, Street"
          />
          {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Area *</label>
          <input
            type="text"
            value={area}
            onChange={(e) => onAreaChange(e.target.value)}
            className={inputClass(errors.area)}
            placeholder="Mirpur, Gulshan"
          />
          {errors.area && <p className="mt-1 text-xs text-destructive">{errors.area}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">City *</label>
          <input
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className={inputClass(errors.city)}
            placeholder="Dhaka"
          />
          {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Division</label>
          <input
            type="text"
            value={division}
            onChange={(e) => onDivisionChange(e.target.value)}
            className={inputClass()}
            placeholder="Dhaka Division"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Order Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className={cn(inputClass(), "mt-1")}
          rows={3}
          placeholder="Any special instructions..."
        />
      </div>
    </div>
  );
};
