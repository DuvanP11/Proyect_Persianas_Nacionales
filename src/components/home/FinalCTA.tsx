import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-app">
        <Reveal>
          <div className="card-premium relative overflow-hidden px-6 py-14 text-center md:px-16 md:py-20">
            {/* Resplandores */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-morado/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-naranja/20 blur-3xl" />

            <div className="relative">
              <h2 className="font-display text-3xl font-semibold text-cloud sm:text-4xl md:text-5xl">
                ¿Listo para transformar tus <span className="text-gradient-brand">ventanas</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                Cotiza sin compromiso. Te asesoramos, tomamos medidas e instalamos totalmente gratis.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button href={buildWhatsAppUrl(quickQuoteMessage())} external variant="whatsapp" size="lg">
                  <MessageCircle className="h-5 w-5" />
                  Cotizar por WhatsApp
                </Button>
                <Button href="/cotizar" variant="outline" size="lg">
                  Formulario de cotización <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
