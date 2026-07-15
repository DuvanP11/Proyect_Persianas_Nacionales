import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  formatWhen,
  listNotifications,
  markAllRead,
  markRead,
  unreadCount,
} from "@/lib/notifications";

/**
 * Campana de notificaciones del sitio público.
 *
 * El panel las resuelve en su layout (Server Component), pero el sitio público
 * es estático y su Navbar es un Client Component: leer la cookie ahí volvería
 * dinámicas todas las páginas. Por eso la campana del sitio pregunta por aquí
 * al montarse.
 *
 * A quien no tenga sesión de staff se le responde `{ staff: false }` — sin 401,
 * porque para un visitante anónimo no es un error: simplemente no hay campana.
 */

const STAFF_ROLES = ["ADMIN", "STAFF"];

// La respuesta depende de la cookie de sesión: que no la guarde ningún caché
// intermedio y le sirva la campana de un asesor a otra persona.
const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET() {
  const session = await getSession();
  if (!session || !STAFF_ROLES.includes(session.role)) {
    return NextResponse.json({ staff: false }, { headers: NO_STORE });
  }

  const [rows, unread] = await Promise.all([
    listNotifications(session.uid),
    unreadCount(session.uid),
  ]);

  return NextResponse.json(
    {
      staff: true,
      unread,
      items: rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        href: n.href,
        read: n.readAt != null,
        when: formatWhen(n.createdAt),
      })),
    },
    { headers: NO_STORE },
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !STAFF_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { action?: string; id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (body.action === "all") {
    await markAllRead(session.uid);
  } else if (body.action === "one" && body.id) {
    // markRead ya filtra por userId: nadie puede marcar la notificación de otro.
    await markRead(session.uid, body.id);
  } else {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
