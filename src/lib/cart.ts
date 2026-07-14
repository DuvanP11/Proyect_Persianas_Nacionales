/**
 * Carrito de cotización — Cortinería Nacional.
 *
 * El sitio NO procesa pagos: el carrito es un "recopilador de solicitudes".
 * El cliente personaliza cada producto (diseño, color, tela, cantidad, metros),
 * lo agrega al carrito y finalmente envía todo por WhatsApp para su cotización.
 *
 * Aquí viven los tipos, las opciones configurables por defecto y el generador
 * del mensaje de WhatsApp. La persistencia y el estado están en
 * `components/cart/CartContext.tsx`.
 */

import type { ProductColor } from "@/lib/products";
import { siteConfig } from "@/lib/site-config";

/** Una línea del carrito: un producto ya personalizado por el cliente. */
export interface CartItem {
  /** Identificador único de la línea (permite el mismo producto con distinta config). */
  id: string;
  slug: string;
  name: string;
  image?: string;
  design: string;
  color: string;
  colorHex?: string;
  fabric: string;
  quantity: number;
  /** Metros lineales requeridos (admite decimales). */
  meters: number;
}

/**
 * Opciones por defecto usadas cuando un producto no define las suyas.
 * Pueden administrarse más adelante desde la base de datos sin tocar la UI.
 */
export const DEFAULT_DESIGNS = [
  "Moderno",
  "Clásico",
  "Minimalista",
  "Elegante",
  "Otro",
];

export const DEFAULT_COLORS: ProductColor[] = [
  { name: "Blanco", hex: "#f2f2f0" },
  { name: "Negro", hex: "#1a1a1a" },
  { name: "Gris", hex: "#b7bcc1" },
  { name: "Beige", hex: "#e7dcc6" },
  { name: "Café", hex: "#6f4e37" },
  { name: "Azul", hex: "#3b5b8c" },
  { name: "Personalizado", hex: "#8b5cf6" },
];

/** Tipos de tela / textura ofrecidos como base para cualquier producto. */
export const FABRIC_OPTIONS = [
  "Blackout",
  "Lino",
  "Jacquard",
  "Seda",
  "Poliéster",
  "Screen",
  "Sheer",
  "Otra",
];

/**
 * Deriva la lista de diseños de un producto. El catálogo guarda los diseños como
 * texto libre separado por comas o "·" (p. ej. "Liso, Cebra, Matiz"). Si no hay
 * ninguno, se usa la lista por defecto.
 */
export function designOptionsFor(diseno?: string | null): string[] {
  if (!diseno) return DEFAULT_DESIGNS;
  const parsed = diseno
    .split(/[,·/]/)
    .map((d) => d.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_DESIGNS;
}

/** Colores del producto o, si no tiene, la paleta por defecto. */
export function colorOptionsFor(colors?: ProductColor[]): ProductColor[] {
  return colors && colors.length > 0 ? colors : DEFAULT_COLORS;
}

/**
 * Escoge la tela por defecto de un producto intentando adivinarla a partir de su
 * nombre o de su campo `tela` (p. ej. "Blackout" → "Blackout"). Si no hay match,
 * devuelve la primera opción de la lista.
 */
export function defaultFabricFor(name?: string, tela?: string): string {
  const haystack = `${name ?? ""} ${tela ?? ""}`.toLowerCase();
  const found = FABRIC_OPTIONS.find(
    (f) => f !== "Otra" && haystack.includes(f.toLowerCase()),
  );
  return found ?? FABRIC_OPTIONS[0];
}

/** Cantidad total de unidades en el carrito (suma de cantidades). */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, it) => sum + it.quantity, 0);
}

/**
 * Arma el mensaje de WhatsApp con todo el carrito, listo para enviar.
 * Solo texto plano con negritas (*así*) para que se vea igual en cualquier
 * dispositivo. SIN emojis: algunas versiones de WhatsApp los muestran como
 * rombos (◈), lo que se ve poco profesional para la empresa.
 */
export function cartToWhatsAppMessage(items: CartItem[]): string {
  const total = cartCount(items);
  const lines: string[] = [
    `Hola, *${siteConfig.name}*.`,
    `Estoy interesado(a) en cotizar los siguientes productos:`,
    "",
  ];

  items.forEach((it, i) => {
    lines.push(`*${i + 1}) ${it.name}*`);
    lines.push(`   - Diseño: ${it.design}`);
    lines.push(`   - Color: ${it.color}`);
    lines.push(`   - Tela: ${it.fabric}`);
    lines.push(`   - Cantidad: ${it.quantity}`);
    lines.push(`   - Metros: ${formatMeters(it.meters)} m`);
    lines.push("");
  });

  lines.push(`*Total de artículos:* ${total}`);
  lines.push("");
  lines.push("Quedo atento(a) a la cotización. ¡Gracias!");
  return lines.join("\n");
}

/** Formatea metros evitando decimales innecesarios (2 → "2", 3.25 → "3.25"). */
export function formatMeters(m: number): string {
  // Number(...) ya elimina ceros finales: 3.50 → "3.5", 2.0 → "2".
  return String(m);
}
