import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

/**
 * Páginas legales. El contenido es un marcador de posición profesional listo
 * para reemplazar por el texto legal definitivo revisado por el cliente.
 * TODO: Sustituir por las políticas oficiales de la empresa.
 */
const docs = {
  privacidad: {
    title: "Política de Privacidad",
    intro:
      "En Cortinería Nacional valoramos y protegemos la privacidad de nuestros clientes y usuarios.",
  },
  "tratamiento-datos": {
    title: "Tratamiento de Datos Personales",
    intro:
      "De acuerdo con la Ley 1581 de 2012 de Colombia, informamos cómo recolectamos, usamos y protegemos tus datos personales.",
  },
  terminos: {
    title: "Términos y Condiciones",
    intro:
      "Los presentes términos regulan el uso del sitio web y la contratación de nuestros productos y servicios.",
  },
} as const;

type DocKey = keyof typeof docs;

export function generateStaticParams() {
  return Object.keys(docs).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const entry = docs[doc as DocKey];
  return { title: entry?.title ?? "Documento legal" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const entry = docs[doc as DocKey];
  if (!entry) notFound();

  return (
    <div className="pt-28 md:pt-36">
      <article className="container-app max-w-3xl pb-16">
        <h1 className="font-display text-4xl font-semibold text-cloud">{entry.title}</h1>
        <p className="mt-4 text-mist">{entry.intro}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-mist">
          <section>
            <h2 className="font-display text-lg font-semibold text-cloud">1. Responsable</h2>
            <p className="mt-2">
              {siteConfig.name}, ubicada en {siteConfig.address.street}, {siteConfig.address.neighborhood},{" "}
              {siteConfig.address.city}. Contacto: {siteConfig.whatsapp.display} · {siteConfig.email}.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-cloud">2. Contenido pendiente</h2>
            <p className="mt-2">
              Esta sección está preparada para incorporar el texto legal definitivo. Reemplaza este
              contenido con las cláusulas oficiales revisadas por tu asesor jurídico.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
