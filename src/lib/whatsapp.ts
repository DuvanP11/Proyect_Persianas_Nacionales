import { siteConfig } from "./site-config";

/**
 * Construye un enlace de WhatsApp (wa.me) con un mensaje prellenado.
 * Se usa tanto para el botón "Cotizar ahora" como para el envío final del
 * formulario de cotización.
 */
export function buildWhatsAppUrl(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${text}`;
}

/**
 * Mensaje genérico para el botón principal "Cotizar ahora".
 * Sin emojis: algunas versiones de WhatsApp los muestran como rombos (◈).
 */
export function quickQuoteMessage(productName?: string): string {
  const base = `Hola, *${siteConfig.name}*. Me gustaría cotizar`;
  return productName
    ? `${base} *${productName}*. ¿Me pueden asesorar?`
    : `${base} cortinas y persianas para mi espacio. ¿Me pueden asesorar?`;
}

export interface QuotePayload {
  nombre: string;
  apellidos: string;
  telefono: string;
  correo: string;
  ciudad: string;
  direccion: string;
  producto: string;
  cantidad: number;
  metros?: number;
  comentarios?: string;
  codigoPromo?: string;
  descuentoPct?: number;
}

/**
 * Arma el mensaje detallado de WhatsApp a partir de una cotización.
 * Se usa solo texto plano con negritas (*así*) para que se vea igual en
 * cualquier dispositivo. Se evitan emojis decorativos porque algunas
 * versiones de WhatsApp los muestran como rombos (◈) cuando no los soportan.
 */
export function quoteToWhatsAppMessage(q: QuotePayload): string {
  const lines = [
    `*Nueva cotización — ${siteConfig.name}*`,
    ``,
    `*Cliente:* ${q.nombre} ${q.apellidos}`,
    `*Teléfono:* ${q.telefono}`,
    `*Correo:* ${q.correo}`,
    `*Ciudad:* ${q.ciudad}`,
    `*Dirección:* ${q.direccion}`,
    ``,
    `*Producto:* ${q.producto}`,
    `*Cantidad:* ${q.cantidad}`,
    q.metros ? `*Metros aprox.:* ${q.metros} m` : null,
    q.codigoPromo
      ? `*Volante promocional:* ${q.codigoPromo} (${q.descuentoPct ?? 0}% dcto.)`
      : null,
    q.comentarios ? `*Comentarios:* ${q.comentarios}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}
