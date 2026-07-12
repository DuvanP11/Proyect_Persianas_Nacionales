"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { setSession, clearSession } from "@/lib/auth";

export type AuthState = { error?: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerCustomer(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!firstName || !lastName) return { error: "Ingresa tu nombre y apellidos." };
  if (!emailRe.test(email)) return { error: "Ingresa un correo válido." };
  if (!phone) return { error: "Ingresa tu teléfono." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo. Inicia sesión." };
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      name: `${firstName} ${lastName}`,
      phone,
      role: "CUSTOMER",
      customer: {
        create: { firstName, lastName, email, phone, type: "POTENCIAL" },
      },
    },
  });

  await setSession(user);
  redirect("/cuenta");
}

export async function loginCustomer(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Ingresa tu correo y contraseña." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await setSession(user);
  redirect("/cuenta");
}

export async function logoutCustomer(): Promise<void> {
  await clearSession();
  redirect("/");
}
