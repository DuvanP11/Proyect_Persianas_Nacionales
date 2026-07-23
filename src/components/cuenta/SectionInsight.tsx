"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Info, X } from "lucide-react";

/**
 * Explicación corta de una sección de "Mi cuenta".
 *
 * El cliente entra por primera vez y ve títulos que no le dicen mucho
 * ("Mis cotizaciones", "Mis pedidos"). Esto responde las tres preguntas que se
 * hace: qué va a ver, cómo llega ahí y para qué le sirve.
 *
 * Se puede ocultar y la decisión se recuerda en el navegador: quien ya entendió
 * la sección no tiene que volver a leerla, y siempre queda el enlace para
 * traerla de vuelta.
 */

const CLAVE = (id: string) => `cn_ayuda_${id}`;

export function SectionInsight({
  id,
  ve,
  como,
  sirve,
}: {
  /** Identificador estable; con él se recuerda si el cliente la ocultó. */
  id: string;
  /** Qué verá en la sección. */
  ve: string;
  /** Cómo llega ese contenido / cómo se usa. */
  como: string;
  /** Para qué le sirve. */
  sirve: string;
}) {
  // Arranca visible: si el cliente la ocultó antes, se esconde al montar. Es
  // preferible a esconderla siempre hasta leer el navegador, que dejaría un
  // salto en la página a quien nunca la ha ocultado.
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    try {
      setOculto(window.localStorage.getItem(CLAVE(id)) === "off");
    } catch {
      // Navegación privada con almacenamiento bloqueado: se muestra y ya.
    }
  }, [id]);

  function cambiar(siguiente: boolean) {
    setOculto(siguiente);
    try {
      window.localStorage.setItem(CLAVE(id), siguiente ? "off" : "on");
    } catch {
      /* sin persistencia, pero la sesión actual respeta la elección */
    }
  }

  if (oculto) {
    return (
      <button
        type="button"
        onClick={() => cambiar(false)}
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-mist-2 transition hover:text-morado-light"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        ¿Para qué sirve esta sección?
      </button>
    );
  }

  return (
    <div className="relative mt-4 rounded-2xl border border-morado/25 bg-morado/[0.07] p-4 pr-10 sm:p-5 sm:pr-12">
      <button
        type="button"
        onClick={() => cambiar(true)}
        aria-label="Ocultar esta explicación"
        title="Ocultar"
        className="absolute right-3 top-3 rounded-lg p-1 text-mist-2 transition hover:text-cloud"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 shrink-0 text-morado-light" />
        <p className="text-sm font-medium text-cloud">Cómo funciona esta sección</p>
      </div>

      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-morado-light">Qué verás</dt>
          <dd className="mt-1 text-sm leading-relaxed text-mist">{ve}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-morado-light">Cómo llega aquí</dt>
          <dd className="mt-1 text-sm leading-relaxed text-mist">{como}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-morado-light">Para qué te sirve</dt>
          <dd className="mt-1 text-sm leading-relaxed text-mist">{sirve}</dd>
        </div>
      </dl>
    </div>
  );
}
