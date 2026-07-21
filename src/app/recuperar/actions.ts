"use server";

import { prisma } from "@/lib/prisma";
import { isEmailConfigured, sendPasswordReset } from "@/lib/mailer";
import { createResetToken } from "@/lib/password-reset";
import { siteUrl } from "@/lib/site-url";

/**
 * `sent`        → mostramos el mensaje neutro "si el correo existe, enviamos el enlace".
 * `contactAdmin`→ no pudimos enviar (sin proveedor de correo o falló): pedimos
 *                 contactar al negocio.
 */
export type RecoverState = { sent?: boolean; contactAdmin?: boolean; error?: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestReset(
  _prev: RecoverState,
  formData: FormData,
): Promise<RecoverState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!emailRe.test(email)) return { error: "Ingresa un correo válido." };

  // Sin proveedor de correo no hay forma de enviar el enlace: se lo decimos
  // antes de tocar la base y le ofrecemos contactar al administrador.
  if (!isEmailConfigured()) {
    return { contactAdmin: true };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Solo enviamos si la cuenta existe y está activa, pero NUNCA revelamos si el
  // correo está registrado o no (evita enumeración de usuarios).
  if (user && user.isActive) {
    try {
      const token = await createResetToken(user.id);
      const link = await siteUrl(`/restablecer?token=${token}`);
      await sendPasswordReset(user.email, link, user.name);
    } catch (e) {
      console.error("[recuperar] no se pudo enviar el enlace:", e);
      return { contactAdmin: true };
    }
  }

  return { sent: true };
}
