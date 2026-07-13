import { formatCOP } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

type InvoiceWithRelations = {
  number: string;
  amount: number;
  issuedAt: Date;
  order: {
    code: string;
    customer: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      address: string | null;
    };
    quote:
      | {
          code: string;
          productName: string;
          quantity: number;
          meters: number | null;
          address: string | null;
        }
      | null;
  };
};

/** Documento de remisión/factura imprimible (reutilizado por el panel y la vista del cliente). */
export function InvoiceDocument({ invoice }: { invoice: InvoiceWithRelations }) {
  const { order } = invoice;
  const { customer, quote } = order;

  return (
    <div className="rounded-2xl border border-line bg-white p-8 text-neutral-800 shadow-xl print:rounded-none print:border-0 print:shadow-none">
      <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{siteConfig.name}</h1>
          <p className="text-sm text-neutral-500">{siteConfig.slogan}</p>
          <p className="mt-2 text-xs text-neutral-500">
            {siteConfig.address.street} · {siteConfig.address.neighborhood}
            <br />
            {siteConfig.address.city}, {siteConfig.address.country}
            <br />
            Tel/WhatsApp: {siteConfig.whatsapp.display} · {siteConfig.email}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-neutral-900">REMISIÓN</p>
          <p className="font-mono text-sm text-neutral-600">{invoice.number}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {new Date(invoice.issuedAt).toLocaleDateString("es-CO")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 py-6 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">Cliente</p>
          <p className="mt-1 font-medium text-neutral-900">
            {customer.firstName} {customer.lastName}
          </p>
          <p className="text-neutral-600">{customer.phone}</p>
          <p className="text-neutral-600">{customer.email}</p>
          {(quote?.address || customer.address) && (
            <p className="text-neutral-600">{quote?.address ?? customer.address}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Pedido</p>
          <p className="mt-1 font-mono text-neutral-900">{order.code}</p>
          {quote && <p className="text-neutral-600">Cotización {quote.code}</p>}
        </div>
      </div>

      <table className="w-full border-t border-neutral-200 text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
            <th className="py-2">Descripción</th>
            <th className="py-2 text-center">Cant.</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-neutral-100">
            <td className="py-3 text-neutral-800">
              {quote?.productName ?? "Confección a la medida"}
              {quote?.meters != null && (
                <span className="block text-xs text-neutral-500">{quote.meters} m aprox.</span>
              )}
            </td>
            <td className="py-3 text-center text-neutral-800">{quote?.quantity ?? 1}</td>
            <td className="py-3 text-right text-neutral-800">{formatCOP(invoice.amount)}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex justify-end border-t border-neutral-200 pt-4">
        <div className="w-56 text-sm">
          <div className="flex justify-between font-semibold text-neutral-900">
            <span>Total</span>
            <span>{formatCOP(invoice.amount)}</span>
          </div>
          <p className="mt-2 text-right text-xs text-emerald-600">{siteConfig.freeInstall}</p>
        </div>
      </div>

      <p className="mt-8 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-400">
        Gracias por confiar en {siteConfig.name}. Este documento es una remisión de pedido.
      </p>
    </div>
  );
}
