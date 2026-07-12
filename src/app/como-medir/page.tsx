import type { Metadata } from "next";
import Link from "next/link";
import { Ruler, ArrowRight, ImageIcon, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "¿Cómo medir tus ventanas?",
  description:
    "Guía paso a paso para medir correctamente tus ventanas antes de cotizar tus cortinas o persianas.",
};

/**
 * Pasos de medición. La `image` está vacía a propósito: cuando el cliente
 * entregue las fotos/diagramas, se colocan en `public/como-medir/` y se
 * referencian aquí (p. ej. image: "/como-medir/paso-1.jpg").
 * TODO: Solicitar al cliente las imágenes y explicaciones definitivas.
 */
const steps = [
  {
    title: "Reúne los materiales",
    text: "Necesitarás un flexómetro (metro), papel y lápiz. Recomendamos medir en centímetros para mayor precisión.",
    image: "",
  },
  {
    title: "Decide el tipo de instalación",
    text: "Define si la cortina irá dentro del vano (marco) de la ventana o por fuera, cubriendo el marco. Esto cambia la forma de medir.",
    image: "",
  },
  {
    title: "Mide el ancho",
    text: "Toma el ancho en tres puntos (arriba, centro y abajo) y usa la medida menor si es instalación interna, o suma unos centímetros a cada lado si es externa.",
    image: "",
  },
  {
    title: "Mide el alto",
    text: "Mide desde donde irá el riel o soporte hasta el punto final deseado (repisa, piso o un poco por debajo del marco).",
    image: "",
  },
  {
    title: "Anota y envíanos",
    text: "Registra ancho x alto de cada ventana. Con esos datos te damos una cotización precisa. ¡También podemos ir a tomar las medidas!",
    image: "",
  },
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
            Medir bien es el primer paso para una cortina perfecta. Sigue esta guía; y si prefieres,
            nuestro equipo puede tomar las medidas por ti sin costo.
          </p>
        </header>

        <div className="mt-14 space-y-6">
          {steps.map((step, i) => (
            <Reveal key={i} delay={(i % 2) * 0.06}>
              <div className="card-premium grid items-center gap-6 p-5 md:grid-cols-[220px_1fr] md:p-6">
                {/* Imagen del paso (placeholder reemplazable) */}
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-line bg-ink-soft text-mist-2">
                  {step.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={step.image} alt={step.title} className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <ImageIcon className="h-7 w-7" />
                      <span className="text-xs">Imagen del paso {i + 1}</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-morado to-naranja text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <h2 className="mt-3 font-display text-xl font-semibold text-cloud">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{step.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-line bg-white/[0.02] p-8 text-center">
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
              <MessageCircle className="h-4 w-4" /> Agendar por WhatsApp
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
