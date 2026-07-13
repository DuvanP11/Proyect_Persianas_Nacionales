"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";

/**
 * HERO — foto de fondo a sangre completa + overlay + parallax interactivo.
 * La imagen se mueve suavemente con el cursor (profundidad) y respira con un
 * zoom lento (Ken Burns). Se desactiva si el usuario prefiere menos movimiento.
 *
 * Imagen: /hero/showroom.png (cambiar por /hero/oficina.png para la alternativa).
 */
const HERO_IMAGE = "/hero/showroom.png";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Posición normalizada del cursor dentro del hero (-0.5 … 0.5).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 55, damping: 18, mass: 0.4 });

  // La foto se desplaza en sentido contrario al cursor; el contenido, levemente a favor.
  const imgX = useTransform(sx, [-0.5, 0.5], [26, -26]);
  const imgY = useTransform(sy, [-0.5, 0.5], [18, -18]);
  const contentX = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const contentY = useTransform(sy, [-0.5, 0.5], [-6, 6]);

  function handleMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative isolate flex min-h-[92vh] items-center overflow-hidden"
    >
      {/* Capa de foto (parallax + Ken Burns) */}
      <motion.div style={reduce ? undefined : { x: imgX, y: imgY }} className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-[-6%]"
          animate={reduce ? undefined : { scale: [1.08, 1.16, 1.08] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={HERO_IMAGE}
            alt="Ambiente con cortinas y persianas de Cortinería Nacional"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Overlays para legibilidad (oscurece izquierda, base y zona del navbar) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-ink/92 via-ink/70 to-ink/25" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-ink via-ink/25 to-ink/55" />
      <div className="absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-ink/85 to-transparent" />

      {/* Contenido */}
      <motion.div
        style={reduce ? undefined : { x: contentX, y: contentY }}
        className="container-app relative z-10 w-full pb-16 pt-32 md:pt-40"
      >
        <motion.div variants={container} initial="hidden" animate="visible" className="max-w-2xl">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-cloud backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-morado-light" />
            Fabricación propia · Instalación GRATIS en Bogotá
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-4xl font-semibold leading-[1.03] tracking-tight text-cloud drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Soluciones a tu medida,
            <br />
            <span className="text-gradient-morado">estilo para tu hogar.</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-cloud/85">
            En <span className="text-cloud">Cortinería Nacional</span> confeccionamos e instalamos
            cortinas y persianas a la medida, con telas de alta calidad y diseños a tu gusto.{" "}
            <span className="italic text-morado-light">“{siteConfig.slogan}”.</span>
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/cotizar" variant="primary" size="lg">
              Solicitar cotización gratis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={buildWhatsAppUrl(quickQuoteMessage())} external variant="whatsapp" size="lg">
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp
            </Button>
          </motion.div>

          {/* Prueba social */}
          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-naranja text-naranja" />
              ))}
              <span className="ml-1.5 text-sm text-cloud/80">Clientes satisfechos</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <p className="text-sm text-cloud/80">
              <span className="font-display text-lg font-semibold text-cloud">+10</span> años de experiencia
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
