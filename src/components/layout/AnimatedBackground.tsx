"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * ============================================================================
 *  FONDO ANIMADO E INTERACTIVO — Componente aislado y reemplazable
 * ============================================================================
 *  Este es el ÚNICO lugar que debes editar para cambiar el fondo de todo el
 *  sitio. Se monta una sola vez en `layout.tsx`, con `position: fixed` detrás
 *  de todo el contenido (z-index negativo).
 *
 *  Tiene dos capas de movimiento que se suman:
 *
 *   1. AMBIENTE — los blobs flotan solos en ciclos largos. Es lo que se ve en
 *      móvil y tablet, donde no hay cursor que seguir.
 *   2. INTERACTIVA — en equipos con mouse, los blobs se desplazan en paralaje
 *      (cada uno a distinta "profundidad") y un halo sigue al cursor.
 *
 *  RENDIMIENTO — el movimiento del mouse NO provoca renders de React:
 *   · las coordenadas viven en `MotionValue`s, que escriben directo en el DOM;
 *   · el listener es `passive` y se descarta con `requestAnimationFrame`, así
 *     que a lo sumo se procesa un evento por frame;
 *   · solo se engancha si el dispositivo tiene puntero fino (`hover: hover`),
 *     de modo que en táctiles no se paga ningún costo;
 *   · se respeta `prefers-reduced-motion`: sin animación ni seguimiento.
 * ============================================================================
 */
export function AnimatedBackground() {
  const reduceMotion = useReducedMotion();

  // Posición del puntero normalizada a [-0.5, 0.5] desde el centro de la
  // ventana. Se guarda como MotionValue: cambiarla no re-renderiza nada.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // Muelle: el fondo persigue al cursor con inercia en vez de pegarse a él,
  // que es lo que da la sensación "cara" y evita saltos bruscos.
  const springCfg = { stiffness: 40, damping: 20, mass: 0.8 };
  const smoothX = useSpring(pointerX, springCfg);
  const smoothY = useSpring(pointerY, springCfg);

  /** Solo se activa el seguimiento si hay un puntero fino (mouse/trackpad). */
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    // `hover: hover` distingue un mouse real de un dedo. En táctil el fondo
    // se queda con la animación de ambiente, que ya se ve bien.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    setTracking(true);

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      // Un solo cálculo por frame: los mousemove llegan mucho más rápido que
      // los repintados y procesarlos todos sería trabajo tirado a la basura.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        pointerX.set(e.clientX / window.innerWidth - 0.5);
        pointerY.set(e.clientY / window.innerHeight - 0.5);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduceMotion, pointerX, pointerY]);

  // Paralaje: cada blob se mueve una fracción distinta del recorrido del
  // cursor. Los valores negativos van en contra, lo que separa los planos.
  const blob1X = useTransform(smoothX, (v) => v * 90);
  const blob1Y = useTransform(smoothY, (v) => v * 70);
  const blob2X = useTransform(smoothX, (v) => v * -120);
  const blob2Y = useTransform(smoothY, (v) => v * 60);
  const blob3X = useTransform(smoothX, (v) => v * 60);
  const blob3Y = useTransform(smoothY, (v) => v * -80);

  // Halo que sigue al cursor. Se compone como cadena CSS para que el
  // degradado se actualice sin pasar por React.
  const haloX = useTransform(smoothX, (v) => `${50 + v * 100}%`);
  const haloY = useTransform(smoothY, (v) => `${50 + v * 100}%`);
  const halo = useMotionTemplate`radial-gradient(600px circle at ${haloX} ${haloY}, rgba(139,92,246,0.10), transparent 70%)`;

  // Paralaje mínimo de la retícula: da profundidad sin marear.
  const gridX = useTransform(smoothX, (v) => v * -18);
  const gridY = useTransform(smoothY, (v) => v * -18);

  /** Ciclo de flotación de ambiente; se apaga con movimiento reducido. */
  const float = (x: number[], y: number[], duration: number) =>
    reduceMotion
      ? undefined
      : {
          animate: { x, y },
          transition: { duration, repeat: Infinity, ease: "easeInOut" as const },
        };

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink print:hidden"
    >
      {/* Degradado base */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(139,92,246,0.12),transparent),radial-gradient(900px_500px_at_100%_10%,rgba(251,122,30,0.08),transparent)]" />

      {/* Halo que persigue al cursor (solo en equipos con mouse) */}
      {tracking && (
        <motion.div className="absolute inset-0" style={{ background: halo }} />
      )}

      {/* Blobs de color: flotan solos y además responden al cursor */}
      <motion.div
        className="absolute -left-40 top-10 h-[36rem] w-[36rem] rounded-full bg-morado/20 blur-[120px]"
        style={{ x: blob1X, y: blob1Y }}
        {...float([0, 60, 0], [0, 40, 0], 18)}
      />
      <motion.div
        className="absolute right-[-10rem] top-1/3 h-[30rem] w-[30rem] rounded-full bg-naranja/15 blur-[120px]"
        style={{ x: blob2X, y: blob2Y }}
        {...float([0, -50, 0], [0, 60, 0], 22)}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-morado-dark/20 blur-[130px]"
        style={{ x: blob3X, y: blob3Y }}
        {...float([0, 40, 0], [0, -40, 0], 26)}
      />

      {/* Retícula sutil, con paralaje muy leve para dar profundidad */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        style={{ x: gridX, y: gridY }}
      />

      {/* Viñeta inferior para asentar el contenido */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}
