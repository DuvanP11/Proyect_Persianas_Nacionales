/**
 * Facturación — Cortinería Nacional.
 *
 * Aquí vive TODO el cálculo de una factura, sin depender de React ni de Prisma,
 * para que el mismo código corra en tres sitios y nunca den cifras distintas:
 *   · el constructor del panel (cliente), que recalcula en vivo;
 *   · el server action que guarda la factura;
 *   · la exportación a XML y el correo.
 *
 * Todos los importes son pesos colombianos ENTEROS: el COP no usa centavos, y
 * trabajar con enteros evita los redondeos raros de los flotantes.
 */

import { chainSideLabel, type ChainSide } from "@/lib/chain-side";
import { addressLine, siteConfig } from "@/lib/site-config";
import { formatCOP } from "@/lib/utils";

/** Una línea de la factura tal como la captura el formulario. */
export interface InvoiceLineInput {
  /** Producto del catálogo, si la línea salió de ahí. */
  productId?: string | null;
  name: string;
  designRef?: string | null;
  fabric?: string | null;
  chainSide?: ChainSide | null;
  widthM?: number | null;
  heightM?: number | null;
  quantity: number;
  unitPrice: number;
  // Extras por producto
  accessories: number;
  installation: number;
  transport: number;
  surcharge: number;
  discount: number;
  /** IVA de la línea en porcentaje (0 = exenta). */
  taxRate: number;
  notes?: string | null;
}

/** Línea vacía lista para agregar al constructor. */
export function emptyLine(): InvoiceLineInput {
  return {
    productId: null,
    name: "",
    designRef: "",
    fabric: "",
    chainSide: null,
    widthM: null,
    heightM: null,
    quantity: 1,
    unitPrice: 0,
    accessories: 0,
    installation: 0,
    transport: 0,
    surcharge: 0,
    discount: 0,
    taxRate: 0,
    notes: "",
  };
}

/** Desglose calculado de una línea. */
export interface LineTotals {
  /** cantidad × precio unitario */
  base: number;
  /** accesorios + instalación + transporte + recargos */
  extras: number;
  /** descuento efectivamente aplicado (nunca mayor que base + extras) */
  discount: number;
  /** base a la que se le aplica el IVA */
  taxable: number;
  tax: number;
  total: number;
}

/** Entero no negativo; cualquier basura (NaN, texto, negativo) cae a 0. */
function money(value: unknown): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Calcula una línea. El orden importa y es el habitual en una factura:
 * los extras suman a la base, el descuento se resta del conjunto, y el IVA
 * se calcula sobre lo que queda (nunca sobre el descuento).
 */
export function computeLine(line: InvoiceLineInput): LineTotals {
  const quantity = Math.max(1, Math.round(Number(line.quantity) || 1));
  const base = money(line.unitPrice) * quantity;
  const extras =
    money(line.accessories) +
    money(line.installation) +
    money(line.transport) +
    money(line.surcharge);

  const gross = base + extras;
  // Un descuento mayor que la línea dejaría totales negativos: se topa.
  const discount = Math.min(money(line.discount), gross);
  const taxable = gross - discount;

  const rate = Number(line.taxRate);
  const safeRate = Number.isFinite(rate) && rate > 0 ? Math.min(rate, 100) : 0;
  const tax = Math.round((taxable * safeRate) / 100);

  return { base, extras, discount, taxable, tax, total: taxable + tax };
}

/** Totales de la factura completa. */
export interface InvoiceTotals {
  subtotal: number;
  extrasTotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
}

/** Suma las líneas ya calculadas. */
export function computeInvoice(lines: InvoiceLineInput[]): InvoiceTotals {
  return lines.reduce<InvoiceTotals>(
    (acc, line) => {
      const t = computeLine(line);
      return {
        subtotal: acc.subtotal + t.base,
        extrasTotal: acc.extrasTotal + t.extras,
        discountTotal: acc.discountTotal + t.discount,
        taxTotal: acc.taxTotal + t.tax,
        total: acc.total + t.total,
      };
    },
    { subtotal: 0, extrasTotal: 0, discountTotal: 0, taxTotal: 0, total: 0 },
  );
}

// ---------------------------------------------------------------------------
//  Representación de la factura ya emitida (leída de la BD)
// ---------------------------------------------------------------------------

/** Datos mínimos que necesitan el documento, el XML, el correo y WhatsApp. */
export interface InvoiceView {
  id: string;
  number: string;
  issuedAt: Date;
  subtotal: number;
  discountTotal: number;
  extrasTotal: number;
  taxTotal: number;
  amount: number;
  notes: string | null;
  /** Firma del cliente como data URI, si ya firmó. */
  signature?: string | null;
  signerName?: string | null;
  signedAt?: Date | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string | null;
    city: string | null;
  } | null;
  order: { code: string } | null;
  items: {
    id: string;
    name: string;
    designRef: string | null;
    fabric: string | null;
    chainSide: string | null;
    widthM: number | null;
    heightM: number | null;
    quantity: number;
    unitPrice: number;
    accessories: number;
    installation: number;
    transport: number;
    surcharge: number;
    discount: number;
    taxRate: number;
    notes: string | null;
    lineTotal: number;
  }[];
}

/**
 * Arma una `InvoiceView` a partir de lo que hay en el constructor, SIN guardar.
 *
 * Es lo que permite que la vista previa sea idéntica al documento final: no se
 * dibuja una maqueta parecida, se alimenta el MISMO componente con los mismos
 * totales calculados por las mismas funciones. Si algo cambia en el cálculo,
 * cambia en los dos sitios a la vez.
 *
 * `issuedAt` llega desde fuera (no se usa `new Date()` aquí) para que servidor
 * y cliente rendericen lo mismo y no haya discrepancia de hidratación.
 */
export function draftInvoiceView(input: {
  number: string;
  issuedAt: Date;
  customer: InvoiceView["customer"];
  orderCode?: string | null;
  notes?: string | null;
  lines: InvoiceLineInput[];
}): InvoiceView {
  const totals = computeInvoice(input.lines);
  return {
    id: "borrador",
    number: input.number,
    issuedAt: input.issuedAt,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    extrasTotal: totals.extrasTotal,
    taxTotal: totals.taxTotal,
    amount: totals.total,
    notes: input.notes?.trim() || null,
    customer: input.customer,
    order: input.orderCode ? { code: input.orderCode } : null,
    items: input.lines.map((line, i) => ({
      id: `borrador-${i}`,
      name: line.name,
      designRef: line.designRef ?? null,
      fabric: line.fabric ?? null,
      chainSide: line.chainSide ?? null,
      widthM: line.widthM ?? null,
      heightM: line.heightM ?? null,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      accessories: line.accessories,
      installation: line.installation,
      transport: line.transport,
      surcharge: line.surcharge,
      discount: line.discount,
      taxRate: line.taxRate,
      notes: line.notes ?? null,
      lineTotal: computeLine(line).total,
    })),
  };
}

/** Nombre completo del cliente, o un texto neutro si la factura no tiene uno. */
export function customerName(invoice: InvoiceView): string {
  if (!invoice.customer) return "Consumidor final";
  return `${invoice.customer.firstName} ${invoice.customer.lastName}`.trim();
}

/**
 * Detalles secundarios de una línea (referencia, tela, medidas, mando) en una
 * sola cadena. Se omite lo que esté vacío para no dejar separadores sueltos.
 */
export function itemDetails(item: InvoiceView["items"][number]): string {
  const parts = [
    item.designRef ? `Ref. ${item.designRef}` : null,
    item.fabric || null,
    item.widthM && item.heightM ? `${item.widthM} × ${item.heightM} m` : null,
    chainSideLabel(item.chainSide),
  ];
  return parts.filter(Boolean).join(" · ");
}

// ---------------------------------------------------------------------------
//  Numeración
// ---------------------------------------------------------------------------

/**
 * Siguiente consecutivo para un prefijo dado ("FAC" o "REM").
 *
 * Se calcula a partir del número MÁS ALTO ya emitido con ese prefijo, no del
 * total de filas: contar filas rompía la numeración en cuanto convivían dos
 * prefijos o se borraba una factura.
 *
 * `existing` son los números ya usados (p. ej. "FAC-00007").
 */
export function nextNumber(prefix: string, existing: string[]): string {
  const max = existing.reduce((best, raw) => {
    const match = raw.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (!match) return best;
    const n = Number(match[1]);
    return Number.isFinite(n) && n > best ? n : best;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(5, "0")}`;
}

// ---------------------------------------------------------------------------
//  Exportaciones: correo y WhatsApp (el XML UBL vive en lib/invoice-ubl)
// ---------------------------------------------------------------------------

/** Escapa los cinco caracteres que no pueden ir crudos en XML. */
function xmlEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Mensaje de WhatsApp con el resumen de la factura y el enlace público.
 * Solo texto plano con negritas, sin emojis (ver `lib/whatsapp`).
 */
export function invoiceToWhatsAppMessage(invoice: InvoiceView, url: string): string {
  const lines = [
    `Hola ${invoice.customer?.firstName ?? ""}, aquí está tu factura de *${siteConfig.name}*.`.trim(),
    "",
    `*Factura:* ${invoice.number}`,
    `*Fecha:* ${new Date(invoice.issuedAt).toLocaleDateString("es-CO")}`,
    "",
  ];

  invoice.items.forEach((item, i) => {
    lines.push(`*${i + 1}) ${item.name}* (x${item.quantity})`);
    const details = itemDetails(item);
    if (details) lines.push(`   ${details}`);
    lines.push(`   ${formatCOP(item.lineTotal)}`);
  });

  lines.push("");
  lines.push(`*Total a pagar:* ${formatCOP(invoice.amount)}`);
  lines.push("");
  lines.push(`Puedes verla y descargarla aquí: ${url}`);
  return lines.join("\n");
}

/**
 * Factura en HTML para correo. Va con estilos EN LÍNEA a propósito: los
 * clientes de correo ignoran las hojas de estilo y las clases de Tailwind, así
 * que el documento de pantalla no sirve aquí.
 */
export function invoiceToEmailHtml(invoice: InvoiceView, url: string): string {
  const row = (item: InvoiceView["items"][number]) => {
    const details = itemDetails(item);
    return `<tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;color:#111">
        ${xmlEscape(item.name)}
        ${details ? `<div style="color:#777;font-size:12px">${xmlEscape(details)}</div>` : ""}
        ${item.notes ? `<div style="color:#777;font-size:12px">${xmlEscape(item.notes)}</div>` : ""}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;color:#111">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;color:#111">${formatCOP(item.lineTotal)}</td>
    </tr>`;
  };

  const totalRow = (label: string, value: number, strong = false) =>
    value === 0 && !strong
      ? ""
      : `<tr>
          <td style="padding:4px 8px;text-align:right;color:${strong ? "#111" : "#777"};font-weight:${strong ? "700" : "400"}">${label}</td>
          <td style="padding:4px 8px;text-align:right;color:#111;font-weight:${strong ? "700" : "400"}">${formatCOP(value)}</td>
        </tr>`;

  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <h2 style="margin:0 0 4px">${xmlEscape(siteConfig.name)}</h2>
    <p style="margin:0;color:#777;font-size:13px">
      ${xmlEscape(addressLine(" · "))}<br>
      ${xmlEscape(siteConfig.whatsapp.display)} · ${xmlEscape(siteConfig.email)}
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
    <p style="margin:0 0 16px">
      Hola ${xmlEscape(invoice.customer?.firstName ?? "")}, adjuntamos el detalle de tu factura
      <strong>${xmlEscape(invoice.number)}</strong> del
      ${new Date(invoice.issuedAt).toLocaleDateString("es-CO")}.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr>
          <th style="padding:8px;text-align:left;color:#777;font-size:12px;text-transform:uppercase">Descripción</th>
          <th style="padding:8px;text-align:center;color:#777;font-size:12px;text-transform:uppercase">Cant.</th>
          <th style="padding:8px;text-align:right;color:#777;font-size:12px;text-transform:uppercase">Total</th>
        </tr>
      </thead>
      <tbody>${invoice.items.map(row).join("")}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px">
      ${totalRow("Subtotal", invoice.subtotal)}
      ${totalRow("Extras", invoice.extrasTotal)}
      ${totalRow("Descuentos", -invoice.discountTotal)}
      ${totalRow("IVA", invoice.taxTotal)}
      ${totalRow("Total", invoice.amount, true)}
    </table>
    ${invoice.notes ? `<p style="margin-top:16px;color:#555;font-size:13px"><strong>Observaciones:</strong> ${xmlEscape(invoice.notes)}</p>` : ""}
    <p style="margin-top:20px">
      <a href="${xmlEscape(url)}" style="background:#5a3b8c;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">
        Ver factura en línea
      </a>
    </p>
    <p style="margin-top:16px;color:#0a8f4d;font-size:13px">${xmlEscape(siteConfig.freeInstall)}</p>
    <p style="color:#999;font-size:12px;margin-top:24px">
      ${xmlEscape(siteConfig.name)} · ${xmlEscape(siteConfig.slogan)}
    </p>
  </div>`;
}
