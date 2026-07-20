import { notFound } from "next/navigation";
import { sendInvoiceEmail } from "@/app/admin/(panel)/facturas/actions";
import { InvoiceActions } from "@/components/invoice/InvoiceActions";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { requireAdmin } from "@/lib/auth";
import { invoiceToWhatsAppMessage } from "@/lib/invoice";
import { getInvoice } from "@/lib/invoice-data";
import { siteUrl, whatsappDigits } from "@/lib/site-url";

export const dynamic = "force-dynamic";

/**
 * Vista de la factura en el panel: el documento imprimible más las acciones
 * para hacérselo llegar al cliente (WhatsApp, correo, PDF y XML).
 *
 * Vive fuera del grupo `(panel)` a propósito: al imprimir no debe salir la
 * barra lateral de navegación.
 */
export default async function FacturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  // Enlace público que se le comparte al cliente, con el mensaje ya redactado.
  const publicUrl = await siteUrl(`/factura/${invoice.id}`);
  const phone = invoice.customer?.phone;
  const whatsappUrl = phone
    ? `https://wa.me/${whatsappDigits(phone)}?text=${encodeURIComponent(
        invoiceToWhatsAppMessage(invoice, publicUrl),
      )}`
    : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 print:py-0">
      <div className="mb-6 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href={invoice.order ? `/admin/pedidos` : "/admin/facturas"}
            className="text-sm text-mist transition hover:text-cloud"
          >
            ← Volver {invoice.order ? "a pedidos" : "a facturación"}
          </a>
          <span className="font-mono text-sm text-mist-2">{invoice.number}</span>
        </div>

        <InvoiceActions
          invoiceId={invoice.id}
          xmlUrl={`/api/facturas/${invoice.id}/xml`}
          whatsappUrl={whatsappUrl}
          sendEmailAction={sendInvoiceEmail}
          customerEmail={invoice.customer?.email ?? null}
        />
      </div>

      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
