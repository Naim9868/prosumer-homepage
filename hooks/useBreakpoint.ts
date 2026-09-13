"use client";

import { useState, useEffect } from "react";
import type { EditorDevice } from "@/types/homepage";

const TABLET_MIN = 640;
const DESKTOP_MIN = 1024;

function getDevice(width: number): EditorDevice {
  if (width >= DESKTOP_MIN) return "desktop";
  if (width >= TABLET_MIN) return "tablet";
  return "mobile";
}

/** Returns the current device breakpoint ("desktop" | "tablet" | "mobile") based on viewport width. */
export function useBreakpoint(): EditorDevice {
  const [device, setDevice] = useState<EditorDevice>(() =>
    typeof window !== "undefined" ? getDevice(window.innerWidth) : "desktop"
  );

  useEffect(() => {
    const onResize = () => setDevice(getDevice(window.innerWidth));
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return device;
}
