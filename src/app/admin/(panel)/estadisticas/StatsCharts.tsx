"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import type { Stats } from "@/lib/stats";
import { formatCOP } from "@/lib/utils";

/**
 * Gráficos del panel de estadísticas.
 *
 * Chart.js se registra UNA sola vez aquí (tree-shaking: solo los elementos
 * que se usan). Todos los gráficos comparten la misma paleta y las mismas
 * opciones base para que el módulo se lea como un conjunto y no como cuatro
 * widgets sueltos.
 *
 * Los colores se declaran en RGBA literal en vez de leer los tokens del tema:
 * Chart.js dibuja sobre `<canvas>`, donde las variables CSS no se resuelven.
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

const MORADO = "rgba(139, 92, 246, 1)";
const MORADO_SUAVE = "rgba(139, 92, 246, 0.18)";
const NARANJA = "rgba(251, 122, 30, 1)";
const TINTA = "rgba(190, 190, 205, 1)"; // texto de ejes, legible en oscuro y claro
const REJILLA = "rgba(255, 255, 255, 0.07)";

/** Paleta cíclica para los gráficos de categorías. */
const PALETA = [
  "rgba(139, 92, 246, 0.85)",
  "rgba(251, 122, 30, 0.85)",
  "rgba(56, 189, 248, 0.85)",
  "rgba(52, 211, 153, 0.85)",
  "rgba(244, 114, 182, 0.85)",
  "rgba(250, 204, 21, 0.85)",
  "rgba(148, 163, 184, 0.85)",
  "rgba(167, 139, 250, 0.85)",
];

/**
 * Base de las opciones para gráficos con ejes.
 *
 * Se declara sin tipar y se especializa por gráfico (`ejesBar`, `ejesLine`):
 * los tipos de Chart.js son invariantes respecto al tipo de gráfico, así que
 * una constante `ChartOptions<"bar" | "line">` no encaja en ninguno de los dos.
 */
const ejesBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: TINTA }, grid: { display: false } },
    y: { ticks: { color: TINTA }, grid: { color: REJILLA }, beginAtZero: true },
  },
} as const;

const ejesBar: ChartOptions<"bar"> = ejesBase;
const ejesLine: ChartOptions<"line"> = ejesBase;
/** Igual que `ejesBar` pero con las barras en horizontal (rankings). */
const ejesBarH: ChartOptions<"bar"> = { ...ejesBase, indexAxis: "y" };

export function StatsCharts({ stats }: { stats: Stats }) {
  const { ventas, productos, clientes, produccion } = stats;

  const sinDatos = ventas.serie.length === 0;

  return (
    <div className="space-y-6">
      {/* Evolución de ventas (área) */}
      <section className="rounded-2xl border border-line bg-surface/60 p-5">
        <h2 className="mb-1 font-display text-lg text-cloud">Evolución de ventas</h2>
        <p className="mb-4 text-xs text-mist-2">Total facturado por periodo.</p>
        <div className="h-64">
          {sinDatos ? (
            <Vacio mensaje="No hay facturas en este periodo." />
          ) : (
            <Line
              data={{
                labels: ventas.serie.map((p) => p.label),
                datasets: [
                  {
                    label: "Facturado",
                    data: ventas.serie.map((p) => p.total),
                    borderColor: MORADO,
                    backgroundColor: MORADO_SUAVE,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                    pointBackgroundColor: MORADO,
                  },
                ],
              }}
              options={{
                ...ejesLine,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx: TooltipItem<"line">) => formatCOP(ctx.parsed.y ?? 0),
                    },
                  },
                },
              }}
            />
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Productos más vendidos (barras) */}
        <section className="rounded-2xl border border-line bg-surface/60 p-5">
          <h2 className="mb-1 font-display text-lg text-cloud">Productos más vendidos</h2>
          <p className="mb-4 text-xs text-mist-2">Unidades facturadas.</p>
          <div className="h-72">
            {productos.top.length === 0 ? (
              <Vacio mensaje="Todavía no hay productos facturados." />
            ) : (
              <Bar
                data={{
                  labels: productos.top.map((p) => p.name),
                  datasets: [
                    {
                      label: "Unidades",
                      data: productos.top.map((p) => p.unidades),
                      backgroundColor: PALETA,
                      borderRadius: 6,
                    },
                  ],
                }}
                options={ejesBarH}
              />
            )}
          </div>
        </section>

        {/* Ingresos por producto (dona) */}
        <section className="rounded-2xl border border-line bg-surface/60 p-5">
          <h2 className="mb-1 font-display text-lg text-cloud">Ingresos por producto</h2>
          <p className="mb-4 text-xs text-mist-2">Participación en el total facturado.</p>
          <div className="h-72">
            {productos.top.length === 0 ? (
              <Vacio mensaje="Sin ingresos registrados." />
            ) : (
              <Doughnut
                data={{
                  labels: productos.top.map((p) => p.name),
                  datasets: [
                    {
                      data: productos.top.map((p) => p.ingresos),
                      backgroundColor: PALETA,
                      borderColor: "rgba(0,0,0,0.25)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "right", labels: { color: TINTA, boxWidth: 12 } },
                    tooltip: {
                      callbacks: {
                        label: (ctx: TooltipItem<"doughnut">) => formatCOP(ctx.parsed ?? 0),
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </section>

        {/* Producción (barras) */}
        <section className="rounded-2xl border border-line bg-surface/60 p-5">
          <h2 className="mb-1 font-display text-lg text-cloud">Pedidos por estado</h2>
          <p className="mb-4 text-xs text-mist-2">Cómo está repartida la producción.</p>
          <div className="h-72">
            <Bar
              data={{
                labels: produccion.map((p) => p.etiqueta),
                datasets: [
                  {
                    label: "Pedidos",
                    data: produccion.map((p) => p.cantidad),
                    backgroundColor: NARANJA,
                    borderRadius: 6,
                  },
                ],
              }}
              options={ejesBar}
            />
          </div>
        </section>

        {/* Mejores clientes (barras) */}
        <section className="rounded-2xl border border-line bg-surface/60 p-5">
          <h2 className="mb-1 font-display text-lg text-cloud">Clientes con más compras</h2>
          <p className="mb-4 text-xs text-mist-2">Número de facturas en el periodo.</p>
          <div className="h-72">
            {clientes.top.length === 0 ? (
              <Vacio mensaje="Sin clientes facturados en este periodo." />
            ) : (
              <Bar
                data={{
                  labels: clientes.top.map((c) => c.name),
                  datasets: [
                    {
                      label: "Compras",
                      data: clientes.top.map((c) => c.compras),
                      backgroundColor: PALETA,
                      borderRadius: 6,
                    },
                  ],
                }}
                options={ejesBarH}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/** Marcador para cuando un gráfico no tiene datos que mostrar. */
function Vacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-line">
      <p className="text-sm text-mist-2">{mensaje}</p>
    </div>
  );
}
