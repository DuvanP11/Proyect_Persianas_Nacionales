/**
 * Tematización del sitio — Cortinería Nacional.
 *
 * Permite a cualquier visitante cambiar el modo (claro/oscuro) y el color de
 * acento entre los colores corporativos. La preferencia se guarda en
 * localStorage y se aplica como atributos `data-theme` / `data-accent` en
 * <html>; las variables CSS de `globals.css` hacen el resto.
 */

export type ThemeMode = "dark" | "light";
export type AccentId = "morado" | "naranja" | "rosa" | "celeste" | "gris";

export const THEME_STORAGE_KEY = "cn_theme";
export const ACCENT_STORAGE_KEY = "cn_accent";

export const DEFAULT_MODE: ThemeMode = "dark";
export const DEFAULT_ACCENT: AccentId = "morado";

/** Acentos disponibles con su muestra (degradado primario → secundario). */
export const ACCENTS: { id: AccentId; label: string; from: string; to: string }[] = [
  { id: "morado", label: "Morado", from: "#8b5cf6", to: "#fb7a1e" },
  { id: "naranja", label: "Naranja", from: "#fb7a1e", to: "#f59e0b" },
  { id: "rosa", label: "Rosa salmón", from: "#e84d6f", to: "#fb7185" },
  { id: "celeste", label: "Celeste", from: "#2b9fe0", to: "#38bdf8" },
  { id: "gris", label: "Gris", from: "#64748b", to: "#94a3b8" },
];

/**
 * Script que corre ANTES de pintar (se inyecta en el <body>) para aplicar el
 * tema guardado y evitar el parpadeo (FOUC). Se mantiene minúsculo y tolerante
 * a fallos (modo privado, etc.).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('${THEME_STORAGE_KEY}');var a=localStorage.getItem('${ACCENT_STORAGE_KEY}');d.dataset.theme=(t==='light'||t==='dark')?t:'${DEFAULT_MODE}';d.dataset.accent=a||'${DEFAULT_ACCENT}';}catch(e){var d2=document.documentElement;d2.dataset.theme='${DEFAULT_MODE}';d2.dataset.accent='${DEFAULT_ACCENT}';}})();`;
