"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { EditorDevice } from "@/types/homepage";

type EditorTheme = "system" | "light" | "dark";

interface EditorDeviceCtx {
  device: EditorDevice;
  setDevice: (d: EditorDevice) => void;
}

interface EditorThemeCtx {
  theme: EditorTheme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: EditorTheme) => void;
}

const DeviceContext = createContext<EditorDeviceCtx>({ device: "desktop", setDevice: () => {} });
const ThemeContext = createContext<EditorThemeCtx>({ theme: "system", resolvedTheme: "dark", setTheme: () => {} });

export function EditorDeviceProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<EditorDevice>("desktop");
  return <DeviceContext.Provider value={{ device, setDevice }}>{children}</DeviceContext.Provider>;
}

export function useEditorDevice() {
  return useContext(DeviceContext);
}

export function EditorThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<EditorTheme>("system");
  const [resolvedTheme, setResolved] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => {
      if (theme === "system") setResolved(mq.matches ? "dark" : "light");
      else setResolved(theme);
    };
    resolve();
    mq.addEventListener("change", resolve);
    return () => mq.removeEventListener("change", resolve);
  }, [theme]);

  const setTheme = useCallback((t: EditorTheme) => {
    setThemeState(t);
    try { localStorage.setItem("editor-theme", t); } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("editor-theme") as EditorTheme | null;
      if (saved && ["system", "light", "dark"].includes(saved)) setThemeState(saved);
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      <div className={resolvedTheme === "dark" ? "editor-dark" : "editor-light"} style={{ display: "contents" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useEditorTheme() {
  return useContext(ThemeContext);
}
