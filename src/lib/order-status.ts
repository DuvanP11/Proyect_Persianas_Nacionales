/** Estados del pedido (flujo de fabricación) y sus etiquetas/estilos. */

export const ORDER_STATUSES = [
  "RECIBIDO",
  "FABRICACION",
  "CORTE",
  "CONFECCION",
  "DESPACHO",
  "INSTALACION",
  "FINALIZADO",
  "CANCELADO",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_META: Record<string, { text: string; cls: string }> = {
  RECIBIDO: { text: "Recibido", cls: "bg-morado/15 text-morado-light" },
  FABRICACION: { text: "En fabricación", cls: "bg-naranja/15 text-naranja-light" },
  CORTE: { text: "Corte", cls: "bg-naranja/15 text-naranja-light" },
  CONFECCION: { text: "Confección", cls: "bg-naranja/15 text-naranja-light" },
  DESPACHO: { text: "En despacho", cls: "bg-sky-500/15 text-sky-300" },
  INSTALACION: { text: "Instalación", cls: "bg-sky-500/15 text-sky-300" },
  FINALIZADO: { text: "Finalizado", cls: "bg-emerald-600/20 text-emerald-300" },
  CANCELADO: { text: "Cancelado", cls: "bg-red-500/15 text-red-300" },
};
