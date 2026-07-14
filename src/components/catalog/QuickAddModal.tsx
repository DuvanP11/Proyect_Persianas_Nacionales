"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, X } from "lucide-react";
import { ProductConfigurator } from "./ProductConfigurator";
import type { Product } from "@/lib/products";

/**
 * Botón "Agregar al carrito" para las tarjetas del catálogo. Abre un modal ligero
 * con el mismo configurador de la ficha, para no saturar la cuadrícula.
 */
export function CardAddToCart({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-morado to-naranja px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-morado/40"
      >
        <ShoppingBag className="h-4 w-4" /> Agregar
      </button>

      <ConfigModal product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ConfigModal({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  // Cierra con Escape y bloquea el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`Personalizar ${product.name}`}
        >
          {/* Fondo */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="card-premium relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-2xl p-5 sm:rounded-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-mist transition-colors hover:bg-white/[0.06] hover:text-cloud"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4 pr-10">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-soft">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    unoptimized={product.images[0].startsWith("/api/uploads/")}
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient}`} />
                )}
              </div>
              <div>
                {product.category && (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-morado-light">
                    {product.category.name}
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-cloud">{product.name}</h3>
              </div>
            </div>

            <div className="mt-5">
              <ProductConfigurator product={product} variant="compact" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
