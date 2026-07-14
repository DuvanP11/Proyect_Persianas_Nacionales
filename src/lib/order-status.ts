/** Estados del pedido (flujo de fabricación) y sus etiquetas/estilos. */

export const ORDER_STATUSES = [
  "RECIBIDO",
  "FABRICACION",
  "CORTE",
  "CONFECCION",
  "DESPACHO",
  "INSTALACION",
  "FINALIZADO",
  "CANCELADO",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_META: Record<string, { text: string; cls: string }> = {
  RECIBIDO: { text: "Recibido", cls: "bg-morado/15 text-morado-light" },
  FABRICACION: { text: "En fabricación", cls: "bg-naranja/15 text-naranja-light" },
  CORTE: { text: "Corte", cls: "bg-naranja/15 text-naranja-light" },
  CONFECCION: { text: "Confección", cls: "bg-naranja/15 text-naranja-light" },
  DESPACHO: { text: "En despacho", cls: "bg-sky-500/15 text-sky-300" },
  INSTALACION: { text: "Instalación", cls: "bg-sky-500/15 text-sky-300" },
  FINALIZADO: { text: "Finalizado", cls: "bg-emerald-600/20 text-emerald-300" },
  CANCELADO: { text: "Cancelado", cls: "bg-red-500/15 text-red-300" },
};

/**
 * Mensaje que se le envía al cliente (correo + WhatsApp) cuando su pedido
 * pasa a cada estado. Redactado en tono cercano y sin emojis decorativos.
 */
export const ORDER_CUSTOMER_MSG: Record<string, string> = {
  RECIBIDO:
    "¡Recibimos tu pedido! Ya quedó registrado y muy pronto comenzaremos a trabajarlo.",
  FABRICACION:
    "Tu pedido entró en fabricación. Estamos preparando los materiales para tus cortinas.",
  CORTE:
    "Estamos en la etapa de corte de tus cortinas, midiendo y cortando la tela a tu medida.",
  CONFECCION:
    "Tu pedido está en confección: ya está tomando forma en nuestros talleres.",
  DESPACHO:
    "¡Tu pedido va en camino! Está en despacho hacia tu dirección. Te contactaremos para coordinar la entrega.",
  INSTALACION:
    "Estamos coordinando la instalación de tus cortinas. Recuerda que la instalación es totalmente gratis.",
  FINALIZADO:
    "¡Tu pedido está finalizado! Gracias por confiar en nosotros. Esperamos que disfrutes tus nuevas cortinas.",
  CANCELADO:
    "Tu pedido fue cancelado. Si tienes alguna duda o quieres retomarlo, contáctanos y con gusto te ayudamos.",
};
