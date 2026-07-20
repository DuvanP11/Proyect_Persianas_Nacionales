/**
 * Posición del mando (cadenilla) — Cortinería Nacional.
 *
 * Fuente única de los valores y sus etiquetas. La usan el configurador del
 * catálogo, el carrito, la cotización, el pedido, la factura y el panel, para
 * que todos guarden y muestren exactamente lo mismo.
 *
 * Se guarda como texto (no como enum de Prisma) para no obligar a una migración
 * de tipo cada vez que aparezca una posición nueva; la validación vive aquí.
 */

export const CHAIN_SIDES = ["IZQUIERDA", "DERECHA"] as const;

export type ChainSide = (typeof CHAIN_SIDES)[number];

/** Etiqueta que ve el cliente para cada posición. */
export const CHAIN_SIDE_LABEL: Record<ChainSide, string> = {
  IZQUIERDA: "Cadenilla izquierda",
  DERECHA: "Cadenilla derecha",
};

/** Posición usada cuando el producto admite la opción y no se eligió otra. */
export const DEFAULT_CHAIN_SIDE: ChainSide = "DERECHA";

/** `true` si el valor es una posición válida. */
export function isChainSide(value: unknown): value is ChainSide {
  return typeof value === "string" && CHAIN_SIDES.includes(value as ChainSide);
}

/**
 * Normaliza un valor cualquiera (formulario, API, columna de la BD) a una
 * posición válida, o `null` si no aplica. Evita que un dato viejo o manipulado
 * se cuele hasta la factura.
 */
export function toChainSide(value: unknown): ChainSide | null {
  if (value == null) return null;
  const upper = String(value).trim().toUpperCase();
  return isChainSide(upper) ? upper : null;
}

/** Etiqueta legible de un valor sin validar; `null` si no aplica. */
export function chainSideLabel(value: unknown): string | null {
  const side = toChainSide(value);
  return side ? CHAIN_SIDE_LABEL[side] : null;
}
