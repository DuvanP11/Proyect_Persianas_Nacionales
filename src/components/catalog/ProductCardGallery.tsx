"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductMedia } from "./ProductMedia";
import { cn } from "@/lib/utils";

/**
 * Carrusel de la tarjeta del catálogo: pasa las fotos solo y deja flechas para
 * moverlas a mano, sin salir de la cuadrícula.
 *
 * Decisiones que no se ven pero importan:
 *
 * - Se muestran como mucho `MAX_FOTOS`. Hanas Vintage tiene 49; rotarlas todas
 *   en una tarjeta no aporta y obligaría al visitante a descargarlas.
 * - Solo se montan la foto activa y la siguiente. Las nueve tarjetas están en
 *   pantalla a la vez: montar todas las fotos de todas dispararía decenas de
 *   descargas de golpe. La siguiente se monta invisible para que el cruce no
 *   parpadee.
 * - El giro automático arranca con un desfase derivado del slug. Sin él las
 *   nueve tarjetas cambian al unísono y parece un cartel publicitario.
 * - Se pausa al pasar el cursor o al enfocar con el teclado: si alguien está
 *   mirando una foto o usando las flechas, el temporizador no debe pelearle.
 * - Con "reducir movimiento" activado no gira solo; las flechas siguen ahí.
 */

const MAX_FOTOS = 6;
const INTERVALO_MS = 3800;

/** Desfase estable por producto (0-1800 ms). Determinista: mismo valor en
 *  servidor y cliente, así la hidratación no se queja. */
function desfaseDe(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 1800;
}

export function ProductCardGallery({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const fotos = product.images.slice(0, MAX_FOTOS);
  const total = fotos.length;

  const [activa, setActiva] = useState(0);
  const [pausada, setPausada] = useState(false);
  const [sinMovimiento, setSinMovimiento] = useState(false);
  const timers = useRef<{ inicio?: number; ciclo?: number }>({});

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSinMovimiento(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSinMovimiento(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const siguiente = useCallback(() => setActiva((i) => (i + 1) % total), [total]);
  const anterior = useCallback(() => setActiva((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (total <= 1 || pausada || sinMovimiento) return;

    const t = timers.current;
    t.inicio = window.setTimeout(() => {
      siguiente();
      t.ciclo = window.setInterval(siguiente, INTERVALO_MS);
    }, desfaseDe(product.slug) + INTERVALO_MS);

    return () => {
      if (t.inicio) window.clearTimeout(t.inicio);
      if (t.ciclo) window.clearInterval(t.ciclo);
    };
  }, [total, pausada, sinMovimiento, siguiente, product.slug]);

  // Sin fotos: el placeholder degradado de siempre.
  if (total === 0) {
    return (
      <Link href={`/catalogo/${product.slug}`} className="block">
        <ProductMedia product={product} className="aspect-[4/3]" priority={priority} />
      </Link>
    );
  }

  const proxima = (activa + 1) % total;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPausada(true)}
      onMouseLeave={() => setPausada(false)}
      onFocusCapture={() => setPausada(true)}
      onBlurCapture={() => setPausada(false)}
    >
      {/* La foto navega a la ficha. Flechas y puntos van FUERA del enlace: un
          <button> dentro de un <a> es HTML inválido y el clic navegaría. */}
      <Link href={`/catalogo/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-soft">
          <AnimatePresence initial={false}>
            <motion.div
              key={activa}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={fotos[activa]}
                alt={`${product.name} — foto ${activa + 1} de ${total}`}
                fill
                priority={priority && activa === 0}
                unoptimized={fotos[activa].startsWith("/api/uploads/")}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </AnimatePresence>

          {/* Precarga invisible de la siguiente: evita el parpadeo del cruce. */}
          {total > 1 && (
            <Image
              src={fotos[proxima]}
              alt=""
              aria-hidden
              fill
              unoptimized={fotos[proxima].startsWith("/api/uploads/")}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="pointer-events-none object-cover opacity-0"
            />
          )}
        </div>
      </Link>

      {total > 1 && (
        <>
          <FlechaCarrusel lado="izquierda" onClick={anterior} nombre={product.name} />
          <FlechaCarrusel lado="derecha" onClick={siguiente} nombre={product.name} />

          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {fotos.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activa ? "w-4 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FlechaCarrusel({
  lado,
  onClick,
  nombre,
}: {
  lado: "izquierda" | "derecha";
  onClick: () => void;
  nombre: string;
}) {
  const esIzquierda = lado === "izquierda";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${esIzquierda ? "Anterior" : "Siguiente"} foto de ${nombre}`}
      className={cn(
        "absolute top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full",
        "bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-black/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        // En escritorio se asoman al pasar el cursor; en táctil no hay hover,
        // así que ahí quedan siempre visibles.
        "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100",
        esIzquierda ? "left-2" : "right-2",
      )}
    >
      {esIzquierda ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  );
}
