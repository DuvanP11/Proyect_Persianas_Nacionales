import { ORDER_STATUSES, ORDER_META } from "@/lib/order-status";

/** Etapas del flujo (sin CANCELADO), en orden. */
const FLOW = ORDER_STATUSES.filter((s) => s !== "CANCELADO");

/**
 * Línea de tiempo del pedido: 7 etapas numeradas con la actual resaltada.
 * La actualiza el administrador (cambiando el estado) y la ve el cliente.
 */
export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELADO") {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        Este pedido fue cancelado.
      </div>
    );
  }

  const currentIdx = Math.max(0, FLOW.indexOf(status as (typeof FLOW)[number]));

  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-[680px] items-start">
        {FLOW.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const label = ORDER_META[s]?.text ?? s;
          return (
            <li key={s} className="relative flex flex-1 flex-col items-center px-1">
              {/* Segmento de unión hacia la etapa anterior */}
              {i > 0 && (
                <span
                  className={`absolute right-1/2 top-4 -z-0 h-0.5 w-full ${
                    i <= currentIdx ? "bg-gradient-to-r from-morado to-naranja" : "bg-line"
                  }`}
                />
              )}
              <span
                className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-semibold transition ${
                  done
                    ? "border-transparent bg-gradient-to-br from-morado to-naranja text-white"
                    : active
                      ? "border-naranja bg-ink text-naranja ring-4 ring-naranja/20"
                      : "border-line bg-ink text-mist-2"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`mt-2 text-center text-[11px] leading-tight ${
                  active ? "font-semibold text-cloud" : done ? "text-mist" : "text-mist-2"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
