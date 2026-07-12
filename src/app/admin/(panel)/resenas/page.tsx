import { prisma } from "@/lib/prisma";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { createReview, toggleReviewApproved, deleteReview } from "./actions";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cloud outline-none focus:border-morado";

function Stars({ n }: { n: number }) {
  return <span className="text-naranja">{"★".repeat(n)}<span className="text-mist-2">{"★".repeat(5 - n)}</span></span>;
}

export default async function ResenasPage() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  const aprobadas = reviews.filter((r) => r.isApproved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cloud">Reseñas</h1>
        <p className="mt-1 text-sm text-mist">
          {reviews.length} en total · {aprobadas} publicadas en el sitio.
        </p>
      </div>

      {/* Alta manual */}
      <form action={createReview} className="rounded-2xl border border-line bg-surface/60 p-5">
        <h2 className="mb-3 font-display text-lg text-cloud">Añadir testimonio</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input name="authorName" placeholder="Nombre del cliente" required className={input} />
          <select name="rating" defaultValue="5" className={input}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>
        </div>
        <textarea name="comment" placeholder="Testimonio…" required rows={2} className={`${input} mt-3`} />
        <button className="mt-3 rounded-full bg-gradient-to-r from-morado to-naranja px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5">
          Publicar testimonio
        </button>
      </form>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/60 p-8 text-center text-sm text-mist">
          Aún no hay reseñas. Añade una arriba o espera a que los clientes las envíen desde su cuenta.
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-cloud">
                    {r.authorName} <Stars n={r.rating} />
                  </p>
                  {r.comment && <p className="mt-1 text-sm text-mist">“{r.comment}”</p>}
                  <p className="mt-1 text-xs text-mist-2">{new Date(r.createdAt).toLocaleDateString("es-CO")}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <form action={toggleReviewApproved}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      className={`rounded-full px-2.5 py-1 text-xs transition ${
                        r.isApproved
                          ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                          : "bg-white/5 text-mist-2 hover:bg-white/10"
                      }`}
                    >
                      {r.isApproved ? "Publicada" : "Oculta"}
                    </button>
                  </form>
                  <form action={deleteReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmDeleteButton name={`la reseña de ${r.authorName}`} />
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
