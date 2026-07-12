import { Target, Eye, Building2 } from "lucide-react";
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

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* Quiénes somos — texto pendiente del cliente */}
          <Reveal>
            <div className="card-premium h-full p-7">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-morado/15 text-morado-light">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-cloud">Nuestra historia</h3>
              {/* TODO: Reemplazar por el texto oficial de la empresa cuando el cliente lo proporcione. */}
              <p className="mt-3 text-sm leading-relaxed text-mist">
                En Cortinería Nacional convertimos la tela en soluciones que embellecen y transforman
                cada espacio. Trabajamos con dedicación artesanal y estándares profesionales para que
                tus ventanas hablen de tu buen gusto.
              </p>
            </div>
          </Reveal>

          {/* Misión */}
          <Reveal delay={0.08}>
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

          {/* Visión */}
          <Reveal delay={0.16}>
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
