"use client";

import { motion } from "motion/react";

/**
 * ============================================================================
 *  FONDO ANIMADO — Componente aislado y reemplazable
 * ============================================================================
 *  Este es el ÚNICO lugar que debes editar para cambiar el fondo de todo el
 *  sitio. Se monta una sola vez en `layout.tsx`, con `position: fixed` detrás
 *  de todo el contenido (z-index negativo).
 *
 *  Para integrar tu fondo personalizado más adelante:
 *   - Reemplaza el contenido de este componente (p. ej. un <canvas>, un video,
 *     shaders, partículas, etc.).
 *   - No necesitas tocar ningún otro archivo del proyecto.
 * ============================================================================
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      {/* Degradado base */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(139,92,246,0.12),transparent),radial-gradient(900px_500px_at_100%_10%,rgba(251,122,30,0.08),transparent)]" />

      {/* Blobs de color flotantes (morado / naranja) */}
      <motion.div
        className="absolute -left-40 top-10 h-[36rem] w-[36rem] rounded-full bg-morado/20 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-10rem] top-1/3 h-[30rem] w-[30rem] rounded-full bg-naranja/15 blur-[120px]"
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-morado-dark/20 blur-[130px]"
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Retícula sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Viñeta inferior para asentar el contenido */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}
