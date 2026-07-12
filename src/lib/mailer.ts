import { siteConfig } from "./site-config";
import type { QuoteInput } from "./schemas";

/**
 * Envío de correos — implementación con degradación elegante.
 *
 * Si no hay proveedor configurado (variables SMTP/RESEND), simplemente registra
 * en consola y no falla. Para activar el envío real:
 *   1) Elige un proveedor (Resend recomendado, o SMTP con nodemailer).
 *   2) Define las variables en `.env` (ver `.env.example`).
 *   3) Implementa el envío dentro de `sendEmail()`.
 *
 * De esta forma el formulario funciona desde el día 1 (abre WhatsApp) y el
 * correo se "enchufa" cuando esté listo, sin tocar el resto del código.
 */

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(msg: EmailMessage): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;

  // Proveedor: Resend (HTTP API, sin dependencias extra)
  if (resendKey) {
    const from = process.env.EMAIL_FROM ?? `Cortinería Nacional <onboarding@resend.dev>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: msg.to, subject: msg.subject, html: msg.html }),
    });
    if (!res.ok) throw new Error(`Resend: ${res.status}`);
    return;
  }

  // Sin proveedor configurado: no-op (log en desarrollo)
  if (process.env.NODE_ENV === "development") {
    console.info(`[mailer] (simulado) → ${msg.to}: ${msg.subject}`);
  }
}

function quoteRows(q: QuoteInput): string {
  const row = (k: string, v: unknown) =>
    v ? `<tr><td style="padding:4px 12px 4px 0;color:#71717a">${k}</td><td style="padding:4px 0;color:#111">${v}</td></tr>` : "";
  return `
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${row("Nombre", `${q.nombre} ${q.apellidos}`)}
      ${row("Teléfono", q.telefono)}
      ${row("Correo", q.correo)}
      ${row("Ciudad", q.ciudad)}
      ${row("Dirección", q.direccion)}
      ${row("Producto", q.producto)}
      ${row("Cantidad", q.cantidad)}
      ${row("Metros aprox.", q.metros)}
      ${row("Código promo", q.tieneVolante ? q.codigoPromo : "")}
      ${row("Descuento", q.tieneVolante && q.descuentoPct ? `${q.descuentoPct}%` : "")}
      ${row("Comentarios", q.comentarios)}
    </table>`;
}

/** Notifica al administrador y envía copia al cliente. Nunca lanza (best-effort). */
export async function notifyQuote(q: QuoteInput): Promise<{ emailed: boolean }> {
  try {
    const adminTo = process.env.ADMIN_EMAIL ?? siteConfig.email;
    const rows = quoteRows(q);

    await sendEmail({
      to: adminTo,
      subject: `Nueva cotización — ${q.nombre} ${q.apellidos}`,
      html: `<h2 style="font-family:Arial">Nueva cotización</h2>${rows}`,
    });

    await sendEmail({
      to: q.correo,
      subject: `Recibimos tu cotización — ${siteConfig.name}`,
      html: `
        <div style="font-family:Arial;color:#111">
          <h2>¡Gracias, ${q.nombre}! 🪟</h2>
          <p>Recibimos tu solicitud de cotización. Nuestro equipo te contactará muy pronto.</p>
          ${rows}
          <p style="margin-top:16px">Recuerda: <strong>la instalación es totalmente gratis</strong>.</p>
          <p style="color:#71717a">${siteConfig.name} · ${siteConfig.slogan}</p>
        </div>`,
    });

    return { emailed: Boolean(process.env.RESEND_API_KEY) };
  } catch (e) {
    console.error("[mailer] error:", e);
    return { emailed: false };
  }
}
