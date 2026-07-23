"use client";

import { Printer } from "lucide-react";

/** Abre el diálogo de impresión del navegador. No se imprime a sí mismo. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 print:hidden"
    >
      <Printer className="h-4 w-4" /> Imprimir
    </button>
  );
}
