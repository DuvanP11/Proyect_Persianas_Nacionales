"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";

/**
 * Botón flotante permanente de WhatsApp (esquina inferior izquierda).
 * Permanece fijo durante el scroll y abre directamente la conversación con la
 * empresa. Se oculta en el panel de administración y al imprimir.
 */
export function FloatingWhatsApp() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <a
      href={buildWhatsAppUrl(quickQuoteMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="group fixed bottom-5 left-5 z-[90] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] transition-transform duration-300 hover:-translate-y-1 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-safe:animate-wa-bounce print:hidden sm:h-16 sm:w-16"
    >
      {/* Onda pulsante detrás del botón */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-wa-ping" />
      <WhatsAppIcon className="relative h-7 w-7 transition-transform duration-300 group-hover:rotate-6 sm:h-8 sm:w-8" />

      {/* Etiqueta que aparece al pasar el cursor (escritorio) */}
      <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-full bg-ink/90 px-3 py-1.5 text-sm font-medium text-cloud opacity-0 shadow-lg ring-1 ring-line transition-opacity duration-300 group-hover:opacity-100 lg:block">
        ¿Necesitas ayuda? Escríbenos
      </span>
    </a>
  );
}
