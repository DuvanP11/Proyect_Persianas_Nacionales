/**
 * Rango de fechas del panel de estadísticas — lógica PURA.
 *
 * Vive separado de `lib/stats.ts` (que es `server-only` porque consulta la
 * base) para que el filtro, que es un componente de cliente, pueda importar
 * los preajustes y sus etiquetas sin arrastrar Prisma al navegador.
 */

// ---------------------------------------------------------------------------
//  Rango de fechas
// ---------------------------------------------------------------------------

export const RANGE_PRESETS = ["dia", "semana", "mes", "ano", "todo"] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export const RANGE_LABEL: Record<RangePreset, string> = {
  dia: "Hoy",
  semana: "Esta semana",
  mes: "Este mes",
  ano: "Este año",
  todo: "Todo",
};

export interface DateRange {
  from: Date;
  to: Date;
  /** Etiqueta legible del periodo, para los títulos. */
  label: string;
  /** Granularidad con la que conviene agrupar la serie temporal. */
  bucket: "hora" | "dia" | "mes";
}

/** Inicio del día (00:00:00) de una fecha. */
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Fin del día (23:59:59.999). */
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * Traduce el filtro de la interfaz a un rango concreto.
 *
 * `desde`/`hasta` (rango personalizado) tienen prioridad sobre el preajuste.
 * La semana empieza en LUNES, como se cuenta en Colombia.
 */
export function resolveRange(
  preset: string | undefined,
  desde?: string,
  hasta?: string,
): DateRange {
  if (desde && hasta) {
    const from = startOfDay(new Date(desde));
    const to = endOfDay(new Date(hasta));
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
      const dias = Math.round((to.getTime() - from.getTime()) / 86_400_000);
      return {
        from,
        to,
        label: `${from.toLocaleDateString("es-CO")} – ${to.toLocaleDateString("es-CO")}`,
        bucket: dias > 62 ? "mes" : "dia",
      };
    }
  }

  const now = new Date();
  const key = (RANGE_PRESETS as readonly string[]).includes(preset ?? "")
    ? (preset as RangePreset)
    : "mes";

  switch (key) {
    case "dia":
      return { from: startOfDay(now), to: endOfDay(now), label: RANGE_LABEL.dia, bucket: "hora" };
    case "semana": {
      const from = startOfDay(now);
      // getDay(): 0 = domingo. Se corrige para que la semana arranque el lunes.
      const offset = (now.getDay() + 6) % 7;
      from.setDate(from.getDate() - offset);
      return { from, to: endOfDay(now), label: RANGE_LABEL.semana, bucket: "dia" };
    }
    case "ano": {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from, to: endOfDay(now), label: RANGE_LABEL.ano, bucket: "mes" };
    }
    case "todo":
      return { from: new Date(2000, 0, 1), to: endOfDay(now), label: RANGE_LABEL.todo, bucket: "mes" };
    case "mes":
    default: {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: endOfDay(now), label: RANGE_LABEL.mes, bucket: "dia" };
    }
  }
}

