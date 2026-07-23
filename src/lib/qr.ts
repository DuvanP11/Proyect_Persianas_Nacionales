import "server-only";

import { siteConfig } from "@/lib/site-config";
import { siteUrl } from "@/lib/site-url";

/**
 * Destinos que puede apuntar el código QR del negocio.
 *
 * Es una lista cerrada a propósito: si el texto del QR viniera del navegador,
 * cualquiera podría generar códigos con enlaces ajenos servidos desde nuestro
 * dominio. La imagen se genera en `/api/qr`.
 */
export const QR_DESTINOS = {
  inicio: {
    label: "Página de inicio",
    desc: "La portada del sitio. Es el QR de uso general: tarjetas, volantes, vitrina.",
    path: "/",
  },
  catalogo: {
    label: "Catálogo",
    desc: "Abre directamente el catálogo de productos, sin pasar por la portada.",
    path: "/catalogo",
  },
  cotizar: {
    label: "Cotizar",
    desc: "Abre el formulario de cotización. Útil en la visita de medición.",
    path: "/cotizar",
  },
  medir: {
    label: "Cómo medir",
    desc: "La guía para tomar las medidas de la ventana.",
    path: "/como-medir",
  },
  whatsapp: {
    label: "WhatsApp",
    desc: "Abre una conversación de WhatsApp con el número del negocio.",
    path: null,
  },
} as const;

export type QrDestino = keyof typeof QR_DESTINOS;

export const QR_DESTINO_IDS = Object.keys(QR_DESTINOS) as QrDestino[];

export function esQrDestino(value: string): value is QrDestino {
  return value in QR_DESTINOS;
}

/** Dirección que se codifica en el QR de cada destino. */
export async function qrDestinoUrl(dest: QrDestino): Promise<string> {
  if (dest === "whatsapp") return `https://wa.me/${siteConfig.whatsapp.number}`;
  return siteUrl(QR_DESTINOS[dest].path ?? "/");
}
