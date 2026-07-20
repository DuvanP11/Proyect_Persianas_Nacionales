import { chainSideLabel } from "./chain-side";
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

/**
 * Error de envío con un mensaje pensado para MOSTRARSE al usuario.
 *
 * `stage` indica en qué punto del proceso falló, para que los logs digan
 * exactamente dónde mirar en vez de un "no se pudo enviar" genérico.
 */
export class EmailError extends Error {
  constructor(
    message: string,
    readonly stage: "config" | "destinatario" | "proveedor" | "red",
    readonly detail?: string,
  ) {
    super(message);
    this.name = "EmailError";
  }
}

/** `true` si hay un proveedor de correo configurado. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Validación mínima de dirección, para no gastar una llamada al proveedor. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Envía un correo con Resend.
 *
 * LANZA `EmailError` ante cualquier problema, incluida la falta de
 * configuración. Antes esta función era un no-op silencioso cuando no había
 * `RESEND_API_KEY`: devolvía éxito sin enviar nada, así que la interfaz decía
 * "enviada" y el correo nunca llegaba. Quien necesite tolerancia a fallos debe
 * capturar el error explícitamente (lo hace `notifyQuote`, best-effort).
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY?.trim();

  if (!resendKey) {
    throw new EmailError(
      "No hay proveedor de correo configurado: falta la variable RESEND_API_KEY.",
      "config",
    );
  }

  if (!msg.to || !looksLikeEmail(msg.to)) {
    throw new EmailError(
      `La dirección de destino no es válida: "${msg.to}".`,
      "destinatario",
    );
  }

  const from = process.env.EMAIL_FROM?.trim() || "Cortinería Nacional <onboarding@resend.dev>";

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: msg.to, subject: msg.subject, html: msg.html }),
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[mailer] fallo de red hacia Resend:", detail);
    throw new EmailError("No se pudo contactar al servicio de correo.", "red", detail);
  }

  if (!res.ok) {
    // El cuerpo de Resend trae el motivo real (dominio sin verificar, clave
    // inválida, remitente no autorizado…). Sin él, depurar es adivinar.
    const body = await res.text().catch(() => "");
    console.error(`[mailer] Resend respondió ${res.status}:`, body);

    // Los fallos más comunes merecen un mensaje que diga qué hacer.
    let hint = `El servicio de correo respondió ${res.status}.`;
    if (res.status === 401 || res.status === 403) {
      hint = "La clave RESEND_API_KEY es inválida o no tiene permisos.";
    } else if (res.status === 422) {
      hint =
        "Resend rechazó el remitente o el destinatario. Verifica EMAIL_FROM " +
        "y que el dominio esté verificado en Resend.";
    } else if (res.status === 429) {
      hint = "Se superó el límite de envíos del plan de Resend. Intenta más tarde.";
    }
    throw new EmailError(hint, "proveedor", body || undefined);
  }

  console.info(`[mailer] enviado → ${msg.to}: ${msg.subject}`);
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
      ${row("Mando", chainSideLabel(q.posicionMando))}
      ${row("Código promo", q.tieneVolante ? q.codigoPromo : "")}
      ${row("Descuento", q.tieneVolante && q.descuentoPct ? `${q.descuentoPct}%` : "")}
      ${row("Comentarios", q.comentarios)}
    </table>`;
}

/**
 * Notifica al administrador y envía copia al cliente.
 *
 * NUNCA lanza: una cotización no puede perderse porque el correo falle (el
 * cliente ya siguió a WhatsApp y el registro ya está en la base). Los dos
 * envíos son independientes a propósito — que rebote el del administrador no
 * debe dejar al cliente sin su copia.
 *
 * `emailed` dice si al menos uno SALIÓ de verdad, no si hay clave configurada.
 */
export async function notifyQuote(q: QuoteInput): Promise<{ emailed: boolean }> {
  const adminTo = process.env.ADMIN_EMAIL?.trim() || siteConfig.email;
  const rows = quoteRows(q);

  const results = await Promise.allSettled([
    sendEmail({
      to: adminTo,
      subject: `Nueva cotización — ${q.nombre} ${q.apellidos}`,
      html: `<h2 style="font-family:Arial">Nueva cotización</h2>${rows}`,
    }),
    sendEmail({
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
    }),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const quien = i === 0 ? "administrador" : "cliente";
      console.error(`[mailer] no se pudo avisar al ${quien}:`, r.reason?.message ?? r.reason);
    }
  });

  return { emailed: results.some((r) => r.status === "fulfilled") };
}
