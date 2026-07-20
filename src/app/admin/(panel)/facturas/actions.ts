"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { toChainSide } from "@/lib/chain-side";
import { EmailError, sendEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site-url";
import { getInvoice } from "@/lib/invoice-data";
import {
  computeInvoice,
  computeLine,
  invoiceToEmailHtml,
  nextNumber,
  type InvoiceLineInput,
} from "@/lib/invoice";
import { siteConfig } from "@/lib/site-config";

export type InvoiceFormState = { error?: string };
export type SendEmailState = { ok?: boolean; error?: string };

/** Refresca las vistas que muestran facturas. */
function revalidateInvoices(id?: string) {
  revalidatePath("/admin/facturas");
  revalidatePath("/admin");
  revalidatePath("/cuenta");
  if (id) revalidatePath(`/admin/facturas/${id}`);
}

/** Entero no negativo a partir de cualquier entrada del formulario. */
function money(value: unknown): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Número opcional (medidas): `null` si viene vacío o inválido. */
function optionalNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Texto recortado, o `null` si queda vacío. */
function text(value: unknown): string | null {
  const s = String(value ?? "").trim();
  return s.length > 0 ? s : null;
}

/**
 * Normaliza las líneas que llegan del constructor.
 *
 * El formulario las manda como JSON en un campo oculto (son muchos campos por
 * línea y el número de líneas es variable). Aquí NO se confía en nada: cada
 * valor se vuelve a validar y los totales se recalculan en el servidor con la
 * misma función que usó el navegador.
 */
function parseLines(raw: string): InvoiceLineInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((row): InvoiceLineInput | null => {
      const r = row as Record<string, unknown>;
      const name = String(r.name ?? "").trim();
      // Una línea sin descripción no se puede facturar: se descarta.
      if (!name) return null;
      return {
        productId: text(r.productId),
        name,
        designRef: text(r.designRef),
        fabric: text(r.fabric),
        chainSide: toChainSide(r.chainSide),
        widthM: optionalNumber(r.widthM),
        heightM: optionalNumber(r.heightM),
        quantity: Math.max(1, Math.round(Number(r.quantity) || 1)),
        unitPrice: money(r.unitPrice),
        accessories: money(r.accessories),
        installation: money(r.installation),
        transport: money(r.transport),
        surcharge: money(r.surcharge),
        discount: money(r.discount),
        taxRate: Math.min(100, Math.max(0, Number(r.taxRate) || 0)),
        notes: text(r.notes),
      };
    })
    .filter((line): line is InvoiceLineInput => line !== null);
}

/**
 * Resuelve el cliente de la factura: uno existente por id, o uno nuevo con los
 * datos del formulario. Devuelve `null` si no se indicó ninguno (venta
 * mostrador a consumidor final).
 */
async function resolveCustomer(formData: FormData): Promise<string | null> {
  const existingId = String(formData.get("customerId") ?? "").trim();
  if (existingId) return existingId;

  const firstName = String(formData.get("newFirstName") ?? "").trim();
  const lastName = String(formData.get("newLastName") ?? "").trim();
  const email = String(formData.get("newEmail") ?? "").trim().toLowerCase();
  const phone = String(formData.get("newPhone") ?? "").trim();
  if (!firstName || !phone) return null;

  // Si ya existe alguien con ese correo, se reutiliza en vez de duplicarlo:
  // el portal del cliente enlaza cotizaciones y pedidos por correo.
  if (email) {
    const existing = await prisma.customer.findFirst({ where: { email } });
    if (existing) return existing.id;
  }

  const created = await prisma.customer.create({
    data: {
      firstName,
      lastName: lastName || "",
      email,
      phone,
      city: String(formData.get("newCity") ?? "").trim() || null,
      address: String(formData.get("newAddress") ?? "").trim() || null,
    },
  });
  return created.id;
}

/** Crea la factura con sus líneas y redirige al documento imprimible. */
export async function createInvoice(
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  await requireAdmin();

  const lines = parseLines(String(formData.get("lines") ?? "[]"));
  if (lines.length === 0) {
    return { error: "Agrega al menos un producto con nombre a la factura." };
  }

  const totals = computeInvoice(lines);
  const orderId = String(formData.get("orderId") ?? "").trim() || null;

  let customerId: string | null;
  try {
    customerId = await resolveCustomer(formData);
  } catch (e) {
    console.error("[facturas] error creando el cliente:", e);
    return { error: "No se pudo guardar el cliente. Revisa los datos e intenta de nuevo." };
  }

  // La numeración se calcula sobre los números ya emitidos, no sobre el total
  // de filas: así conviven FAC- (facturas) y REM- (remisiones de pedidos).
  const existing = await prisma.invoice.findMany({ select: { number: true } });
  const number = nextNumber("FAC", existing.map((i) => i.number));

  let invoiceId: string;
  try {
    // Todo en una transacción: una factura sin líneas sería un documento roto.
    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          number,
          orderId,
          customerId,
          subtotal: totals.subtotal,
          extrasTotal: totals.extrasTotal,
          discountTotal: totals.discountTotal,
          taxTotal: totals.taxTotal,
          amount: totals.total,
          notes: String(formData.get("notes") ?? "").trim() || null,
        },
      });

      await tx.invoiceItem.createMany({
        data: lines.map((line, index) => ({
          invoiceId: created.id,
          productId: line.productId ?? null,
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
          sortOrder: index,
        })),
      });

      // Si la factura cuelga de un pedido, el total del pedido se pone al día.
      if (orderId) {
        await tx.order.update({ where: { id: orderId }, data: { total: totals.total } });
      }

      return created;
    });
    invoiceId = invoice.id;
  } catch (e) {
    console.error("[facturas] error creando la factura:", e);
    return { error: "No se pudo guardar la factura. Intenta de nuevo." };
  }

  revalidateInvoices(invoiceId);
  // `redirect` lanza por dentro: debe quedar fuera del try/catch de arriba.
  redirect(`/admin/facturas/${invoiceId}`);
}

/** Elimina una factura (sus líneas se van en cascada). */
export async function deleteInvoice(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.invoice.delete({ where: { id } });
  revalidateInvoices();
}

export type SignatureState = { ok?: boolean; error?: string };

/** Tope de tamaño de la firma. Una firma real ronda los 10–30 KB. */
const MAX_SIGNATURE_BYTES = 400 * 1024;

/**
 * Guarda la firma del cliente en la factura.
 *
 * La firma llega como data URI desde el navegador (lienzo o imagen subida).
 * Se valida el formato y el tamaño ANTES de tocar la base: el campo es texto
 * libre y sin control cabría cualquier cosa, incluido un payload enorme.
 */
export async function saveInvoiceSignature(
  _prev: SignatureState,
  formData: FormData,
): Promise<SignatureState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const signature = String(formData.get("signature") ?? "").trim();
  const signerName = String(formData.get("signerName") ?? "").trim() || null;

  if (!id) return { error: "Factura no válida." };
  if (!signature) return { error: "No hay ninguna firma que guardar." };

  // Solo se aceptan imágenes en base64; nada de URLs remotas ni SVG (que
  // podría traer scripts dentro).
  if (!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(signature)) {
    return { error: "El formato de la firma no es válido. Usa PNG o JPG." };
  }

  // La longitud en base64 sobreestima ~33% el tamaño real; sirve de tope.
  if (signature.length > MAX_SIGNATURE_BYTES) {
    return { error: "La firma pesa demasiado. Usa una imagen más liviana." };
  }

  try {
    await prisma.invoice.update({
      where: { id },
      data: { signature, signerName, signedAt: new Date() },
    });
  } catch (e) {
    console.error("[facturas] error guardando la firma:", e);
    return { error: "No se pudo guardar la firma. Intenta de nuevo." };
  }

  revalidateInvoices(id);
  return { ok: true };
}

/** Borra la firma para poder volver a capturarla. */
export async function removeInvoiceSignature(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.invoice.update({
    where: { id },
    data: { signature: null, signerName: null, signedAt: null },
  });
  revalidateInvoices(id);
}

/** Envía la factura al correo del cliente. */
export async function sendInvoiceEmail(
  _prev: SendEmailState,
  formData: FormData,
): Promise<SendEmailState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Factura no válida." };

  const invoice = await getInvoice(id);
  if (!invoice) return { error: "La factura ya no existe." };
  if (!invoice.customer?.email) {
    return { error: "El cliente no tiene un correo registrado." };
  }

  try {
    const url = await siteUrl(`/factura/${invoice.id}`);
    await sendEmail({
      to: invoice.customer.email,
      subject: `Factura ${invoice.number} — ${siteConfig.name}`,
      html: invoiceToEmailHtml(invoice, url),
    });
    console.info(`[facturas] ${invoice.number} enviada a ${invoice.customer.email}`);
    return { ok: true };
  } catch (e) {
    // Se propaga el motivo REAL: "no se pudo enviar" a secas obliga a entrar
    // a los logs del servidor para saber si falta la clave, si el dominio no
    // está verificado o si el correo del cliente está mal escrito.
    if (e instanceof EmailError) {
      console.error(`[facturas] envío fallido (${e.stage}):`, e.message, e.detail ?? "");
      return { error: e.message };
    }
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[facturas] error inesperado enviando el correo:", detail);
    return { error: `Error inesperado al enviar: ${detail}` };
  }
}
