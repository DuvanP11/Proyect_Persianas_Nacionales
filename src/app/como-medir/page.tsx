import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Ruler, ArrowRight, MoveHorizontal, MoveVertical } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import {
  ALTO_CASOS,
  ANCHO_CASOS,
  MEASURE_IMAGES,
  MEASURE_TIP,
} from "@/lib/measure-guide";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "¿Cómo medir tus ventanas?",
  description:
    "Guía paso a paso para medir correctamente tus ventanas antes de cotizar tus cortinas o persianas: ancho, alto y las holguras recomendadas.",
};

export default function ComoMedirPage() {
  return (
    <div className="pt-28 md:pt-36">
      <div className="container-app">
        <header className="max-w-2xl">
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-morado-light">
            <Ruler className="h-4 w-4" />
            Guía práctica
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight text-cloud sm:text-5xl">
            ¿Cómo medir tus <span className="text-gradient-brand">ventanas</span>?
          </h1>
          <p className="mt-4 text-mist">
            Para garantizar un producto estético y funcional es necesario tomar las medidas de la
            ventana correctamente. Con esta guía te enseñamos cómo hacerlo. Identifica el tipo de
            ventana que quieres cubrir y sigue las indicaciones. Si prefieres, nuestro equipo puede
            tomar las medidas por ti, sin costo.
          </p>
        </header>

        {/* Ancho */}
        <section className="mt-14">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-morado/15 text-morado-light">
              <MoveHorizontal className="h-5 w-5" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-cloud">Mide el ancho (X)</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-mist">
            Mide el ancho de la ventana y aplica la holgura según su ubicación:
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ANCHO_CASOS.map((c) => (
              <Reveal key={c.caso}>
                <div className="card-premium h-full p-5">
                  <p className="text-sm font-medium text-cloud">{c.caso}</p>
                  <p className="mt-2 font-display text-lg font-semibold text-gradient-brand">{c.formula}</p>
                  <p className="mt-2 text-xs leading-relaxed text-mist">{c.nota}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Alto */}
        <section className="mt-12">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-naranja/15 text-naranja-light">
              <MoveVertical className="h-5 w-5" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-cloud">Mide el alto (Y)</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-mist">
            Mide la altura y ten en cuenta si la ventana llega o no hasta el piso:
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ALTO_CASOS.map((c) => (
              <Reveal key={c.caso}>
                <div className="card-premium h-full p-5">
                  <p className="text-sm font-medium text-cloud">{c.caso}</p>
                  <p className="mt-2 font-display text-lg font-semibold text-gradient-brand">{c.formula}</p>
                  <p className="mt-2 text-xs leading-relaxed text-mist">{c.nota}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Ilustraciones oficiales */}
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-cloud">Guía visual paso a paso</h2>
          <p className="mt-2 max-w-2xl text-sm text-mist">
            Identifica tu tipo de ventana y sigue la ilustración que corresponda.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {MEASURE_IMAGES.map((img, i) => (
              <Reveal key={img.src} delay={i * 0.06}>
                <figure className="overflow-hidden rounded-3xl border border-line bg-white">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={1000}
                    height={1000}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-auto w-full"
                  />
                  <figcaption className="border-t border-line/60 px-4 py-3 text-center text-xs text-mist-2">
                    {img.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Tip */}
        <div className="mt-10 rounded-2xl border border-morado/25 bg-morado/[0.06] p-5 text-sm text-mist">
          <span className="font-medium text-cloud">Tip:</span> {MEASURE_TIP} Envíanoslas y te damos
          una cotización precisa.
        </div>

        {/* CTA */}
        <div className="mt-12 mb-4 flex flex-col items-center gap-4 rounded-3xl border border-line bg-white/[0.02] p-8 text-center">
          <p className="font-display text-2xl font-semibold text-cloud">¿Prefieres que midamos por ti?</p>
          <p className="max-w-md text-sm text-mist">
            Agenda una visita: tomamos las medidas exactas y te asesoramos sin compromiso.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={buildWhatsAppUrl(quickQuoteMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <WhatsAppIcon className="h-4 w-4" /> Agendar por WhatsApp
            </a>
            <Link
              href="/cotizar"
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm text-cloud transition-all hover:-translate-y-0.5 hover:border-morado/60"
            >
              Ir a cotizar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
