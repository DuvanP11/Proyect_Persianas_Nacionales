import Image from "next/image";
import { Star, Quote, ImageIcon, MessageSquare, PlayCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SilentVideo } from "@/components/ui/SilentVideo";
import { getApprovedReviews } from "@/lib/reviews";
import { getWorkGallery } from "@/lib/work-gallery";

/**
 * Referencias + Calificaciones.
 * Muestra las reseñas aprobadas desde la base de datos (gestionadas en el panel).
 * Si todavía no hay reseñas, cae a marcadores de posición elegantes.
 */

/**
 * Capturas de conversaciones reales (`public/testimonios`).
 * `width`/`height` = tamaño real del archivo; se muestran a tamaño nativo como
 * máximo porque son capturas pequeñas y estirarlas las emborrona.
 */
const WHATSAPP_PROOF = [
  {
    src: "/testimonios/whatsapp-1.png",
    alt: "Cliente comparte foto de sus cortinas instaladas y agradece el trabajo",
    width: 329,
    height: 253,
  },
  {
    src: "/testimonios/whatsapp-2.png",
    alt: "Cliente destaca la calidad y coordina una nueva entrega",
    width: 270,
    height: 312,
  },
  {
    src: "/testimonios/whatsapp-3.png",
    alt: "Cliente felicita al equipo por el compromiso y el resultado",
    width: 260,
    height: 194,
  },
];

/**
 * Mientras no haya reseñas aprobadas en el panel, se destacan mensajes REALES
 * que los clientes enviaron por WhatsApp. Están transcritos literalmente de las
 * capturas que se muestran más abajo en esta misma sección, así que cualquiera
 * puede contrastarlos — que es justo lo que les da credibilidad.
 *
 * No llevan estrellas: quien escribió estos mensajes nunca puso una
 * calificación, y ponérsela nosotros sería inventarla.
 */
const REAL_QUOTES = [
  { comment: "Quedaron super lindas.", author: "Cliente en Bogotá" },
  {
    comment: "Buena calidad. Tengo otros apartamentos para temas de cortinería.",
    author: "Cliente en Bogotá",
  },
  {
    comment: "Quiero felicitarte por tu arduo compromiso. Muy hermosas, muchas gracias.",
    author: "Cliente en Bogotá",
  },
];

export async function SocialProof() {
  const [{ reviews, average, count }, workGallery] = await Promise.all([
    getApprovedReviews(6),
    getWorkGallery(),
  ]);
  // Sin reseñas aprobadas todavía se muestran los mensajes reales de WhatsApp.
  const hasReviews = reviews.length > 0;

  return (
    <section id="referencias" className="scroll-mt-24 py-20 md:py-28">
      <div className="container-app">
        <SectionHeading
          eyebrow="Referencias y calificaciones"
          title="Lo que dicen nuestros clientes"
          subtitle="Testimonios, trabajos realizados y valoraciones de quienes ya confían en Cortinería Nacional."
        />

        {/* Resumen de calificación — solo cuando hay opiniones que promediar.
            Antes se pintaba un 5.0 con cinco estrellas incluso con cero
            opiniones, que es una nota que nadie ha puesto. */}
        {count > 0 && average != null && (
          <Reveal className="mt-12">
            <div id="calificaciones" className="card-premium mx-auto flex max-w-lg scroll-mt-24 flex-col items-center gap-3 p-8 text-center">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(average)
                        ? "h-6 w-6 fill-naranja text-naranja"
                        : "h-6 w-6 text-mist-2"
                    }
                  />
                ))}
              </div>
              <p className="font-display text-4xl font-semibold text-cloud">{average.toFixed(1)}</p>
              <p className="text-sm text-mist">
                Calificación promedio · {count} {count === 1 ? "opinión" : "opiniones"}
              </p>
            </div>
          </Reveal>
        )}

        {/* Testimonios */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {hasReviews
            ? reviews.map((t, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <figure className="card-premium h-full p-6">
                    <Quote className="h-7 w-7 text-morado-light/60" />
                    <blockquote className="mt-4 text-sm leading-relaxed text-mist">
                      “{t.comment}”
                    </blockquote>
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
              ))
            : REAL_QUOTES.map((t, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <figure className="card-premium h-full p-6">
                    <Quote className="h-7 w-7 text-morado-light/60" />
                    <blockquote className="mt-4 text-sm leading-relaxed text-mist">
                      “{t.comment}”
                    </blockquote>
                    <figcaption className="mt-5 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-cloud">{t.author}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-mist-2">
                        <MessageSquare className="h-3 w-3" /> Por WhatsApp
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
        </div>

        {/* Galería de trabajos realizados — se administra desde el panel. */}
        {workGallery.length > 0 && (
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
            {workGallery.map((item, i) => (
              <Reveal key={item.src + i} delay={i * 0.06}>
                <figure className="card-premium h-full overflow-hidden">
                  <div className="relative aspect-[3/4] bg-ink-soft">
                    {item.type === "video" ? (
                      <SilentVideo
                        src={item.src}
                        controls
                        // "metadata" basta para que el navegador resuelva el
                        // fotograma de #t=0.1 sin descargar el video entero.
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        unoptimized={item.src.startsWith("/api/uploads/")}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  {item.alt && (
                    <figcaption className="flex items-center gap-2 px-4 py-3 text-xs text-mist">
                      {item.type === "video" && <PlayCircle className="h-3.5 w-3.5 text-morado-light" />}
                      {item.alt}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
        )}

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
                <figure className="card-premium flex h-full items-center justify-center p-3">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    // Igual que la guía de medición: PNG pequeño y sin pérdida,
                    // servido tal cual y sin pasar de su tamaño nativo.
                    unoptimized
                    style={{ maxWidth: shot.width }}
                    className="h-auto w-full rounded-xl"
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
