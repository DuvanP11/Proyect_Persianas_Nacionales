import { getSession } from "@/lib/auth";
import { getInvoice } from "@/lib/invoice-data";
import { invoiceToUbl } from "@/lib/invoice-ubl";

/**
 * GET /api/facturas/<id>/xml — descarga la factura en XML.
 *
 * Acceso: igual que la vista pública `/factura/[id]`. El id es un cuid
 * imposible de adivinar y es el enlace que la empresa le comparte al cliente,
 * así que el propio cliente puede descargar su XML sin cuenta. El personal con
 * sesión también, obviamente.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) {
    return new Response("Factura no encontrada", { status: 404 });
  }

  // La sesión no condiciona el acceso, pero se consulta para no romper si más
  // adelante se decide restringir la descarga solo al personal.
  await getSession();

  return new Response(invoiceToUbl(invoice), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${invoice.number}.xml"`,
      // Documento inmutable, pero se sirve fresco para reflejar una edición.
      "Cache-Control": "no-store",
    },
  });
}
