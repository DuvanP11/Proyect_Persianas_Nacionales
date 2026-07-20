"use client";

import { useActionState } from "react";
import { Download, FileCode2, Mail, Printer } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

/**
 * Barra de acciones de una factura: WhatsApp, correo, PDF y XML.
 *
 * No se imprime (`print:hidden`) y se comparte entre el panel y la vista
 * pública del cliente. Cada acción es opcional: la vista del cliente, por
 * ejemplo, no recibe `sendEmailAction` y por eso no muestra ese botón.
 */

export type SendEmailState = { ok?: boolean; error?: string };

const BTN =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-60";

export function InvoiceActions({
  whatsappUrl,
  xmlUrl,
  invoiceId,
  sendEmailAction,
  customerEmail,
}: {
  /** Enlace wa.me ya construido en el servidor. */
  whatsappUrl?: string;
  /** Ruta de descarga del XML. */
  xmlUrl: string;
  invoiceId: string;
  /** Server action que envía la factura por correo. Solo en el panel. */
  sendEmailAction?: (
    prev: SendEmailState,
    formData: FormData,
  ) => Promise<SendEmailState>;
  customerEmail?: string | null;
}) {
  return (
    <div className="print:hidden">
      <div className="flex flex-wrap items-center gap-2">
        {/* Imprimir / PDF: el diálogo del navegador permite "Guardar como PDF",
            que produce el mismo documento que se ve en pantalla. */}
        <button
          type="button"
          onClick={() => window.print()}
          className={`${BTN} bg-gradient-to-r from-morado to-naranja text-white shadow-lg shadow-morado/25 hover:-translate-y-0.5`}
        >
          <Printer className="h-4 w-4" /> Descargar PDF
        </button>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN} bg-[#25D366]/15 text-emerald-400 hover:bg-[#25D366]/25`}
          >
            <WhatsAppIcon className="h-4 w-4" /> Enviar por WhatsApp
          </a>
        )}

        {sendEmailAction && (
          <SendEmailButton
            action={sendEmailAction}
            invoiceId={invoiceId}
            customerEmail={customerEmail}
          />
        )}

        <a
          href={xmlUrl}
          download
          className={`${BTN} border border-line text-mist hover:border-morado/60 hover:text-cloud`}
        >
          <FileCode2 className="h-4 w-4" /> Descargar XML
        </a>
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-mist-2">
        <Download className="h-3 w-3" />
        En el diálogo de impresión elige “Guardar como PDF” para obtener el archivo.
      </p>
    </div>
  );
}

/** Botón de envío por correo, con su propio estado de carga y resultado. */
function SendEmailButton({
  action,
  invoiceId,
  customerEmail,
}: {
  action: (prev: SendEmailState, formData: FormData) => Promise<SendEmailState>;
  invoiceId: string;
  customerEmail?: string | null;
}) {
  const [state, formAction, pending] = useActionState<SendEmailState, FormData>(action, {});

  // Sin correo del cliente no hay a dónde enviar: se explica en vez de fallar.
  if (!customerEmail) {
    return (
      <span
        className={`${BTN} cursor-not-allowed border border-line text-mist-2`}
        title="La factura no tiene un cliente con correo registrado."
      >
        <Mail className="h-4 w-4" /> Sin correo del cliente
      </span>
    );
  }

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="id" value={invoiceId} />
      <button
        type="submit"
        disabled={pending}
        className={`${BTN} bg-morado/15 text-morado-light hover:bg-morado/25`}
        title={`Enviar a ${customerEmail}`}
      >
        <Mail className="h-4 w-4" />
        {pending ? "Enviando…" : state.ok ? "¡Enviada!" : "Enviar por correo"}
      </button>
      {state.error && (
        <span className="w-full text-xs text-red-400">{state.error}</span>
      )}
    </form>
  );
}
