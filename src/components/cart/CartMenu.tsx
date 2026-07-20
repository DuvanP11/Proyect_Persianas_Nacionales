"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useCart } from "./CartContext";
import { cartToWhatsAppMessage, formatMeters } from "@/lib/cart";
import { CHAIN_SIDE_LABEL } from "@/lib/chain-side";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Ícono de carrito en la barra superior con mini-panel (mini cart).
 * Se abre al pasar el cursor (escritorio) y al tocarlo (móvil). Lista los
 * productos personalizados y permite enviarlos todos por WhatsApp.
 */
export function CartMenu({ className }: { className?: string }) {
  const { items, count, hydrated, bump, removeItem, clear } = useCart();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  // Cierra el panel al hacer clic fuera o con Escape (para el modo táctil).
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

  const openNow = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // Pequeño retardo al salir para poder mover el cursor hacia el panel.
  const closeSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  const waUrl = items.length ? buildWhatsAppUrl(cartToWhatsAppMessage(items)) : "#";
  const badge = hydrated && count > 0;

  return (
    <div
      ref={wrapRef}
      className={cn("relative", className)}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Carrito de cotización${badge ? `, ${count} artículo(s)` : " vacío"}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-cloud transition-colors hover:bg-white/[0.06]"
      >
        <ShoppingCart className="h-5 w-5" />
        <AnimatePresence>
          {badge && (
            <motion.span
              key={bump}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-morado to-naranja px-1 text-[11px] font-bold text-white ring-2 ring-ink"
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="card-premium absolute right-0 top-full z-50 mt-3 w-[min(92vw,22rem)] origin-top-right overflow-hidden p-0"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-cloud">
                Carrito de cotización
                {badge && <span className="ml-1 text-mist">({count})</span>}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar carrito"
                className="text-mist transition-colors hover:text-cloud lg:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!hydrated || items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <ShoppingCart className="mx-auto h-8 w-8 text-mist-2" />
                <p className="mt-3 text-sm text-mist">Tu carrito está vacío.</p>
                <p className="mt-1 text-xs text-mist-2">
                  Personaliza un producto y agrégalo para cotizar.
                </p>
              </div>
            ) : (
              <>
                <ul className="max-h-[min(60vh,26rem)] divide-y divide-line/70 overflow-y-auto">
                  {items.map((it) => (
                    <li key={it.id} className="flex gap-3 px-4 py-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-soft">
                        {it.image ? (
                          <Image
                            src={it.image}
                            alt={it.name}
                            fill
                            unoptimized={it.image.startsWith("/api/uploads/")}
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-surface to-ink-soft" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-medium text-cloud">{it.name}</p>
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            aria-label={`Quitar ${it.name}`}
                            className="shrink-0 text-mist-2 transition-colors hover:text-naranja"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-mist">
                          <span>{it.design}</span>
                          <span className="text-mist-2">·</span>
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="inline-block h-3 w-3 rounded-full ring-1 ring-line"
                              style={{ backgroundColor: it.colorHex }}
                            />
                            {it.color}
                          </span>
                          <span className="text-mist-2">·</span>
                          <span>{it.fabric}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-mist-2">
                          Cantidad: <span className="text-cloud">{it.quantity}</span> · Ancho:{" "}
                          <span className="text-cloud">{formatMeters(it.widthM)} m</span> · Alto:{" "}
                          <span className="text-cloud">{formatMeters(it.heightM)} m</span>
                          {it.motorized != null && (
                            <>
                              {" "}
                              · Motorizada:{" "}
                              <span className="text-cloud">{it.motorized ? "Sí" : "No"}</span>
                            </>
                          )}
                          {it.chainSide != null && (
                            <>
                              {" "}
                              · Mando:{" "}
                              <span className="text-cloud">
                                {CHAIN_SIDE_LABEL[it.chainSide]}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 border-t border-line px-4 py-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-[#25D366]/25 transition-all hover:-translate-y-0.5 hover:brightness-110"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Enviar por WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={clear}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs text-mist-2 transition-colors hover:text-naranja"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Vaciar carrito
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
