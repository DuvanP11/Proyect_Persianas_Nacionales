"use client";

import { motion } from "motion/react";
import { MessageCircle, ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36">
      <div className="container-app grid items-center gap-12 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
        {/* Columna de texto */}
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-morado-light backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Fabricación propia · Instalación GRATIS en Bogotá
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="text-gradient-morado">Cortinas y persianas</span>
            <br />
            que visten tus espacios
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-mist">
            En <span className="text-cloud">Cortinería Nacional</span> confeccionamos e instalamos
            cortinas y persianas a la medida, con telas de alta calidad y diseños a tu gusto.{" "}
            <span className="italic text-morado-light">“{siteConfig.slogan}”.</span>
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={buildWhatsAppUrl(quickQuoteMessage())} external variant="primary" size="lg">
              <MessageCircle className="h-5 w-5" />
              Cotizar ahora
            </Button>
            <Button href="/catalogo" variant="outline" size="lg">
              Ver catálogo <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Prueba social */}
          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-naranja text-naranja" />
              ))}
              <span className="ml-1.5 text-sm text-mist">Clientes satisfechos</span>
            </div>
            <div className="h-8 w-px bg-line" />
            <p className="text-sm text-mist">
              <span className="font-display text-lg font-semibold text-cloud">+10</span> años de experiencia
            </p>
          </motion.div>
        </motion.div>

        {/* Columna visual (placeholder premium — reemplazable por foto real) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line card-premium">
            {/* Placeholder de "cortina" con pliegues. Reemplaza por una foto real. */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#26262d_0px,#1a1a20_10px,#26262d_20px)]" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(139,92,246,0.25),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />

            <motion.div
              className="absolute left-5 top-5 rounded-2xl border border-line bg-ink/70 px-4 py-3 backdrop-blur"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-xs text-mist">A la medida</p>
              <p className="font-display text-base font-semibold text-cloud">Diseño exclusivo</p>
            </motion.div>

            <motion.div
              className="absolute bottom-5 right-5 rounded-2xl border border-naranja/30 bg-ink/70 px-4 py-3 backdrop-blur"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-xs text-naranja-light">✔ Instalación</p>
              <p className="font-display text-base font-semibold text-cloud">Totalmente GRATIS</p>
            </motion.div>
          </div>

          {/* Resplandor decorativo */}
          <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-morado/20 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
