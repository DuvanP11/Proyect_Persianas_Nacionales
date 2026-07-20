import "server-only";
import { headers } from "next/headers";

/**
 * URL absoluta del sitio, deducida de la petición en curso.
 *
 * Hace falta para los enlaces que salen de la app (WhatsApp, correo): ahí una
 * ruta relativa no sirve. Se lee de las cabeceras en vez de una variable de
 * entorno para que funcione igual en local, en las previews de Vercel y en el
 * dominio de producción, sin configurar nada.
 */
export async function siteUrl(path = ""): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : "";
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Convierte un teléfono colombiano a los dígitos que espera wa.me,
 * anteponiendo el indicativo 57 si no viene.
 */
export function whatsappDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("57") ? digits : `57${digits}`;
}
