import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NotificationBell, type BellItem } from "@/components/admin/NotificationBell";
import { Logo } from "@/components/layout/Logo";
import { requireAdmin } from "@/lib/auth";
import { formatWhen, listNotifications, unreadCount } from "@/lib/notifications";
import {
  logoutAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "./actions";

const NAV = [
  { href: "/admin", label: "Resumen", icon: "▦" },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: "◑" },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: "✎" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "◎" },
  { href: "/admin/facturas", label: "Facturación", icon: "§" },
  { href: "/admin/productos", label: "Productos", icon: "◫" },
  { href: "/admin/categorias", label: "Categorías", icon: "▤" },
  { href: "/admin/resenas", label: "Reseñas", icon: "★" },
  { href: "/admin/promociones", label: "Promociones", icon: "%" },
  { href: "/admin/inventario", label: "Inventario", icon: "▧" },
];

/** Solo visible para ADMIN: da de alta los ingresos del equipo. */
const OWNER_NAV = [
  { href: "/admin/empleados", label: "Empleados", icon: "☰" },
  { href: "/admin/configuracion", label: "Configuración", icon: "⚙" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const isOwner = session.role === "ADMIN";

  const [notifications, unread] = await Promise.all([
    listNotifications(session.uid),
    unreadCount(session.uid),
  ]);

  const bellItems: BellItem[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    href: n.href,
    read: n.readAt != null,
    when: formatWhen(n.createdAt),
  }));

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:px-6">
      <aside className="md:w-60 md:shrink-0">
        <div className="rounded-2xl border border-line bg-surface/60 p-4 md:sticky md:top-6">
          <div className="px-1 pb-3">
            <Logo />
          </div>
          <Link
            href="/"
            className="mb-3 flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-mist transition hover:border-morado/50 hover:text-cloud"
          >
            <ArrowUpRight className="h-3.5 w-3.5" /> Ver sitio público
          </Link>
          <div className="flex items-center justify-between px-2">
            <p className="text-xs font-medium uppercase tracking-widest text-naranja">
              Panel
            </p>
            <NotificationBell
              items={bellItems}
              unread={unread}
              onMarkAllRead={markAllNotificationsReadAction}
              onMarkRead={markNotificationReadAction}
            />
          </div>
          <nav className="mt-3 space-y-1">
            {[...NAV, ...(isOwner ? OWNER_NAV : [])].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mist transition hover:bg-ink hover:text-cloud"
              >
                <span aria-hidden className="text-morado-light">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 border-t border-line pt-4">
            <p className="px-3 text-xs text-mist-2">
              Sesión · {isOwner ? "Administrador" : "Asesor"}
            </p>
            <p className="truncate px-3 text-sm text-cloud" title={session.email}>
              {session.name ?? session.email}
            </p>
            <form action={logoutAction} className="mt-2 px-1">
              <button
                type="submit"
                className="w-full rounded-lg border border-line px-3 py-1.5 text-left text-sm text-mist transition hover:border-red-500/50 hover:text-red-300"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
