import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { PrintButton } from "@/app/admin/facturas/[id]/PrintButton";

export const dynamic = "force-dynamic";

/**
 * Vista pública de la remisión, accesible por su id (enlace que el admin comparte
 * con el cliente por WhatsApp o correo). El id es un cuid difícil de adivinar.
 */
export default async function FacturaPublicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      order: { include: { customer: true, quote: true } },
    },
  });
  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 pt-28 pb-16 print:pt-6">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
