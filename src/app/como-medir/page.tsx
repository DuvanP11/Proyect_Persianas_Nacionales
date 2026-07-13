import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Ruler, ArrowRight, MoveHorizontal, MoveVertical } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "¿Cómo medir tus ventanas?",
  description:
    "Guía paso a paso para medir correctamente tus ventanas antes de cotizar tus cortinas o persianas: ancho, alto y las holguras recomendadas.",
};

const anchoCasos = [
  { caso: "Ventana entre paredes", formula: "Ancho = X − 0.5 cm", nota: "Descuenta medio centímetro para que la cortina entre justa entre las dos paredes." },
  { caso: "Ventana libre a un lado", formula: "Ancho = X + 10 cm", nota: "Suma 10 cm hacia el lado libre para cubrir bien la ventana." },
  { caso: "Ventana libre a ambos lados", formula: "Ancho = X + 20 cm", nota: "Suma 10 cm a cada lado (20 cm en total) para una mejor cobertura." },
];

const altoCasos = [
  { caso: "Ventana desde el techo", formula: "Alto = Y + 15 cm", nota: "Suma 15 cm para el soporte arriba y una caída elegante debajo del marco." },
  { caso: "Ventana separada del techo", formula: "Alto = Y + 20 cm", nota: "Suma 20 cm cuando hay espacio entre el techo y la ventana." },
  { caso: "Ventana que va hasta el piso", formula: "Alto = Y − 3 cm", nota: "Descuenta 3 cm para que la cortina no arrastre ni roce el piso." },
];

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
            {anchoCasos.map((c) => (
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
            {altoCasos.map((c) => (
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

        {/* Diagramas */}
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-cloud">Diagramas de referencia</h2>
          <p className="mt-2 max-w-2xl text-sm text-mist">
            Ilustraciones oficiales de medición según el tipo de ventana.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <figure className="overflow-hidden rounded-3xl border border-line bg-white p-3">
                <Image
                  src="/como-medir/tutorial-1.jpg"
                  alt="Cómo medir ventanas que no van hasta el piso — ancho y alto"
                  width={1500}
                  height={844}
                  className="h-auto w-full rounded-2xl"
                />
                <figcaption className="px-2 py-3 text-center text-xs text-neutral-500">
                  Ventanas que no van hasta el piso
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={0.08}>
              <figure className="overflow-hidden rounded-3xl border border-line bg-white p-3">
                <Image
                  src="/como-medir/tutorial-2.jpg"
                  alt="Cómo medir ventanas que van hasta el piso"
                  width={962}
                  height={1255}
                  className="mx-auto h-auto w-full max-w-md rounded-2xl"
                />
                <figcaption className="px-2 py-3 text-center text-xs text-neutral-500">
                  Ventanas que van hasta el piso
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* Tip */}
        <div className="mt-10 rounded-2xl border border-morado/25 bg-morado/[0.06] p-5 text-sm text-mist">
          <span className="font-medium text-cloud">Tip:</span> mide el ancho en tres puntos (arriba,
          centro y abajo) y usa la medida menor. Registra <span className="text-cloud">ancho × alto</span>{" "}
          de cada ventana en centímetros y envíanoslos para darte una cotización precisa.
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
