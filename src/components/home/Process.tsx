import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/** Estados del pedido — mismos que usará el módulo de seguimiento. */
export const orderStates = [
  { key: "recibido", label: "Pedido recibido", color: "#8b5cf6" },
  { key: "fabricacion", label: "En fabricación", color: "#a78bfa" },
  { key: "corte", label: "En corte", color: "#c084fc" },
  { key: "confeccion", label: "En confección", color: "#f472b6" },
  { key: "despacho", label: "En despacho", color: "#fb923c" },
  { key: "instalacion", label: "En instalación", color: "#fb7a1e" },
  { key: "finalizado", label: "Finalizado", color: "#22c55e" },
];

export function Process() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-app">
        <SectionHeading
          eyebrow="Seguimiento de pedidos"
          title="Sabrás en qué va tu pedido, siempre"
          subtitle="Cada pedido tiene un código único con el que podrás consultar su estado en tiempo real, desde que lo recibimos hasta la instalación final."
        />

        <Reveal className="mt-16">
          <ol className="relative flex flex-col gap-6 md:flex-row md:gap-0">
            {/* Línea conectora */}
            <span className="absolute left-4 top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-morado via-naranja to-emerald-500 md:left-0 md:top-4 md:h-px md:w-full md:bg-gradient-to-r" />

            {orderStates.map((s, i) => (
              <li key={s.key} className="relative flex flex-1 items-center gap-4 md:flex-col md:items-start md:gap-3 md:px-2">
                <span
                  className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 bg-ink text-xs font-semibold"
                  style={{ borderColor: s.color, color: s.color }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-cloud md:mt-1">{s.label}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
