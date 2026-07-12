import { Reveal } from "@/components/ui/Reveal";

const stats = [
  { value: "9+", label: "Líneas de producto" },
  { value: "100%", label: "A la medida" },
  { value: "GRATIS", label: "Instalación incluida" },
  { value: "+10", label: "Años de experiencia" },
];

export function TrustBar() {
  return (
    <section className="border-y border-line/60 bg-ink-soft/40">
      <div className="container-app grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <p className="font-display text-3xl font-semibold text-gradient-brand md:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-mist">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
