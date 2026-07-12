"use client";

/**
 * Botón de envío que pide confirmación nativa antes de borrar.
 * Va dentro de un <form action={deleteProduct}> en la lista de productos.
 */
export function ConfirmDeleteButton({ name }: { name: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
      className="rounded-md border border-line px-3 py-1.5 text-xs text-mist transition hover:border-red-500/50 hover:text-red-300"
    >
      Eliminar
    </button>
  );
}
