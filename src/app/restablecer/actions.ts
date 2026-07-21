"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { findValidReset, consumeReset } from "@/lib/password-reset";

export type ResetState = { error?: string };

export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden." };
  }

  const valid = await findValidReset(token);
  if (!valid) {
    return { error: "El enlace no es válido o ya expiró. Solicita uno nuevo." };
  }

  await prisma.user.update({
    where: { id: valid.userId },
    data: { passwordHash: hashPassword(password) },
  });
  await consumeReset(token);

  // Auditoría best-effort.
  try {
    await prisma.auditLog.create({
      data: {
        userId: valid.userId,
        action: "PASSWORD_RESET",
        entity: "User",
        entityId: valid.userId,
      },
    });
  } catch {
    /* ignore */
  }

  redirect("/restablecer/listo");
}
