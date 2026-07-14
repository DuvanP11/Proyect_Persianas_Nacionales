import { siteConfig } from "./site-config";

/**
 * Envío de mensajes de WhatsApp al cliente — WhatsApp Cloud API (Meta).
 *
 * Igual que el mailer, degrada con elegancia: si no hay credenciales
 * configuradas, no falla, solo registra en consola. Para activarlo:
 *   1) Crea una app en https://developers.facebook.com y agrega el producto
 *      "WhatsApp". Obtén el Phone Number ID y un token permanente.
 *   2) Define en `.env`:
 *        WHATSAPP_TOKEN="EAAG..."        (token permanente del sistema)
 *        WHATSAPP_PHONE_ID="123456789"   (ID del número emisor)
 *      Opcional, para mensajes fuera de la ventana de 24 h:
 *        WHATSAPP_TEMPLATE="order_status"    (plantilla aprobada por Meta)
 *        WHATSAPP_TEMPLATE_LANG="es"
 *
 * NOTA IMPORTANTE (política de Meta): un mensaje de texto libre solo llega si
 * el cliente le escribió al negocio en las últimas 24 h. Fuera de esa ventana
 * Meta exige una *plantilla* aprobada. Por eso, si defines WHATSAPP_TEMPLATE,
 * usamos plantilla (recomendado para notificaciones proactivas). Si no, se
 * intenta texto libre (útil para pruebas dentro de la ventana de 24 h).
 */

const API_VERSION = "v21.0";

/** Normaliza un teléfono colombiano a formato internacional (solo dígitos). */
export function toWhatsAppNumber(phone: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("57") ? digits : `57${digits}`;
}

/**
 * Envía un mensaje de WhatsApp al cliente. Devuelve `true` si se envió por la
 * API, `false` si se omitió (sin credenciales) o falló. Nunca lanza.
 *
 * @param toPhone Teléfono del cliente (cualquier formato; se normaliza).
 * @param body    Texto del mensaje (para texto libre y para el cuerpo de la plantilla).
 */
export async function sendWhatsAppText(toPhone: string, body: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const to = toWhatsAppNumber(toPhone);

  if (!token || !phoneId || !to) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[wa-cloud] (simulado) → ${to || "sin número"}: ${body.slice(0, 60)}…`);
    }
    return false;
  }

  const template = process.env.WHATSAPP_TEMPLATE;
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG ?? "es";

  // Meta rechaza parámetros de plantilla con saltos de línea o espacios
  // repetidos: aplanamos el mensaje a una sola línea para el {{1}}.
  const templateParam = body.replace(/\s*\n+\s*/g, " — ").replace(/\s{2,}/g, " ").trim();

  const payload = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: templateLang },
          // La plantilla debe tener un único parámetro {{1}} en el cuerpo.
          components: [
            { type: "body", parameters: [{ type: "text", text: templateParam }] },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body },
      };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[wa-cloud] error ${res.status}: ${detail}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[wa-cloud] fetch error:", e);
    return false;
  }
}

/** Enlace wa.me de respaldo (por si el envío automático está desactivado). */
export function whatsAppFallbackLink(toPhone: string, body: string): string {
  const to = toWhatsAppNumber(toPhone) || siteConfig.whatsapp.number;
  return `https://wa.me/${to}?text=${encodeURIComponent(body)}`;
}
