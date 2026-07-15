"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma, hasDatabase } from "@/lib/prisma";

/**
 * Gestión de empleados — solo para el rol ADMIN (ver `requireOwner`).
 *
 * "Tipo de ingreso" = rol con el que entra la persona al panel:
 *   ADMIN → acceso total, incluida esta pantalla.
 *   STAFF → asesor: ve el trabajo del día (cotizaciones, pedidos, catálogo)
 *           y recibe las notificaciones, pero no gestiona empleados.
 * El nombre es libre a propósito, para poder registrarlos como "Asesor 1",
 * "Asesor 2", etc.
 */

export type EmployeeActionState = { error?: string; ok?: string };

const employeeSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().trim().toLowerCase().email("Correo inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  role: z.enum(["ADMIN", "STAFF"], { message: "Tipo de ingreso inválido." }),
  phone: z.string().trim().max(30).optional(),
});

export async function createEmployeeAction(
  _prev: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  await requireOwner();
  if (!hasDatabase) return { error: "No hay base de datos configurada." };

  const parsed = employeeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, email, password, role, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: `Ya existe un usuario con el correo ${email}.` };

  await prisma.user.create({
    data: {
      name,
      email,
      role,
      phone: phone || null,
      passwordHash: hashPassword(password),
    },
  });

  revalidatePath("/admin/empleados");
  return { ok: `${name} ya puede ingresar con ${email}.` };
}

/** Activa o desactiva el ingreso de un empleado sin borrar su historial. */
export async function toggleEmployeeAction(formData: FormData): Promise<void> {
  const session = await requireOwner();
  if (!hasDatabase) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  // Sin esto un admin podría dejarse a sí mismo fuera del panel.
  if (id === session.uid) return;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!user) return;

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  revalidatePath("/admin/empleados");
}

