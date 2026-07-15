import Image from "next/image";
import { Star, Quote, ImageIcon, MessageSquare, PlayCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getApprovedReviews } from "@/lib/reviews";

/**
 * Referencias + Calificaciones.
 * Muestra las reseñas aprobadas desde la base de datos (gestionadas en el panel).
 * Si todavía no hay reseñas, cae a marcadores de posición elegantes.
 */

/** Fotos y videos de instalaciones reales (`public/galeria`). */
const WORK_GALLERY: { type: "image" | "video"; src: string; poster?: string; alt: string }[] = [
  { type: "video", src: "/galeria/instalacion-1.mp4", poster: "/galeria/instalacion-1.jpeg", alt: "Instalación de riel en ventana de sala" },
  { type: "video", src: "/galeria/instalacion-2.mp4", poster: "/galeria/instalacion-2.jpeg", alt: "Montaje de soportes sobre el marco" },
  { type: "video", src: "/galeria/instalacion-3.mp4", alt: "Instalación terminada en vivienda" },
  { type: "image", src: "/galeria/instalacion-1.jpeg", alt: "Nuestro técnico fijando el soporte al muro" },
  { type: "image", src: "/galeria/instalacion-2.jpeg", alt: "Perforación del riel a la altura del marco" },
];

/** Capturas de conversaciones reales (`public/testimonios`). */
const WHATSAPP_PROOF = [
  { src: "/testimonios/whatsapp-1.png", alt: "Cliente comparte foto de sus cortinas instaladas y agradece el trabajo" },
  { src: "/testimonios/whatsapp-2.png", alt: "Cliente destaca la calidad y coordina una nueva entrega" },
  { src: "/testimonios/whatsapp-3.png", alt: "Cliente felicita al equipo por el compromiso y el resultado" },
];

// Marcadores de posición mientras no haya reseñas reales aprobadas.
const placeholders = [
  { authorName: "Cliente satisfecho", comment: "Espacio reservado para el testimonio real del cliente.", rating: 5 },
  { authorName: "Cliente satisfecho", comment: "Espacio reservado para el testimonio real del cliente.", rating: 5 },
  { authorName: "Cliente satisfecho", comment: "Espacio reservado para el testimonio real del cliente.", rating: 5 },
];

export async function SocialProof() {
  const { reviews, average, count } = await getApprovedReviews(6);
  const testimonials = reviews.length > 0 ? reviews : placeholders;
  const displayAvg = average != null ? average.toFixed(1) : "5.0";

  return (
    <section id="referencias" className="scroll-mt-24 py-20 md:py-28">
      <div className="container-app">
        <SectionHeading
          eyebrow="Referencias y calificaciones"
          title="Lo que dicen nuestros clientes"
          subtitle="Testimonios, trabajos realizados y valoraciones de quienes ya confían en Cortinería Nacional."
        />

        {/* Resumen de calificación */}
        <Reveal className="mt-12">
          <div id="calificaciones" className="card-premium mx-auto flex max-w-lg scroll-mt-24 flex-col items-center gap-3 p-8 text-center">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-naranja text-naranja" />
              ))}
            </div>
            <p className="font-display text-4xl font-semibold text-cloud">{displayAvg}</p>
            <p className="text-sm text-mist">
              {count > 0
                ? `Calificación promedio · ${count} ${count === 1 ? "opinión" : "opiniones"}`
                : "Calificación promedio · Opiniones verificadas próximamente"}
            </p>
          </div>
        </Reveal>

        {/* Testimonios */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="card-premium h-full p-6">
                <Quote className="h-7 w-7 text-morado-light/60" />
                <blockquote className="mt-4 text-sm leading-relaxed text-mist">“{t.comment}”</blockquote>
                <figcaption className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-cloud">{t.authorName}</span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-naranja text-naranja" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {/* Galería de trabajos realizados */}
        <div className="mt-16">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-morado/15 text-morado-light">
              <ImageIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-2xl font-semibold text-cloud">
                Galería de trabajos realizados
              </h3>
              <p className="text-sm text-mist">
                Instalaciones reales de nuestro equipo en casas de Bogotá.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORK_GALLERY.map((item, i) => (
              <Reveal key={item.src} delay={i * 0.06}>
                <figure className="card-premium h-full overflow-hidden">
                  <div className="relative aspect-[3/4] bg-ink-soft">
                    {item.type === "video" ? (
                      <video
                        src={item.src}
                        poster={item.poster}
                        controls
                        preload="metadata"
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <figcaption className="flex items-center gap-2 px-4 py-3 text-xs text-mist">
                    {item.type === "video" && <PlayCircle className="h-3.5 w-3.5 text-morado-light" />}
                    {item.alt}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Conversaciones de clientes satisfechos */}
        <div className="mt-16">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-naranja/15 text-naranja-light">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-2xl font-semibold text-cloud">
                Conversaciones de clientes satisfechos
              </h3>
              <p className="text-sm text-mist">
                Mensajes tal como nos llegaron por WhatsApp al terminar la instalación.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHATSAPP_PROOF.map((shot, i) => (
              <Reveal key={shot.src} delay={i * 0.06}>
                <figure className="card-premium h-full p-3">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={640}
                    height={480}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full rounded-xl"
                  />
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
