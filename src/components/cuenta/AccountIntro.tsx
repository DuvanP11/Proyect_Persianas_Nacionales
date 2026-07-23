"use client";

import { useEffect, useState } from "react";
import { ClipboardList, MessageCircle, PackageCheck, Star, X } from "lucide-react";

/**
 * Bienvenida de "Mi cuenta": explica de una vez el recorrido completo, para que
 * el cliente entienda qué pasa después de registrarse y por qué las secciones
 * de abajo pueden estar vacías al principio.
 *
 * Se oculta con un clic y no vuelve a aparecer en ese navegador.
 */

const CLAVE = "cn_intro_cuenta";

const PASOS = [
  {
    icon: ClipboardList,
    titulo: "1. Pides tu cotización",
    texto:
      "Eliges el producto, las medidas y la cantidad. Queda registrada con un código y aparece en “Mis cotizaciones”.",
  },
  {
    icon: MessageCircle,
    titulo: "2. Te contactamos",
    texto:
      "Revisamos la solicitud y te escribimos por WhatsApp con el precio final. El estado de la cotización va cambiando aquí mismo.",
  },
  {
    icon: PackageCheck,
    titulo: "3. Sigues tu pedido",
    texto:
      "Cuando confirmas, la cotización se vuelve pedido y puedes ver en qué va: confección, despacho e instalación.",
  },
  {
    icon: Star,
    titulo: "4. Nos cuentas cómo te fue",
    texto:
      "Al final dejas tu reseña. Después de revisarla se publica en el sitio y ayuda a quien está decidiendo.",
  },
];

export function AccountIntro({ nombre }: { nombre: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(CLAVE) === "off") setVisible(false);
    } catch {
      // Almacenamiento bloqueado: se muestra igual.
    }
  }, []);

  function ocultar() {
    setVisible(false);
    try {
      window.localStorage.setItem(CLAVE, "off");
    } catch {
      /* la sesión actual respeta la elección aunque no se pueda guardar */
    }
  }

  if (!visible) return null;

  return (
    <div className="relative mt-8 rounded-2xl border border-line bg-surface/60 p-5 sm:p-6">
      <button
        type="button"
        onClick={ocultar}
        aria-label="Ocultar la bienvenida"
        title="Ocultar"
        className="absolute right-4 top-4 rounded-lg p-1 text-mist-2 transition hover:text-cloud"
      >
        <X className="h-4 w-4" />
      </button>

      <h2 className="pr-8 font-display text-xl text-cloud">
        {nombre}, esta es tu cuenta
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-mist">
        Aquí sigues todo lo tuyo con Cortinería Nacional sin tener que preguntar por
        WhatsApp: en qué va tu cotización, el estado de tu pedido y las remisiones de cada
        entrega. Así funciona:
      </p>

      <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PASOS.map((p) => (
          <li key={p.titulo} className="rounded-xl border border-line bg-white/[0.02] p-4">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-morado/15 text-morado-light">
              <p.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm font-medium text-cloud">{p.titulo}</p>
            <p className="mt-1 text-xs leading-relaxed text-mist">{p.texto}</p>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={ocultar}
        className="mt-5 rounded-full border border-line px-4 py-2 text-xs text-mist transition hover:border-morado/50 hover:text-cloud"
      >
        Entendido, no mostrar de nuevo
      </button>
    </div>
  );
}
