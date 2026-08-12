"use client";

import { useCallback, useSyncExternalStore } from "react";

const cache = new Map<string, unknown>();

function readSnapshot<T>(key: string, initialValue: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return initialValue;
    const parsed = JSON.parse(raw) as T;
    cache.set(key, parsed);
    return parsed;
  } catch (error) {
    console.error(error);
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getSnapshot = useCallback(() => readSnapshot(key, initialValue), [key, initialValue]);
  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const next = value instanceof Function ? value(readSnapshot(key, initialValue)) : value;
      cache.set(key, next);
      window.localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event("storage"));
    },
    [key, initialValue]
  );

  return { storedValue, setValue, isLoaded: true };
}
