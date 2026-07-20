import { z } from "zod";
import { CHAIN_SIDES } from "@/lib/chain-side";

/**
 * Esquema de una cotización — usado por el formulario (cliente) y la API (servidor).
 * Los campos numéricos se convierten en el formulario con `setValueAs`, de modo
 * que aquí llegan ya como `number` (o `undefined` si están vacíos).
 */
export const quoteSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  apellidos: z.string().min(2, "Ingresa tus apellidos"),
  telefono: z
    .string()
    .min(7, "Teléfono inválido")
    .regex(/^[0-9+\s()-]{7,20}$/, "Teléfono inválido"),
  correo: z.string().email("Correo inválido"),
  ciudad: z.string().min(2, "Ingresa tu ciudad"),
  direccion: z.string().min(4, "Ingresa tu dirección"),
  producto: z.string().min(1, "Selecciona un producto"),
  cantidad: z.number({ message: "Cantidad inválida" }).int().min(1, "Mínimo 1"),
  metros: z.number().min(0).optional(),
  // Posición del mando. Solo se envía si el producto tiene la opción habilitada
  // (ver `lib/chain-side`); en el resto llega vacía y se guarda como null.
  posicionMando: z.enum(CHAIN_SIDES).optional(),
  comentarios: z.string().max(1000).optional(),
  // Módulo de descuento
  tieneVolante: z.boolean().optional(),
  codigoPromo: z.string().max(40).optional(),
  descuentoPct: z.number().min(0).max(100).optional(),
  // Anti-spam: campo oculto que debe venir vacío (honeypot)
  website: z.string().max(0).optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
