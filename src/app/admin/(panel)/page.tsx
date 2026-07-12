import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-5">
      <p className="text-sm text-mist">{label}</p>
      <p className={`mt-1 font-display text-3xl ${accent ?? "text-cloud"}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const [total, nuevas, contactadas, convertidas] = await Promise.all([
    prisma.quote.count(),
    prisma.quote.count({ where: { status: "NUEVA" } }),
    prisma.quote.count({ where: { status: "CONTACTADA" } }),
    prisma.quote.count({ where: { status: "CONVERTIDA" } }),
  ]);

  const recientes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cloud">Resumen</h1>
        <p className="mt-1 text-sm text-mist">Estado general de las cotizaciones.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total cotizaciones" value={total} />
        <StatCard label="Nuevas" value={nuevas} accent="text-naranja" />
        <StatCard label="Contactadas" value={contactadas} accent="text-morado-light" />
        <StatCard label="Convertidas" value={convertidas} accent="text-emerald-400" />
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-cloud">Últimas cotizaciones</h2>
          <Link href="/admin/cotizaciones" className="text-sm text-morado-light hover:underline">
            Ver todas →
          </Link>
        </div>

        {recientes.length === 0 ? (
          <p className="mt-4 text-sm text-mist">
            Aún no hay cotizaciones registradas. Cuando alguien envíe el formulario
            del sitio, aparecerá aquí.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {recientes.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-cloud">
                    {q.firstName} {q.lastName} · <span className="text-mist">{q.productName}</span>
                  </p>
                  <p className="text-xs text-mist-2">
                    {q.code} · {q.city} · {new Date(q.createdAt).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-xs text-mist">
                  {q.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
