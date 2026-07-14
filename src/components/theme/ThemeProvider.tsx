"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT,
  DEFAULT_MODE,
  THEME_STORAGE_KEY,
  type AccentId,
  type ThemeMode,
} from "@/lib/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentId;
  hydrated: boolean;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (a: AccentId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [accent, setAccentState] = useState<AccentId>(DEFAULT_ACCENT);
  const [hydrated, setHydrated] = useState(false);

  // Sincroniza el estado de React con lo que el script previo ya aplicó al DOM.
  useEffect(() => {
    const d = document.documentElement;
    const t = d.dataset.theme;
    const a = d.dataset.accent;
    if (t === "light" || t === "dark") setModeState(t);
    if (a) setAccentState(a as AccentId);
    setHydrated(true);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    document.documentElement.dataset.theme = m;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, m);
    } catch {
      /* modo privado: se ignora */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setAccent = useCallback((a: AccentId) => {
    setAccentState(a);
    document.documentElement.dataset.accent = a;
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, a);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, accent, hydrated, setMode, toggleMode, setAccent }),
    [mode, accent, hydrated, setMode, toggleMode, setAccent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}
