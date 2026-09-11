"use client";

import { useState, useEffect } from "react";
import { FloatingContact } from "@/components/shared/FloatingContact";
import type { ContactSettings } from "@/types/homepage";

export function FloatingContactLoader() {
  const [settings, setSettings] = useState<ContactSettings | undefined>(undefined);

  useEffect(() => {
    fetch("/api/homepage")
      .then((r) => r.json())
      .then((data) => {
        if (data?.page?.contact) {
          setSettings(data.page.contact);
        }
      })
      .catch(() => {});
  }, []);

  return <FloatingContact settings={settings} />;
}
