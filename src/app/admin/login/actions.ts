"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok =
    user && user.isActive && verifyPassword(password, user.passwordHash);

  if (!ok) {
    return { error: "Correo o contraseña incorrectos." };
  }
  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    return { error: "Tu cuenta no tiene acceso al panel." };
  }

  // Auditoría best-effort (no bloquea el login si falla).
  try {
    await prisma.auditLog.create({
      data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id },
    });
  } catch {
    /* ignore */
  }

  await setSession(user);
  redirect("/admin");
}
