"use client";

import React, { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface GuestInfo {
  phone: string;
  email?: string | null;
}

interface GuestInfoContextType {
  guestInfo: GuestInfo | null;
  setGuestInfo: (info: GuestInfo) => void;
  hasGuestInfo: boolean;
}

const GuestInfoContext = createContext<GuestInfoContextType | undefined>(undefined);

export function GuestInfoProvider({ children }: { children: ReactNode }) {
  const { storedValue: guestInfo, setValue: setStoredGuestInfo } = useLocalStorage<GuestInfo | null>(
    "guestInfo",
    null
  );

  const setGuestInfo = useCallback(
    (info: GuestInfo) => {
      const normalized: GuestInfo = {
        phone: info.phone.trim(),
        email: info.email?.trim() || null,
      };
      setStoredGuestInfo(normalized);
    },
    [setStoredGuestInfo]
  );

  const hasGuestInfo = guestInfo !== null && guestInfo.phone.trim() !== "";

  const value = useMemo(
    () => ({ guestInfo, setGuestInfo, hasGuestInfo }),
    [guestInfo, setGuestInfo, hasGuestInfo]
  );

  return <GuestInfoContext.Provider value={value}>{children}</GuestInfoContext.Provider>;
}

export function useGuestInfo() {
  const context = useContext(GuestInfoContext);
  if (!context) {
    throw new Error("useGuestInfo must be used within a GuestInfoProvider");
  }
  return context;
}
