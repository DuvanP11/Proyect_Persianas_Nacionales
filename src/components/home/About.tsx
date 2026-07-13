import Image from "next/image";
import { Target, Eye, Building2, BadgeCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function About() {
  return (
    <section id="nosotros" className="scroll-mt-24 py-20 md:py-28">
      <div className="container-app">
        <SectionHeading
          eyebrow="Quiénes somos"
          title="Pasión por vestir tus ventanas"
          subtitle="Somos una empresa colombiana dedicada a la venta, confección e instalación de cortinas y persianas, creando espacios elegantes y funcionales para hogares y empresas."
        />

        {/* Historia + imagen */}
        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-line">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/hero/oficina.png"
                  alt="Oficina con cortinas y persianas instaladas por Cortinería Nacional"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-5 left-5 rounded-2xl border border-white/15 bg-ink/70 px-4 py-3 backdrop-blur">
                <p className="text-xs text-morado-light">Proyectos a la medida</p>
                <p className="font-display text-base font-semibold text-cloud">Hogares y oficinas</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-morado/15 text-morado-light">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-cloud">Nuestra historia</h3>
              <div className="mt-4 space-y-4 leading-relaxed text-mist">
                <p>
                  En Cortinería Nacional nos especializamos en la venta de persianas y cortinas a la
                  medida de tus necesidades y estilo. Contamos con una amplia variedad de diseños,
                  colores y materiales para que encuentres la opción ideal para tu hogar u oficina.
                </p>
                <p>
                  Nuestro compromiso es brindarte una atención cercana y una asesoría personalizada
                  desde el primer contacto, ayudándote a elegir la mejor alternativa para crear
                  espacios más cómodos, elegantes y funcionales.
                </p>
                <p>
                  Trabajamos con productos de excelente calidad, garantía en nuestros productos e
                  instalación, y materiales diseñados para ofrecer durabilidad y un excelente
                  desempeño con el paso del tiempo. Tu satisfacción es nuestra mayor prioridad.
                </p>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Fabricación propia",
                  "Confección a la medida",
                  "Instalación totalmente gratis",
                  "+10 años de experiencia",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-cloud">
                    <BadgeCheck className="h-4 w-4 shrink-0 text-morado-light" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Misión + Visión */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="card-premium h-full p-7">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-naranja/15 text-naranja-light">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-cloud">Misión</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                Fabricar, confeccionar, comercializar e instalar cortinas y persianas de la más alta
                calidad, ofreciendo soluciones a la medida que combinen innovación, cumplimiento y un
                servicio cercano, para superar las expectativas de cada cliente y embellecer sus
                espacios.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="card-premium h-full p-7">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-morado/15 text-morado-light">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-cloud">Visión</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                Consolidarnos para 2030 como una de las principales referencias en Colombia en
                soluciones para la decoración de ventanas, destacándonos por la innovación, la
                excelencia en el servicio y la satisfacción de nuestros clientes en cada proyecto.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
