import { ShieldCheck, UserRound } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { prisma, hasDatabase } from "@/lib/prisma";
import { EmployeeForm } from "./EmployeeForm";
import { toggleEmployeeAction } from "./actions";

export const metadata = { title: "Empleados" };

/** Etiquetas de cara al usuario para cada tipo de ingreso. */
const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  STAFF: "Asesor",
};

/**
 * Sugiere el siguiente "Asesor N" libre mirando los nombres ya usados, para no
 * tener que repasar la lista antes de dar de alta a alguien.
 */
function suggestName(names: (string | null)[]): string {
  const usados = new Set(
    names
      .map((n) => n?.match(/^Asesor\s+(\d+)$/i)?.[1])
      .filter(Boolean)
      .map(Number),
  );
  let n = 1;
  while (usados.has(n)) n += 1;
  return `Asesor ${n}`;
}

export default async function EmpleadosPage() {
  const session = await requireOwner();

  const staff = hasDatabase
    ? await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "STAFF"] } },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-cloud">Empleados</h1>
        <p className="mt-1 text-sm text-mist">
          Crea el ingreso de cada persona del equipo y define con qué permisos entra al
          panel. Todos los empleados activos reciben las notificaciones de cotizaciones y
          pedidos en la campana.
        </p>
      </header>

      <EmployeeForm suggestedName={suggestName(staff.map((u) => u.name))} />

      {!hasDatabase ? (
        <div className="card-premium p-6 text-sm text-mist">
          No hay base de datos configurada, así que todavía no se pueden registrar
          empleados.
        </div>
      ) : (
        <div className="card-premium overflow-hidden p-0">
          <div className="border-b border-line px-5 py-3">
            <p className="text-sm font-semibold text-cloud">
              Ingresos registrados <span className="text-mist">({staff.length})</span>
            </p>
          </div>

          <ul className="divide-y divide-line/70">
            {staff.map((u) => {
              const isMe = u.id === session.uid;
              return (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={
                        u.role === "ADMIN"
                          ? "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-naranja/15 text-naranja-light"
                          : "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-morado/15 text-morado-light"
                      }
                    >
                      {u.role === "ADMIN" ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <UserRound className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-cloud">
                        {u.name ?? "Sin nombre"}
                        {isMe && <span className="ml-2 text-xs text-mist-2">(tú)</span>}
                      </p>
                      <p className="truncate text-xs text-mist">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-line px-2.5 py-1 text-xs text-mist">
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                    <span
                      className={
                        u.isActive
                          ? "rounded-full bg-[#25D366]/15 px-2.5 py-1 text-xs text-[#25D366]"
                          : "rounded-full bg-red-500/15 px-2.5 py-1 text-xs text-red-400"
                      }
                    >
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>

                    {!isMe && (
                      <form action={toggleEmployeeAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-line px-3 py-1.5 text-xs text-mist transition hover:border-morado/50 hover:text-cloud"
                        >
                          {u.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
