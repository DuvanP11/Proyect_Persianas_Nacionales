"use client";

/**
 * Botón de envío que pide confirmación nativa antes de una acción destructiva.
 * Va dentro de un <form action={...}> con progressive enhancement.
 */
export function ConfirmDeleteButton({
  name,
  message,
  label = "Eliminar",
}: {
  name: string;
  message?: string;
  label?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const msg = message ?? `¿Eliminar "${name}"? Esta acción no se puede deshacer.`;
        if (!confirm(msg)) e.preventDefault();
      }}
      className="rounded-md border border-line px-3 py-1.5 text-xs text-mist transition hover:border-red-500/50 hover:text-red-300"
    >
      {label}
    </button>
  );
}
