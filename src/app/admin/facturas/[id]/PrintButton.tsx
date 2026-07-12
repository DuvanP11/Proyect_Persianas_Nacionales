"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
