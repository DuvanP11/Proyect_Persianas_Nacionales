import "server-only";
import { prisma, hasDatabase } from "@/lib/prisma";

/**
 * Notificaciones internas del panel (la campana).
 *
 * Se guarda una fila por empleado destinatario, no una fila global con marca de
 * leído compartida: así cada asesor gestiona su propia bandeja.
 *
 * Todo aquí es best-effort — un fallo notificando nunca debe tumbar el alta de
 * una cotización, que es lo que de verdad le importa al negocio.
 */

export type NotificationType = "COTIZACION" | "PEDIDO" | "ESTADO";

export type NotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

/** Roles que reciben notificaciones de trabajo. */
const STAFF_ROLES = ["ADMIN", "STAFF"] as const;

/**
 * Crea la misma notificación para todos los empleados activos.
 * Devuelve a cuántos se les envió (0 si no hay BD o si falla).
 */
export async function notifyStaff(input: {
  type: NotificationType;
  title: string;
  body?: string | null;
  href?: string | null;
}): Promise<number> {
  if (!hasDatabase) return 0;
  try {
    const staff = await prisma.user.findMany({
      where: { isActive: true, role: { in: [...STAFF_ROLES] } },
      select: { id: true },
    });
    if (staff.length === 0) return 0;

    await prisma.notification.createMany({
      data: staff.map((u) => ({
        userId: u.id,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
      })),
    });
    return staff.length;
  } catch (e) {
    console.error("[notifications] notifyStaff:", e);
    return 0;
  }
}

/** Últimas notificaciones de un empleado (más recientes primero). */
export async function listNotifications(
  userId: string,
  take = 12,
): Promise<NotificationRow[]> {
  if (!hasDatabase) return [];
  try {
    return (await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        href: true,
        readAt: true,
        createdAt: true,
      },
    })) as NotificationRow[];
  } catch (e) {
    console.error("[notifications] list:", e);
    return [];
  }
}

/** Cuántas tiene sin leer (alimenta el globo rojo de la campana). */
export async function unreadCount(userId: string): Promise<number> {
  if (!hasDatabase) return 0;
  try {
    return await prisma.notification.count({ where: { userId, readAt: null } });
  } catch (e) {
    console.error("[notifications] unreadCount:", e);
    return 0;
  }
}

/** Marca como leídas todas las pendientes de un empleado. */
export async function markAllRead(userId: string): Promise<void> {
  if (!hasDatabase) return;
  try {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  } catch (e) {
    console.error("[notifications] markAllRead:", e);
  }
}

/** Marca una sola como leída (al abrirla desde la campana). */
export async function markRead(userId: string, id: string): Promise<void> {
  if (!hasDatabase) return;
  try {
    // El userId va en el where para que nadie pueda marcar la de otro.
    await prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  } catch (e) {
    console.error("[notifications] markRead:", e);
  }
}
