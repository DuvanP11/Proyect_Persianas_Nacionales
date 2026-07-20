"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, UserPlus, Users } from "lucide-react";
import {
  CHAIN_SIDES,
  CHAIN_SIDE_LABEL,
  DEFAULT_CHAIN_SIDE,
  type ChainSide,
} from "@/lib/chain-side";
import {
  computeInvoice,
  computeLine,
  emptyLine,
  type InvoiceLineInput,
} from "@/lib/invoice";
import { formatCOP } from "@/lib/utils";
import { createInvoice, type InvoiceFormState } from "./actions";

/** Producto del catálogo tal como lo necesita el constructor. */
export type InvoiceProductOption = {
  id: string;
  name: string;
  designRef: string | null;
  fabric: string | null;
  allowChainSide: boolean;
  /** Precio sugerido por metro; se usa como valor unitario inicial. */
  pricePerMeter: number | null;
};

/** Cliente existente que se puede buscar y seleccionar. */
export type InvoiceCustomerOption = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
};

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-sm text-cloud placeholder:text-mist-2 " +
  "focus:border-morado/60 focus:outline-none focus:ring-2 focus:ring-morado/30 transition-colors";
const label = "mb-1 block text-xs text-mist-2";
const card = "rounded-2xl border border-line bg-surface/60 p-5";

/**
 * Constructor de facturas — Cortinería Nacional.
 *
 * Arma una factura a partir del catálogo: se escoge (o se crea) el cliente, se
 * agregan líneas de producto con sus extras, y todos los totales se recalculan
 * en vivo con `lib/invoice`. Ese mismo módulo lo vuelve a ejecutar el servidor
 * al guardar, así que lo que se ve en pantalla es lo que queda en la factura.
 *
 * Las líneas viajan al server action como JSON en un campo oculto: son muchos
 * campos por línea y su número es variable, y un `name` por campo obligaría a
 * reconstruir los índices a mano en el servidor.
 */
export function InvoiceBuilder({
  products,
  customers,
}: {
  products: InvoiceProductOption[];
  customers: InvoiceCustomerOption[];
}) {
  const [state, formAction, pending] = useActionState<InvoiceFormState, FormData>(
    createInvoice,
    {},
  );

  const [lines, setLines] = useState<InvoiceLineInput[]>([emptyLine()]);
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState("");
  const [search, setSearch] = useState("");

  const totals = useMemo(() => computeInvoice(lines), [lines]);

  /** Clientes que coinciden con la búsqueda (nombre, correo o teléfono). */
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter((c) =>
        `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [customers, search]);

  const selected = customers.find((c) => c.id === customerId) ?? null;

  /** Aplica un cambio parcial a una línea, sin tocar las demás. */
  function patchLine(index: number, patch: Partial<InvoiceLineInput>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  /**
   * Al elegir un producto del catálogo se copian sus datos a la línea:
   * nombre, referencia del diseño, tela y precio sugerido. Todo queda editable
   * — la factura guarda una foto del momento, no una referencia viva.
   */
  function selectProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      patchLine(index, { productId: null });
      return;
    }
    patchLine(index, {
      productId: product.id,
      name: product.name,
      designRef: product.designRef ?? "",
      fabric: product.fabric ?? "",
      unitPrice: product.pricePerMeter ?? 0,
      // Si el producto no admite elegir el mando, la línea no lo lleva.
      chainSide: product.allowChainSide ? DEFAULT_CHAIN_SIDE : null,
    });
  }

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (index: number) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  return (
    <form action={formAction} className="space-y-6">
      {/* Las líneas ya validadas se recalculan en el servidor. */}
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      {customerMode === "existing" && (
        <input type="hidden" name="customerId" value={customerId} />
      )}

      {state.error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Cliente                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className={card}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg text-cloud">Cliente</h2>
          <div className="flex gap-1.5">
            {(
              [
                { mode: "existing" as const, label: "Buscar existente", Icon: Users },
                { mode: "new" as const, label: "Crear nuevo", Icon: UserPlus },
              ]
            ).map(({ mode, label: text, Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setCustomerMode(mode)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                  customerMode === mode
                    ? "border-morado bg-morado/20 text-cloud"
                    : "border-line text-mist hover:border-morado/50 hover:text-cloud"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {text}
              </button>
            ))}
          </div>
        </div>

        {customerMode === "existing" ? (
          <div className="space-y-3">
            <div>
              <label className={label} htmlFor="buscar-cliente">
                Buscar por nombre, correo o teléfono
              </label>
              <input
                id="buscar-cliente"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={input}
                placeholder="Ej: María, maria@correo.com, 300…"
              />
            </div>

            {matches.length === 0 ? (
              <p className="text-sm text-mist-2">
                Ningún cliente coincide. Usa “Crear nuevo” para registrarlo.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {matches.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setCustomerId(c.id === customerId ? "" : c.id)}
                      aria-pressed={c.id === customerId}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                        c.id === customerId
                          ? "border-morado bg-morado/10"
                          : "border-line hover:border-morado/50"
                      }`}
                    >
                      <span className="block truncate text-sm text-cloud">{c.name}</span>
                      <span className="block truncate text-xs text-mist-2">
                        {c.phone}
                        {c.email ? ` · ${c.email}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-mist-2">
              {selected
                ? `Seleccionado: ${selected.name}`
                : "Sin cliente seleccionado — la factura saldrá a nombre de “Consumidor final”."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Nombre *</label>
              <input name="newFirstName" className={input} placeholder="María" />
            </div>
            <div>
              <label className={label}>Apellidos</label>
              <input name="newLastName" className={input} placeholder="Gómez" />
            </div>
            <div>
              <label className={label}>Teléfono *</label>
              <input name="newPhone" className={input} inputMode="tel" placeholder="300 000 0000" />
            </div>
            <div>
              <label className={label}>Correo</label>
              <input name="newEmail" className={input} inputMode="email" placeholder="cliente@correo.com" />
            </div>
            <div>
              <label className={label}>Ciudad</label>
              <input name="newCity" className={input} placeholder="Bogotá" />
            </div>
            <div>
              <label className={label}>Dirección</label>
              <input name="newAddress" className={input} placeholder="Cra 00 #00-00" />
            </div>
            <p className="text-xs text-mist-2 sm:col-span-2">
              Nombre y teléfono son obligatorios para registrar al cliente. Si el correo ya
              existe se reutiliza esa ficha en vez de duplicarla.
            </p>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Productos                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className={card}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-cloud">Productos</h2>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1.5 rounded-full border border-morado/50 px-3 py-1.5 text-xs text-morado-light transition hover:bg-morado/10"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar producto
          </button>
        </div>

        <div className="space-y-4">
          {lines.map((line, index) => {
            const totals = computeLine(line);
            const product = products.find((p) => p.id === line.productId);
            // El mando se ofrece si el producto lo permite; en una línea escrita
            // a mano se ofrece siempre, porque no hay producto que consultar.
            const allowChain = product ? product.allowChainSide : true;

            return (
              <fieldset
                key={index}
                className="rounded-xl border border-line bg-white/[0.02] p-4"
              >
                <legend className="px-2 text-xs text-mist-2">Producto {index + 1}</legend>

                <div className="flex items-start justify-between gap-3">
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={label}>Producto del catálogo</label>
                      <select
                        value={line.productId ?? ""}
                        onChange={(e) => selectProduct(index, e.target.value)}
                        className={input}
                      >
                        <option value="">— Escribir a mano —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={label}>Descripción *</label>
                      <input
                        value={line.name}
                        onChange={(e) => patchLine(index, { name: e.target.value })}
                        className={input}
                        placeholder="Nombre que verá el cliente"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    disabled={lines.length === 1}
                    aria-label={`Quitar producto ${index + 1}`}
                    className="mt-5 shrink-0 rounded-lg border border-line p-2 text-mist transition hover:border-red-500/50 hover:text-red-300 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Ficha de la línea */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={label}>Referencia del diseño</label>
                    <input
                      value={line.designRef ?? ""}
                      onChange={(e) => patchLine(index, { designRef: e.target.value })}
                      className={input}
                      placeholder="Milan 502"
                    />
                  </div>
                  <div>
                    <label className={label}>Tipo de tela</label>
                    <input
                      value={line.fabric ?? ""}
                      onChange={(e) => patchLine(index, { fabric: e.target.value })}
                      className={input}
                      placeholder="Blackout"
                    />
                  </div>
                  <div>
                    <label className={label}>Ancho (m)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.05"
                      value={line.widthM ?? ""}
                      onChange={(e) =>
                        patchLine(index, {
                          widthM: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className={input}
                      placeholder="3.25"
                    />
                  </div>
                  <div>
                    <label className={label}>Alto (m)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.05"
                      value={line.heightM ?? ""}
                      onChange={(e) =>
                        patchLine(index, {
                          heightM: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className={input}
                      placeholder="2.40"
                    />
                  </div>
                </div>

                {/* Cantidad, precio, IVA y mando */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={label}>Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        patchLine(index, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className={input}
                    />
                  </div>
                  <div>
                    <label className={label}>Precio unitario</label>
                    <input
                      type="number"
                      min={0}
                      value={line.unitPrice || ""}
                      onChange={(e) => patchLine(index, { unitPrice: Number(e.target.value) || 0 })}
                      className={input}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={label}>IVA (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      value={line.taxRate || ""}
                      onChange={(e) => patchLine(index, { taxRate: Number(e.target.value) || 0 })}
                      className={input}
                      placeholder="0 = exento"
                    />
                  </div>
                  <div>
                    <label className={label}>Posición del mando</label>
                    <select
                      value={line.chainSide ?? ""}
                      onChange={(e) =>
                        patchLine(index, {
                          chainSide: (e.target.value || null) as ChainSide | null,
                        })
                      }
                      disabled={!allowChain}
                      className={`${input} disabled:opacity-50`}
                      title={
                        allowChain
                          ? undefined
                          : "Este producto no tiene habilitada la selección de mando."
                      }
                    >
                      <option value="">— No aplica —</option>
                      {CHAIN_SIDES.map((side) => (
                        <option key={side} value={side}>
                          {CHAIN_SIDE_LABEL[side]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Extras y descuento */}
                <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {(
                    [
                      ["accessories", "Accesorios"],
                      ["installation", "Instalación"],
                      ["transport", "Transporte"],
                      ["surcharge", "Recargos"],
                      ["discount", "Descuento"],
                    ] as const
                  ).map(([field, text]) => (
                    <div key={field}>
                      <label className={label}>{text}</label>
                      <input
                        type="number"
                        min={0}
                        value={line[field] || ""}
                        onChange={(e) => patchLine(index, { [field]: Number(e.target.value) || 0 })}
                        className={input}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <label className={label}>Observaciones</label>
                  <input
                    value={line.notes ?? ""}
                    onChange={(e) => patchLine(index, { notes: e.target.value })}
                    className={input}
                    placeholder="Detalles de esta línea (instalación en segundo piso, color especial…)"
                  />
                </div>

                {/* Desglose de la línea, siempre al día */}
                <dl className="mt-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-mist-2">
                  <span>
                    Subtotal <b className="text-mist">{formatCOP(totals.base)}</b>
                  </span>
                  {totals.extras > 0 && (
                    <span>
                      Extras <b className="text-mist">{formatCOP(totals.extras)}</b>
                    </span>
                  )}
                  {totals.discount > 0 && (
                    <span>
                      Dcto. <b className="text-mist">− {formatCOP(totals.discount)}</b>
                    </span>
                  )}
                  {totals.tax > 0 && (
                    <span>
                      IVA <b className="text-mist">{formatCOP(totals.tax)}</b>
                    </span>
                  )}
                  <span className="text-sm text-cloud">
                    Total <b>{formatCOP(totals.total)}</b>
                  </span>
                </dl>
              </fieldset>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Totales y observaciones                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className={card}>
        <h2 className="mb-4 font-display text-lg text-cloud">Resumen</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className={label}>Observaciones de la factura</label>
            <textarea
              name="notes"
              rows={5}
              className={input}
              placeholder="Condiciones de pago, garantía, fecha de instalación…"
            />
          </div>

          <dl className="space-y-2 self-start rounded-xl border border-line bg-white/[0.02] p-4 text-sm">
            <Row label="Subtotal" value={totals.subtotal} />
            <Row label="Extras" value={totals.extrasTotal} />
            <Row label="Descuentos" value={-totals.discountTotal} />
            <Row label="IVA" value={totals.taxTotal} />
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-cloud">
              <dt>Total</dt>
              <dd>{formatCOP(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gradient-to-r from-morado to-naranja px-6 py-3 text-sm font-medium text-white shadow-lg shadow-morado/25 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Generando…" : "Generar factura"}
        </button>
        <Link
          href="/admin/facturas"
          className="rounded-full border border-line px-5 py-3 text-sm text-mist transition hover:text-cloud"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

/** Fila del resumen. Se atenúa en cero para que destaque lo que sí aplica. */
function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className={`flex justify-between ${value === 0 ? "text-mist-2" : "text-mist"}`}>
      <dt>{label}</dt>
      <dd>{formatCOP(value)}</dd>
    </div>
  );
}
