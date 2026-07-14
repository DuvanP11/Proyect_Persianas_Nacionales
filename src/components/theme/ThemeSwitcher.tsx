"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { ACCENTS } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Selector de tema: modo claro/oscuro + paleta de acentos corporativos.
 * Accesible para cualquier visitante desde la barra superior.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { mode, accent, setMode, setAccent } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cambiar tema y color del sitio"
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cloud transition-colors hover:bg-white/[0.06]"
      >
        <Palette className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-label="Apariencia"
            className="card-premium absolute right-0 top-full z-50 mt-3 w-64 origin-top-right p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-mist-2">Modo</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("light")}
                aria-pressed={mode === "light"}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                  mode === "light"
                    ? "border-morado/60 bg-morado/10 text-cloud"
                    : "border-line bg-white/[0.02] text-mist hover:text-cloud",
                )}
              >
                <Sun className="h-4 w-4" /> Claro
              </button>
              <button
                type="button"
                onClick={() => setMode("dark")}
                aria-pressed={mode === "dark"}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                  mode === "dark"
                    ? "border-morado/60 bg-morado/10 text-cloud"
                    : "border-line bg-white/[0.02] text-mist hover:text-cloud",
                )}
              >
                <Moon className="h-4 w-4" /> Oscuro
              </button>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-mist-2">
              Color del sitio
            </p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              {ACCENTS.map((a) => {
                const active = accent === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAccent(a.id)}
                    aria-pressed={active}
                    aria-label={a.label}
                    title={a.label}
                    className={cn(
                      "relative h-9 w-9 rounded-full ring-1 ring-line transition-transform hover:scale-110",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-morado",
                      active && "ring-2 ring-morado ring-offset-2 ring-offset-ink",
                    )}
                    style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                  >
                    {active && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
