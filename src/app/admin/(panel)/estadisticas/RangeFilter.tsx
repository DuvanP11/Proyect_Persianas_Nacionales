"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { RANGE_LABEL, RANGE_PRESETS, type RangePreset } from "@/lib/stats-range";

/**
 * Filtro de periodo del panel de estadísticas.
 *
 * El rango vive en la URL (`?rango=mes` o `?desde=…&hasta=…`), no en estado
 * local: así el periodo se puede compartir por enlace, sobrevive a un refresco
 * y deja que la página siga siendo un Server Component que consulta la base
 * una sola vez con el rango ya resuelto.
 */
export function RangeFilter({ activo }: { activo: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const [desde, setDesde] = useState(params.get("desde") ?? "");
  const [hasta, setHasta] = useState(params.get("hasta") ?? "");

  /** Aplica un preajuste y limpia el rango personalizado. */
  function aplicarPreset(preset: RangePreset) {
    router.push(`/admin/estadisticas?rango=${preset}`);
  }

  function aplicarPersonalizado(e: React.FormEvent) {
    e.preventDefault();
    if (!desde || !hasta) return;
    router.push(
      `/admin/estadisticas?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`,
    );
  }

  const usandoPersonalizado = Boolean(params.get("desde") && params.get("hasta"));
  const input =
    "rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-cloud outline-none focus:border-morado [color-scheme:dark]";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        {RANGE_PRESETS.map((preset) => {
          const seleccionado = !usandoPersonalizado && activo === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => aplicarPreset(preset)}
              aria-pressed={seleccionado}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                seleccionado
                  ? "border-morado bg-morado/20 font-medium text-cloud"
                  : "border-line text-mist hover:border-morado/50 hover:text-cloud"
              }`}
            >
              {RANGE_LABEL[preset]}
            </button>
          );
        })}
      </div>

      <form onSubmit={aplicarPersonalizado} className="flex flex-wrap items-center gap-2">
        <CalendarRange className="h-4 w-4 text-morado-light" />
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          aria-label="Desde"
          className={input}
        />
        <span className="text-xs text-mist-2">a</span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          aria-label="Hasta"
          className={input}
        />
        <button
          type="submit"
          disabled={!desde || !hasta}
          className={`rounded-full border px-3.5 py-1.5 text-xs transition disabled:opacity-40 ${
            usandoPersonalizado
              ? "border-morado bg-morado/20 text-cloud"
              : "border-line text-mist hover:border-morado/50 hover:text-cloud"
          }`}
        >
          Aplicar
        </button>
      </form>
    </div>
  );
}
