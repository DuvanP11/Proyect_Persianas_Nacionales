import { siteConfig } from "./site-config";
import { sendEmail } from "./mailer";
import { sendWhatsAppText } from "./wa-cloud";
import { ORDER_META, ORDER_CUSTOMER_MSG, type OrderStatus } from "./order-status";

interface OrderNotifyInput {
  code: string;                 // Código del pedido (ej: CN-5J5TSG)
  status: OrderStatus;          // Nuevo estado
  firstName: string;
  email: string;
  phone: string;
  productName?: string | null;  // Producto (de la cotización origen, si existe)
  note?: string | null;         // Nota opcional del admin
}

/**
 * Arma el texto de WhatsApp para un cambio de estado (texto plano con
 * negritas, sin símbolos raros). Se usa tanto para el envío automático como
 * para el enlace wa.me de respaldo en el panel del admin.
 */
export function buildOrderStatusWhatsAppText(o: OrderNotifyInput): string {
  const meta = ORDER_META[o.status] ?? ORDER_META.RECIBIDO;
  const detail = ORDER_CUSTOMER_MSG[o.status] ?? "";
  const producto = o.productName ? ` (${o.productName})` : "";

  return [
    `*${siteConfig.name}* — Actualización de tu pedido`,
    ``,
    `Hola ${o.firstName}, tu pedido *${o.code}*${producto} ahora está en estado:`,
    `*${meta.text}*`,
    ``,
    detail,
    o.note ? `\nNota: ${o.note}` : "",
    ``,
    `Cualquier duda escríbenos por aquí. ¡Gracias por confiar en nosotros!`,
  ].join("\n");
}

/**
 * Notifica al cliente (correo + WhatsApp) que su pedido cambió de estado.
 * Best-effort: nunca lanza; si un canal falla, el otro sigue.
 * Devuelve qué canales lograron enviarse.
 */
export async function notifyOrderStatus(
  o: OrderNotifyInput,
): Promise<{ emailed: boolean; whatsapped: boolean }> {
  const meta = ORDER_META[o.status] ?? ORDER_META.RECIBIDO;
  const detail = ORDER_CUSTOMER_MSG[o.status] ?? "";
  const producto = o.productName ? ` (${o.productName})` : "";

  // ---- Mensaje de WhatsApp (texto plano con negritas) ----
  const waBody = buildOrderStatusWhatsAppText(o);

  // ---- Correo (HTML) ----
  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;max-width:520px">
      <h2 style="margin:0 0 4px">Actualización de tu pedido</h2>
      <p style="color:#71717a;margin:0 0 16px">${siteConfig.name} · ${siteConfig.slogan}</p>
      <p>Hola <strong>${o.firstName}</strong>, tu pedido
        <strong>${o.code}</strong>${producto} cambió de estado.</p>
      <p style="margin:16px 0">
        <span style="display:inline-block;background:#6d28d9;color:#fff;
          padding:8px 16px;border-radius:9999px;font-weight:bold">
          ${meta.text}
        </span>
      </p>
      <p style="font-size:15px">${detail}</p>
      ${o.note ? `<p style="color:#71717a"><em>Nota: ${o.note}</em></p>` : ""}
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
      <p style="color:#71717a;font-size:13px">
        ¿Dudas? Escríbenos al WhatsApp ${siteConfig.whatsapp.display}.<br />
        ${siteConfig.name}
      </p>
    </div>`;

  const [emailed, whatsapped] = await Promise.all([
    sendEmail({
      to: o.email,
      subject: `Tu pedido ${o.code} está: ${meta.text} — ${siteConfig.name}`,
      html,
    })
      // Si `sendEmail` resuelve es porque el proveedor lo aceptó; ya no hace
      // falta mirar la variable de entorno (antes era un no-op silencioso).
      .then(() => true)
      .catch((e) => {
        console.error("[order-notify] email:", e instanceof Error ? e.message : e);
        return false;
      }),
    sendWhatsAppText(o.phone, waBody),
  ]);

  return { emailed, whatsapped };
}
