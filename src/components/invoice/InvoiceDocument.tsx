import Image from "next/image";
import { chainSideLabel } from "@/lib/chain-side";
import { customerName, type InvoiceView } from "@/lib/invoice";
import { addressParts, siteConfig } from "@/lib/site-config";
import { formatCOP } from "@/lib/utils";

/**
 * Documento de factura imprimible — Cortinería Nacional.
 *
 * Lo comparten el panel (`/admin/facturas/[id]`) y la vista pública que se le
 * comparte al cliente (`/factura/[id]`), así que ambos ven el mismo papel.
 *
 * Diseño pensado para imprimirse: fondo blanco fijo y tinta oscura (no usa los
 * tokens del tema, que cambian con claro/oscuro), y las variantes `print:`
 * quitan bordes y sombras para no gastar tóner. La misma vista sirve de "vista
 * previa de impresión" y de PDF, guardando desde el diálogo del navegador.
 */
export function InvoiceDocument({ invoice }: { invoice: InvoiceView }) {
  const { customer } = invoice;
  // Las remisiones antiguas no traían desglose: si no hay IVA, extras ni
  // descuentos, se muestra solo el total y la tabla no se llena de ceros.
  const hasBreakdown =
    invoice.taxTotal > 0 || invoice.discountTotal > 0 || invoice.extrasTotal > 0;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-800 shadow-xl sm:p-8 print:rounded-none print:border-0 print:p-0 print:shadow-none">
      {/* Encabezado: logo arriba a la izquierda + datos del documento */}
      <header className="flex flex-col gap-6 border-b border-neutral-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Image
            src={siteConfig.logo}
            alt={siteConfig.name}
            width={260}
            height={72}
            priority
            className="h-14 w-auto"
          />
          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            {addressParts().map((part) => (
              <span key={part} className="block">
                {part}
              </span>
            ))}
            <span className="block">Tel/WhatsApp: {siteConfig.whatsapp.display}</span>
            <span className="block">{siteConfig.email}</span>
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-lg font-semibold tracking-wide text-neutral-900">FACTURA</p>
          <p className="font-mono text-sm text-neutral-600">{invoice.number}</p>
          <p className="mt-1 text-xs text-neutral-500">
            Fecha: {new Date(invoice.issuedAt).toLocaleDateString("es-CO")}
          </p>
          {invoice.order && (
            <p className="text-xs text-neutral-500">Pedido: {invoice.order.code}</p>
          )}
        </div>
      </header>

      {/* Datos del cliente */}
      <section className="grid gap-6 py-6 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">Cliente</p>
          <p className="mt-1 font-medium text-neutral-900">{customerName(invoice)}</p>
          {customer?.phone && <p className="text-neutral-600">{customer.phone}</p>}
          {customer?.email && <p className="break-all text-neutral-600">{customer.email}</p>}
        </div>
        <div className="sm:text-right">
          <p className="text-xs uppercase tracking-wide text-neutral-400">
            Dirección de entrega
          </p>
          <p className="mt-1 text-neutral-600">{customer?.address ?? "—"}</p>
          {customer?.city && <p className="text-neutral-600">{customer.city}</p>}
        </div>
      </section>

      {/* Detalle de productos. En móvil la tabla scrollea sola en vez de
          desbordar la página. */}
      <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[34rem] border-t border-neutral-200 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
              <th className="py-2 pr-3 font-medium">Descripción</th>
              <th className="py-2 px-2 text-center font-medium">Cant.</th>
              <th className="py-2 px-2 text-right font-medium">V. unitario</th>
              {hasBreakdown && (
                <>
                  <th className="py-2 px-2 text-right font-medium">Extras</th>
                  <th className="py-2 px-2 text-right font-medium">Dcto.</th>
                  <th className="py-2 px-2 text-right font-medium">IVA</th>
                </>
              )}
              <th className="py-2 pl-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => {
              const extras =
                item.accessories + item.installation + item.transport + item.surcharge;
              const mando = chainSideLabel(item.chainSide);
              return (
                <tr key={item.id} className="border-t border-neutral-100 align-top">
                  <td className="py-3 pr-3 text-neutral-800">
                    <span className="font-medium">{item.name}</span>
                    {/* Cada atributo en su propia línea: en una factura se leen
                        de un vistazo mejor que en una cadena separada por puntos. */}
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {item.designRef && <span className="block">Ref. {item.designRef}</span>}
                      {item.fabric && <span className="block">Tela: {item.fabric}</span>}
                      {item.widthM != null && item.heightM != null && (
                        <span className="block">
                          Medidas: {item.widthM} × {item.heightM} m
                        </span>
                      )}
                      {mando && <span className="block">Mando: {mando}</span>}
                      {item.notes && (
                        <span className="block italic">Obs.: {item.notes}</span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-neutral-800">{item.quantity}</td>
                  <td className="py-3 px-2 text-right text-neutral-800">
                    {formatCOP(item.unitPrice)}
                  </td>
                  {hasBreakdown && (
                    <>
                      <td className="py-3 px-2 text-right text-neutral-600">
                        {extras > 0 ? formatCOP(extras) : "—"}
                      </td>
                      <td className="py-3 px-2 text-right text-neutral-600">
                        {item.discount > 0 ? `− ${formatCOP(item.discount)}` : "—"}
                      </td>
                      <td className="py-3 px-2 text-right text-neutral-600">
                        {item.taxRate > 0 ? `${item.taxRate}%` : "—"}
                      </td>
                    </>
                  )}
                  <td className="py-3 pl-2 text-right font-medium text-neutral-900">
                    {formatCOP(item.lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="mt-4 flex justify-end border-t border-neutral-200 pt-4">
        <dl className="w-full max-w-xs space-y-1.5 text-sm">
          {hasBreakdown && (
            <>
              <Total label="Subtotal" value={invoice.subtotal} />
              {invoice.extrasTotal > 0 && (
                <Total label="Extras" value={invoice.extrasTotal} />
              )}
              {invoice.discountTotal > 0 && (
                <Total label="Descuentos" value={-invoice.discountTotal} />
              )}
              {invoice.taxTotal > 0 && <Total label="IVA" value={invoice.taxTotal} />}
            </>
          )}
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold text-neutral-900">
            <dt>Total</dt>
            <dd>{formatCOP(invoice.amount)}</dd>
          </div>
          <p className="pt-1 text-right text-xs text-emerald-600">{siteConfig.freeInstall}</p>
        </dl>
      </div>

      {/* Firma del cliente. Se imprime junto a la línea de recibido: es la
          constancia de que el pedido se entregó conforme. */}
      {invoice.signature && (
        <section className="mt-8 flex justify-end">
          <div className="w-64 text-center">
            {/* `unoptimized`: es un data URI embebido, no hay qué optimizar. */}
            <Image
              src={invoice.signature}
              alt={`Firma de ${invoice.signerName ?? "el cliente"}`}
              width={320}
              height={110}
              unoptimized
              className="mx-auto h-20 w-auto object-contain"
            />
            <p className="mt-1 border-t border-neutral-300 pt-1 text-xs text-neutral-600">
              {invoice.signerName || customerName(invoice)}
            </p>
            <p className="text-[11px] text-neutral-400">
              Recibido conforme
              {invoice.signedAt &&
                ` · ${new Date(invoice.signedAt).toLocaleDateString("es-CO")}`}
            </p>
          </div>
        </section>
      )}

      {/* Observaciones generales */}
      {invoice.notes && (
        <section className="mt-6 rounded-xl bg-neutral-50 p-4 print:bg-transparent print:p-0">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Observaciones</p>
          <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">{invoice.notes}</p>
        </section>
      )}

      <footer className="mt-8 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-400">
        Gracias por confiar en {siteConfig.name}. {siteConfig.slogan}.
      </footer>
    </div>
  );
}

/** Fila de totales. Los valores negativos ya vienen con el signo puesto. */
function Total({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-neutral-600">
      <dt>{label}</dt>
      <dd>{formatCOP(value)}</dd>
    </div>
  );
}
