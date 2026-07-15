"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Ruler, X } from "lucide-react";
import {
  ALTO_CASOS,
  ALTO_INTRO,
  ANCHO_CASOS,
  ANCHO_INTRO,
  MEASURE_IMAGES,
  MEASURE_IMPORTANTE,
  MEASURE_TIP,
} from "@/lib/measure-guide";
import { cn } from "@/lib/utils";

/**
 * Botón "¿Cómo tomar medidas?" con ventana flotante.
 *
 * Se asoma al pasar el cursor y se fija al hacer clic (en táctil solo aplica el
 * clic, que es el único gesto disponible). Dentro se muestra la misma guía de
 * `/como-medir` — imágenes, holguras y el tip — porque ambas leen
 * `@/lib/measure-guide`.
 *
 * Es un paso obligatorio del pedido: hasta que el cliente no confirme que la
 * leyó, el configurador no deja agregar el producto al carrito. Por eso la
 * confirmación exige el clic explícito en "Ya sé cómo medir" y no basta con que
 * el panel se haya asomado al pasar el cursor.
 *
 * `placement` decide cómo se despliega:
 *   "anchored" — colgado del botón; sirve en la ficha de producto.
 *   "overlay"  — ventana centrada sobre un velo, montada en <body> con portal.
 *                Es la que se usa dentro del modal del catálogo: ese modal tiene
 *                overflow-y-auto y transformaciones de animación, que recortarían
 *                un panel anclado y romperían un `fixed` anidado.
 */
export function MeasureGuideButton({
  confirmed,
  onConfirm,
  placement = "anchored",
}: {
  confirmed: boolean;
  onConfirm: () => void;
  placement?: "anchored" | "overlay";
}) {
  const [open, setOpen] = useState(false);
  // Al fijarse con clic, el panel deja de cerrarse cuando el cursor sale.
  const [pinned, setPinned] = useState(false);
  // El portal solo existe en el cliente; en el render del servidor no hay <body>.
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const overlay = placement === "overlay";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  function close() {
    setOpen(false);
    setPinned(false);
  }

  useEffect(() => {
    if (!open) return;
    // En modo overlay el panel vive en un portal fuera de `wrapRef`, así que un
    // "clic fuera" medido contra wrapRef cerraría al tocar el propio panel. Ahí
    // el cierre lo hace el velo.
    const onDown = (e: MouseEvent) => {
      if (overlay) return;
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, overlay]);

  // El asomo al pasar el cursor solo aplica al panel anclado: abrir un overlay a
  // pantalla completa sin que nadie lo pida sería invasivo.
  const openNow = () => {
    if (overlay) return;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // Retardo al salir: da tiempo a llevar el cursor del botón al panel.
  const closeSoon = () => {
    if (overlay || pinned) return;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  function handleConfirm() {
    onConfirm();
    close();
  }

  const panel = (
    <motion.div
      role="dialog"
      aria-label="Guía para tomar medidas"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "card-premium w-[min(92vw,26rem)] overflow-hidden p-0",
        overlay
          ? "relative z-10 max-h-[92vh] overflow-y-auto"
          : "absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2",
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-cloud">
          <Ruler className="h-4 w-4 text-morado-light" /> Cómo tomar medidas
        </p>
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar guía"
          className="text-mist transition-colors hover:text-cloud"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[min(70vh,32rem)] space-y-4 overflow-y-auto px-4 py-4">
        {MEASURE_IMAGES.map((img) => (
          <figure key={img.src} className="overflow-hidden rounded-xl border border-line bg-white">
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              unoptimized
              style={{ maxWidth: img.width }}
              className="mx-auto h-auto w-full"
            />
            <figcaption className="border-t border-line/60 px-3 py-2 text-center text-[11px] text-mist-2">
              {img.caption}
            </figcaption>
          </figure>
        ))}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-morado-light">
            Ancho (X)
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-mist">{ANCHO_INTRO}</p>
          <ul className="mt-1.5 space-y-1">
            {ANCHO_CASOS.map((c) => (
              <li key={c.caso} className="flex justify-between gap-3 text-xs">
                <span className="text-mist">{c.caso}</span>
                <span className="shrink-0 font-medium text-cloud">{c.formula}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-naranja-light">
            Alto (Y)
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-mist">{ALTO_INTRO}</p>
          <ul className="mt-1.5 space-y-1">
            {ALTO_CASOS.map((c) => (
              <li key={c.caso} className="flex justify-between gap-3 text-xs">
                <span className="text-mist">{c.caso}</span>
                <span className="shrink-0 font-medium text-cloud">{c.formula}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="rounded-lg border border-naranja/30 bg-naranja/[0.07] p-3 text-[11px] leading-relaxed text-mist">
          <span className="font-medium text-naranja-light">Importante:</span> {MEASURE_IMPORTANTE}
        </p>

        <p className="rounded-lg border border-morado/25 bg-morado/[0.06] p-3 text-[11px] leading-relaxed text-mist">
          <span className="font-medium text-cloud">Tip:</span> {MEASURE_TIP}
        </p>

        <Link
          href="/como-medir"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-morado-light transition-colors hover:text-cloud"
        >
          Ver la guía completa <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={handleConfirm}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-morado to-naranja px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5"
        >
          <Check className="h-4 w-4" />
          {confirmed ? "Entendido" : "Ya sé cómo medir"}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div ref={wrapRef} className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => {
          const next = !pinned;
          setPinned(next);
          setOpen(next);
        }}
        onFocus={openNow}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "inline-flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-colors",
          confirmed
            ? "border-[#25D366]/40 bg-[#25D366]/[0.08] text-cloud"
            : "border-morado/40 bg-morado/[0.06] text-cloud hover:border-morado/70",
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Ruler className="h-4 w-4 text-morado-light" />
          ¿Cómo tomar medidas?
        </span>
        {confirmed ? (
          <span className="inline-flex items-center gap-1 text-xs text-[#25D366]">
            <Check className="h-3.5 w-3.5" /> Listo
          </span>
        ) : (
          <span className="rounded-full bg-morado/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-morado-light">
            Obligatorio
          </span>
        )}
      </button>

      {overlay ? (
        mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={close}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  aria-hidden="true"
                />
                {panel}
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )
      ) : (
        <AnimatePresence>{open && panel}</AnimatePresence>
      )}
    </div>
  );
}
