import { Star, Quote, ImageIcon, MessageSquare } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getApprovedReviews } from "@/lib/reviews";

/**
 * Referencias + Calificaciones.
 * Muestra las reseñas aprobadas desde la base de datos (gestionadas en el panel).
 * Si todavía no hay reseñas, cae a marcadores de posición elegantes.
 */

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

        {/* Galería de trabajos + capturas de WhatsApp (placeholder) */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="card-premium flex h-48 flex-col items-center justify-center gap-3 border-dashed p-6 text-center">
              <ImageIcon className="h-8 w-8 text-mist-2" />
              <p className="text-sm text-mist">Galería de trabajos realizados</p>
              <p className="text-xs text-mist-2">Espacio preparado para tus fotografías</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card-premium flex h-48 flex-col items-center justify-center gap-3 border-dashed p-6 text-center">
              <MessageSquare className="h-8 w-8 text-mist-2" />
              <p className="text-sm text-mist">Conversaciones de clientes satisfechos</p>
              <p className="text-xs text-mist-2">Espacio preparado para tus capturas de WhatsApp</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
