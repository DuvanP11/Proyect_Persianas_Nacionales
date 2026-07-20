import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  InvoiceBuilder,
  type InvoiceCustomerOption,
  type InvoiceProductOption,
} from "../InvoiceBuilder";

export const dynamic = "force-dynamic";

/**
 * Alta de una factura nueva.
 *
 * Carga en el servidor el catálogo y la lista de clientes; el constructor
 * (componente cliente) hace la búsqueda y el recálculo sin volver a pedir datos.
 */
export default async function NuevaFacturaPage() {
  const [products, customers] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        designRef: true,
        fabric: true,
        allowChainSide: true,
        pricePerMeter: true,
      },
    }),
    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
      },
    }),
  ]);

  const customerOptions: InvoiceCustomerOption[] = customers.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim(),
    email: c.email,
    phone: c.phone,
    city: c.city,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/facturas" className="text-sm text-mist transition hover:text-cloud">
          ← Volver a facturación
        </Link>
        <h1 className="mt-2 font-display text-3xl text-cloud">Nueva factura</h1>
        <p className="mt-1 text-sm text-mist-2">
          Escoge el cliente, agrega los productos con sus extras y el total se calcula solo.
        </p>
      </div>

      <InvoiceBuilder
        products={products as InvoiceProductOption[]}
        customers={customerOptions}
      />
    </div>
  );
}
