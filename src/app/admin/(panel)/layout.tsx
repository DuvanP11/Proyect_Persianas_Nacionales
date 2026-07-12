import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "./actions";

const NAV = [
  { href: "/admin", label: "Resumen", icon: "▦" },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: "✎" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "◎" },
  { href: "/admin/productos", label: "Productos", icon: "◫" },
  { href: "/admin/categorias", label: "Categorías", icon: "▤" },
  { href: "/admin/resenas", label: "Reseñas", icon: "★" },
  { href: "/admin/promociones", label: "Promociones", icon: "%" },
  { href: "/admin/inventario", label: "Inventario", icon: "▧" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:px-6">
      <aside className="md:w-56 md:shrink-0">
        <div className="rounded-2xl border border-line bg-surface/60 p-4">
          <p className="px-2 text-xs font-medium uppercase tracking-widest text-naranja">
            Panel
          </p>
          <nav className="mt-3 space-y-1">
            {NAV.map((item) => (
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
            <p className="px-3 text-xs text-mist-2">Sesión</p>
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
