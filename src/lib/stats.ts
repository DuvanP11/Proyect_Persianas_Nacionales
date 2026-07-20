import "server-only";

import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import type { DateRange } from "@/lib/stats-range";

// Se re-exportan para que el servidor pueda pedir todo a `lib/stats`.
export { RANGE_PRESETS, RANGE_LABEL, resolveRange } from "@/lib/stats-range";
export type { RangePreset, DateRange } from "@/lib/stats-range";

/**
 * Estadísticas del negocio — Cortinería Nacional.
 *
 * Todas las cifras salen de la base de datos; nada está precalculado ni
 * cacheado, así que el panel siempre refleja el estado real.
 *
 * ⚠️ NOTA SOBRE "TOTAL RECIBIDO": el sistema todavía NO registra pagos (no
 * existe un módulo de cobros). Por eso aquí se reportan dos cosas distintas y
 * bien diferenciadas, en vez de inventar un dato:
 *   · `facturado`  — suma de las facturas emitidas;
 *   · `entregado`  — facturas de pedidos ya FINALIZADOS, lo más cercano a
 *                    "recibido" que se puede afirmar con los datos actuales.
 *
 * Rendimiento: se agrupa en la base con `groupBy`/`aggregate` en lugar de
 * traer filas y sumar en memoria, y las consultas independientes van en
 * paralelo con `Promise.all`.
 */

// ---------------------------------------------------------------------------
//  Resultado
// ---------------------------------------------------------------------------

export interface SalesPoint {
  /** Etiqueta del punto en el eje X ("14 jul", "10:00", "mar 2026"). */
  label: string;
  total: number;
  cantidad: number;
}

export interface ProductStat {
  name: string;
  unidades: number;
  ingresos: number;
}

export interface CustomerStat {
  name: string;
  compras: number;
  total: number;
}

export interface Stats {
  rango: { label: string; from: string; to: string };
  ventas: {
    facturado: number;
    entregado: number;
    enPedidos: number;
    numFacturas: number;
    ticketPromedio: number;
    serie: SalesPoint[];
  };
  productos: {
    top: ProductStat[];
    menos: ProductStat[];
  };
  clientes: {
    top: CustomerStat[];
    nuevos: number;
    frecuentes: number;
    total: number;
  };
  produccion: { estado: OrderStatus; etiqueta: string; cantidad: number }[];
}

/** Nombre corto del mes, para las etiquetas de las series. */
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Clave de agrupación de una fecha según la granularidad del rango. */
function bucketKey(date: Date, bucket: DateRange["bucket"]): string {
  if (bucket === "hora") return `${String(date.getHours()).padStart(2, "0")}:00`;
  if (bucket === "mes") return `${MESES[date.getMonth()]} ${date.getFullYear()}`;
  return `${date.getDate()} ${MESES[date.getMonth()]}`;
}

/**
 * Calcula todas las estadísticas del rango indicado.
 *
 * Devuelve una estructura plana y ya formateada para que el componente de
 * gráficos (cliente) no tenga que hacer cuentas ni conocer el modelo de datos.
 */
export async function getStats(range: DateRange): Promise<Stats> {
  const enRango = { gte: range.from, lte: range.to };

  const [facturas, items, pedidosPorEstado, clientesNuevos, clientesTotal, pedidosAgg] =
    await Promise.all([
      // Facturas del periodo, con el estado del pedido para poder distinguir
      // lo entregado de lo simplemente facturado.
      prisma.invoice.findMany({
        where: { issuedAt: enRango },
        select: {
          amount: true,
          issuedAt: true,
          customerId: true,
          customer: { select: { firstName: true, lastName: true } },
          order: { select: { status: true } },
        },
      }),
      // Líneas facturadas: la fuente real de "qué se vende".
      prisma.invoiceItem.findMany({
        where: { invoice: { issuedAt: enRango } },
        select: { name: true, quantity: true, lineTotal: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: enRango },
        _count: { _all: true },
      }),
      prisma.customer.count({ where: { createdAt: enRango } }),
      prisma.customer.count(),
      prisma.order.aggregate({ where: { createdAt: enRango }, _sum: { total: true } }),
    ]);

  // --- Ventas -------------------------------------------------------------
  const facturado = facturas.reduce((s, f) => s + f.amount, 0);
  const entregado = facturas
    .filter((f) => f.order?.status === "FINALIZADO")
    .reduce((s, f) => s + f.amount, 0);

  // Serie temporal: se agrupa por el bucket del rango conservando el orden
  // cronológico (un Map preserva el orden de inserción).
  const ordenadas = [...facturas].sort(
    (a, b) => a.issuedAt.getTime() - b.issuedAt.getTime(),
  );
  const serieMap = new Map<string, { total: number; cantidad: number }>();
  for (const f of ordenadas) {
    const key = bucketKey(f.issuedAt, range.bucket);
    const cur = serieMap.get(key) ?? { total: 0, cantidad: 0 };
    cur.total += f.amount;
    cur.cantidad += 1;
    serieMap.set(key, cur);
  }
  const serie: SalesPoint[] = [...serieMap.entries()].map(([label, v]) => ({ label, ...v }));

  // --- Productos ----------------------------------------------------------
  // Se agrupa por NOMBRE y no por productId: las líneas escritas a mano no
  // tienen producto asociado y aun así son ventas que cuentan.
  const porProducto = new Map<string, ProductStat>();
  for (const it of items) {
    const cur = porProducto.get(it.name) ?? { name: it.name, unidades: 0, ingresos: 0 };
    cur.unidades += it.quantity;
    cur.ingresos += it.lineTotal;
    porProducto.set(it.name, cur);
  }
  const productos = [...porProducto.values()].sort((a, b) => b.unidades - a.unidades);

  // --- Clientes -----------------------------------------------------------
  const porCliente = new Map<string, CustomerStat>();
  for (const f of facturas) {
    if (!f.customerId || !f.customer) continue;
    const name = `${f.customer.firstName} ${f.customer.lastName}`.trim();
    const cur = porCliente.get(f.customerId) ?? { name, compras: 0, total: 0 };
    cur.compras += 1;
    cur.total += f.amount;
    porCliente.set(f.customerId, cur);
  }
  const clientes = [...porCliente.values()].sort((a, b) => b.compras - a.compras);
  // "Frecuente" = más de una compra en el periodo.
  const frecuentes = clientes.filter((c) => c.compras > 1).length;

  // --- Producción ---------------------------------------------------------
  const conteo = new Map(pedidosPorEstado.map((p) => [p.status, p._count._all]));
  const produccion = ORDER_STATUSES.map((estado) => ({
    estado,
    etiqueta: estado.charAt(0) + estado.slice(1).toLowerCase(),
    cantidad: conteo.get(estado) ?? 0,
  }));

  return {
    rango: {
      label: range.label,
      from: range.from.toISOString().slice(0, 10),
      to: range.to.toISOString().slice(0, 10),
    },
    ventas: {
      facturado,
      entregado,
      enPedidos: pedidosAgg._sum.total ?? 0,
      numFacturas: facturas.length,
      ticketPromedio: facturas.length > 0 ? Math.round(facturado / facturas.length) : 0,
      serie,
    },
    productos: {
      top: productos.slice(0, 10),
      // "Menos vendidos" solo tiene sentido entre los que SÍ se vendieron;
      // listar productos con cero ventas sería otra pregunta distinta.
      menos: [...productos].reverse().slice(0, 5),
    },
    clientes: {
      top: clientes.slice(0, 10),
      nuevos: clientesNuevos,
      frecuentes,
      total: clientesTotal,
    },
    produccion,
  };
}
