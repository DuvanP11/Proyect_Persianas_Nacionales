import { Suspense } from "react";
import {
  Boxes,
  FileText,
  PackageCheck,
  Receipt,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { getStats, resolveRange } from "@/lib/stats";
import { formatCOP } from "@/lib/utils";
import { RangeFilter } from "./RangeFilter";
import { StatsCharts } from "./StatsCharts";

export const dynamic = "force-dynamic";

/**
 * Panel de estadísticas.
 *
 * Server Component: consulta la base una sola vez con el rango ya resuelto y
 * le pasa al cliente datos planos y listos para pintar. Los gráficos son lo
 * único que corre en el navegador.
 */
export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string; desde?: string; hasta?: string }>;
}) {
  const { rango, desde, hasta } = await searchParams;
  const range = resolveRange(rango, desde, hasta);
  const stats = await getStats(range);
  const { ventas, productos, clientes, produccion } = stats;

  const enProduccion = produccion
    .filter((p) => !["FINALIZADO", "CANCELADO"].includes(p.estado))
    .reduce((s, p) => s + p.cantidad, 0);
  const finalizados = produccion.find((p) => p.estado === "FINALIZADO")?.cantidad ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cloud">Estadísticas</h1>
        <p className="mt-1 text-sm text-mist-2">
          Periodo: <span className="text-mist">{stats.rango.label}</span>
        </p>
      </div>

      {/* El filtro usa useSearchParams, que exige un límite de Suspense. */}
      <Suspense fallback={<div className="h-9" />}>
        <RangeFilter activo={rango ?? "mes"} />
      </Suspense>

      {/* Tarjetas KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<Receipt className="h-4 w-4" />}
          label="Facturado"
          value={formatCOP(ventas.facturado)}
          hint={`${ventas.numFacturas} factura${ventas.numFacturas === 1 ? "" : "s"}`}
        />
        <Kpi
          icon={<PackageCheck className="h-4 w-4" />}
          label="Entregado"
          value={formatCOP(ventas.entregado)}
          hint="Facturas de pedidos finalizados"
        />
        <Kpi
          icon={<TrendingUp className="h-4 w-4" />}
          label="Ticket promedio"
          value={formatCOP(ventas.ticketPromedio)}
          hint="Por factura emitida"
        />
        <Kpi
          icon={<FileText className="h-4 w-4" />}
          label="En pedidos"
          value={formatCOP(ventas.enPedidos)}
          hint="Suma de los pedidos del periodo"
        />
        <Kpi
          icon={<Boxes className="h-4 w-4" />}
          label="En producción"
          value={String(enProduccion)}
          hint="Pedidos sin finalizar"
        />
        <Kpi
          icon={<PackageCheck className="h-4 w-4" />}
          label="Finalizados"
          value={String(finalizados)}
          hint="Pedidos entregados"
        />
        <Kpi
          icon={<UserPlus className="h-4 w-4" />}
          label="Clientes nuevos"
          value={String(clientes.nuevos)}
          hint={`${clientes.total} en total`}
        />
        <Kpi
          icon={<Users className="h-4 w-4" />}
          label="Clientes frecuentes"
          value={String(clientes.frecuentes)}
          hint="Más de una compra en el periodo"
        />
      </div>

      <StatsCharts stats={stats} />

      {/* Detalle tabular: lo que un gráfico no deja leer con precisión */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Tabla
          titulo="Detalle por producto"
          vacio="Todavía no hay productos facturados en este periodo."
          columnas={["Producto", "Unidades", "Ingresos"]}
          filas={productos.top.map((p) => [p.name, String(p.unidades), formatCOP(p.ingresos)])}
        />
        <Tabla
          titulo="Menos vendidos"
          vacio="Sin datos suficientes."
          columnas={["Producto", "Unidades", "Ingresos"]}
          filas={productos.menos.map((p) => [p.name, String(p.unidades), formatCOP(p.ingresos)])}
        />
      </div>

      {/* Aclaración honesta sobre un dato que no se puede calcular todavía */}
      <p className="rounded-xl border border-line bg-surface/40 px-4 py-3 text-xs leading-relaxed text-mist-2">
        <strong className="text-mist">Sobre “total recibido”:</strong> el sistema aún no
        registra pagos, así que no es posible saber cuánto se ha cobrado de verdad. “Facturado”
        es lo emitido y “Entregado” es lo facturado en pedidos ya finalizados —lo más cercano
        con los datos actuales—. Para un dato real de caja haría falta un módulo de pagos.
      </p>
    </div>
  );
}

/** Tarjeta de indicador. */
function Kpi({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-4">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-mist-2">
        <span className="text-morado-light">{icon}</span>
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-cloud">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-mist-2">{hint}</p>}
    </div>
  );
}

/** Tabla simple de apoyo a los gráficos. */
function Tabla({
  titulo,
  columnas,
  filas,
  vacio,
}: {
  titulo: string;
  columnas: string[];
  filas: string[][];
  vacio: string;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface/60 p-5">
      <h2 className="mb-4 font-display text-lg text-cloud">{titulo}</h2>
      {filas.length === 0 ? (
        <p className="text-sm text-mist-2">{vacio}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-mist-2">
                {columnas.map((c, i) => (
                  <th key={c} className={`pb-2 font-medium ${i > 0 ? "text-right" : ""}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => (
                <tr key={i} className="border-b border-line/50 last:border-0">
                  {fila.map((celda, j) => (
                    <td
                      key={j}
                      className={`py-2 ${j > 0 ? "text-right text-mist" : "text-cloud"}`}
                    >
                      {celda}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
