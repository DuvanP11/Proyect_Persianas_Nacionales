import { notFound } from "next/navigation";
import { InvoiceActions } from "@/components/invoice/InvoiceActions";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { getInvoice } from "@/lib/invoice-data";

export const dynamic = "force-dynamic";

/**
 * Vista pública de la factura, accesible por su id (el enlace que el panel le
 * comparte al cliente por WhatsApp o correo). El id es un cuid difícil de
 * adivinar.
 *
 * El cliente puede imprimirla, guardarla como PDF y descargar el XML; no ve el
 * botón de "enviar por correo", que es una acción del personal.
 */
export default async function FacturaPublicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 print:pt-6">
      <div className="mb-6 flex justify-end">
        <InvoiceActions invoiceId={invoice.id} xmlUrl={`/api/facturas/${invoice.id}/xml`} />
      </div>
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
