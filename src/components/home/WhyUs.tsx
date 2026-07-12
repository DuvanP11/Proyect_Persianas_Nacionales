import { Ruler, Truck, Sparkles, ShieldCheck, Palette, Wrench } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const benefits = [
  {
    icon: Ruler,
    title: "Confección a la medida",
    text: "Cada cortina y persiana se fabrica según las dimensiones exactas de tus ventanas.",
  },
  {
    icon: Truck,
    title: "De la máquina a tu puerta",
    text: "Producción propia y entrega directa: mejor precio, mejor control de calidad.",
  },
  {
    icon: Wrench,
    title: "Instalación GRATIS",
    text: "Nuestro equipo instala tu producto sin costo adicional. Tú solo disfrutas el resultado.",
  },
  {
    icon: Palette,
    title: "Telas, colores y diseños",
    text: "Amplia variedad de materiales y acabados para que combinen con tu espacio.",
  },
  {
    icon: ShieldCheck,
    title: "Calidad garantizada",
    text: "Materiales de alta durabilidad y acabados profesionales en cada trabajo.",
  },
  {
    icon: Sparkles,
    title: "Asesoría personalizada",
    text: "Te acompañamos por WhatsApp desde la elección hasta la instalación final.",
  },
];

export function WhyUs() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-app">
        <SectionHeading
          eyebrow="¿Por qué elegirnos?"
          title="Elegancia, calidad y confianza"
          subtitle="Creamos espacios elegantes y funcionales para hogares y empresas, cuidando cada detalle del proceso."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={(i % 3) * 0.08}>
              <div className="card-premium group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-morado/50">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-morado/20 to-naranja/20 text-morado-light transition-transform duration-300 group-hover:scale-110">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-cloud">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
