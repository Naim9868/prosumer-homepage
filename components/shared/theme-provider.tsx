"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "plbd-theme";
const DESKTOP_QUERY = "(min-width: 1024px)";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function isDesktop(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

/**
 * The stored override wins on every device.
 * Without one: mobile/tablet stays light, desktop follows the device preference.
 */
function getSnapshot(): Theme {
  const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  if (!isDesktop()) return "light";
  return getSystemTheme();
}

function subscribe(callback: () => void) {
  const colorMq = window.matchMedia("(prefers-color-scheme: dark)");
  const desktopMq = window.matchMedia(DESKTOP_QUERY);
  colorMq.addEventListener("change", callback);
  desktopMq.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  return () => {
    colorMq.removeEventListener("change", callback);
    desktopMq.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_KEY, next);
    window.dispatchEvent(new Event("storage"));
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

const DEFAULT_THEME: ThemeContextValue = { theme: "light", toggleTheme: () => {} };

export function useTheme() {
  return useContext(ThemeContext) ?? DEFAULT_THEME;
}