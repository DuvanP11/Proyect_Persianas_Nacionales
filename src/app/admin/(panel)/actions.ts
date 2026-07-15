"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { clearSession, requireAdmin } from "@/lib/auth";
import { markAllRead, markRead } from "@/lib/notifications";

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/admin/login");
}

/** Marca como leídas todas las notificaciones del empleado en sesión. */
export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await requireAdmin();
  await markAllRead(session.uid);
  refresh();
}

/** Marca una notificación concreta como leída (al abrirla desde la campana). */
export async function markNotificationReadAction(id: string): Promise<void> {
  const session = await requireAdmin();
  await markRead(session.uid, id);
  refresh();
}
