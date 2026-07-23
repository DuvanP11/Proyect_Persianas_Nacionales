"use client";

import { useEffect, useRef, type VideoHTMLAttributes } from "react";

/**
 * Video sin audio.
 *
 * Los clips del sitio son de instalaciones grabadas en obra: el ruido ambiente
 * no aporta y sorprende al visitante. Aquí se sirven siempre en silencio.
 *
 * Se silencia por `ref` y no solo con el atributo `muted` porque React no
 * escribe ese atributo en el HTML que genera el servidor; con la propiedad el
 * video queda mudo desde el primer fotograma. El listener mantiene el silencio
 * si el visitante (o el navegador) intenta subir el volumen.
 */
export function SilentVideo(props: VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const silenciar = () => {
      if (!video.muted || video.volume !== 0) {
        video.muted = true;
        video.volume = 0;
      }
    };
    silenciar();
    video.addEventListener("volumechange", silenciar);
    return () => video.removeEventListener("volumechange", silenciar);
  }, []);

  return <video ref={ref} muted playsInline {...props} />;
}
