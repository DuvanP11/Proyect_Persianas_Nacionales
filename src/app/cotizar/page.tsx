import type { Metadata } from "next";
import { CheckCircle2, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { getCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Cotizar",
  description:
    "Solicita tu cotización de cortinas o persianas a la medida. Respuesta rápida por WhatsApp e instalación totalmente gratis.",
};

const perks = [
  { icon: MessageCircle, text: "Respuesta rápida por WhatsApp" },
  { icon: Truck, text: "Toma de medidas a domicilio" },
  { icon: ShieldCheck, text: "Materiales de alta calidad" },
  { icon: CheckCircle2, text: "Instalación totalmente gratis" },
];

export default async function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string }>;
}) {
  const { producto } = await searchParams;
  const products = await getCatalogProducts();

  return (
    <div className="pt-28 md:pt-36">
      <div className="container-app pb-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Intro */}
          <div className="lg:pt-6">
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-morado-light">
              <span className="h-px w-6 bg-morado/60" />
              Cotización
            </span>
            <h1 className="font-display text-4xl font-semibold leading-tight text-cloud sm:text-5xl">
              Solicita tu <span className="text-gradient-brand">cotización</span>
            </h1>
            <p className="mt-4 text-mist">
              Completa el formulario y te enviaremos por WhatsApp una cotización a la medida de tu
              espacio. Sin compromiso.
            </p>

            <ul className="mt-8 space-y-3">
              {perks.map((p) => (
                <li key={p.text} className="flex items-center gap-3 text-sm text-cloud">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-morado/15 text-morado-light">
                    <p.icon className="h-5 w-5" />
                  </span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Formulario */}
          <QuoteForm initialProduct={producto} products={products} />
        </div>
      </div>
    </div>
  );
}
