import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import {
  buildLegalDocs,
  LEGAL_DOC_KEYS,
  LEGAL_UPDATED,
  type LegalBlock,
} from "@/lib/legal";
import { getFiscalSettings } from "@/lib/settings";

/**
 * Páginas legales del sitio.
 *
 * El contenido vive en `lib/legal.ts` (una sola fuente para los tres
 * documentos, que comparten la identificación de la empresa y el aviso de
 * vigencia). Aquí solo se maqueta.
 *
 * Los datos fiscales —en particular el NIT— se leen de la configuración que el
 * administrador guarda desde el panel, no del código. Por eso la página es
 * dinámica: al cambiar el NIT, las tres políticas se actualizan solas.
 */

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return LEGAL_DOC_KEYS.map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const fiscal = await getFiscalSettings();
  const entry = buildLegalDocs(fiscal)[doc];
  if (!entry) return { title: "Documento legal" };
  return { title: entry.title, description: entry.intro };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const fiscal = await getFiscalSettings();
  const entry = buildLegalDocs(fiscal)[doc];
  if (!entry) notFound();

  return (
    <div className="pt-28 md:pt-36">
      <article className="container-app max-w-3xl pb-20">
        <h1 className="font-display text-4xl font-semibold text-cloud">{entry.title}</h1>
        <p className="mt-4 text-mist">{entry.intro}</p>
        <p className="mt-2 text-xs text-mist-2">Última actualización: {LEGAL_UPDATED}</p>

        {/* Descripción del tema y de la norma que lo regula. Va destacada
            porque es lo que le da contexto a todo lo que viene después. */}
        <section className="mt-8 space-y-4 rounded-2xl border border-line bg-surface/40 p-6 text-sm leading-relaxed text-mist">
          <h2 className="font-display text-lg font-semibold text-cloud">
            De qué trata este documento
          </h2>
          {entry.descripcion.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
        </section>

        <div className="mt-10 space-y-10">
          {entry.secciones.map((seccion, i) => (
            <section key={seccion.titulo}>
              <h2 className="font-display text-xl font-semibold text-cloud">
                {/* Numeración automática: al insertar una sección nueva no hay
                    que renumerar las demás a mano. */}
                {i + 1}. {seccion.titulo}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-mist">
                {seccion.bloques.map((bloque, j) => (
                  <Bloque key={j} bloque={bloque} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}

/** Renderiza un bloque de contenido según su tipo. */
function Bloque({ bloque }: { bloque: LegalBlock }) {
  if (bloque.tipo === "lista") {
    return (
      <ul className="space-y-2 pl-1">
        {bloque.items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-morado-light" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (bloque.tipo === "aviso") {
    // Destaca lo que el cliente NO debe pasar por alto (excepciones al
    // retracto, ausencia de pagos en línea…).
    return (
      <p className="flex gap-3 rounded-xl border border-naranja/30 bg-naranja/[0.07] px-4 py-3 text-cloud">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-naranja-light" />
        <span>{bloque.texto}</span>
      </p>
    );
  }

  return <p>{bloque.texto}</p>;
}
