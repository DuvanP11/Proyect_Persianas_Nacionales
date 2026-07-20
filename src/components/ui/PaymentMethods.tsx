import Image from "next/image";
import { CreditCard } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Medios de pago aceptados. Se usa en el footer (`variant="full"`) y, en versión
 * compacta (`variant="compact"`), en la ficha de producto y el modal del carrito.
 * Los datos salen de `siteConfig.payments` para editarlos en un solo lugar.
 *
 * Cada entidad se muestra con su logo oficial sobre una pastilla blanca: los
 * logos vienen con fondo blanco y colores de marca fijos, así que sobre el tema
 * oscuro se recortarían como rectángulos y en el claro se perderían contra la
 * página. La pastilla los aísla y se ve igual en ambos temas.
 *
 * El nombre de la entidad viaja en `alt`/`title`: quien no cargue las imágenes o
 * navegue con lector de pantalla sigue sabiendo qué medios se aceptan.
 */
export function PaymentMethods({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const { methods, note } = siteConfig.payments;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-morado-light" />
        <h3
          className={cn(
            "font-semibold text-cloud",
            variant === "full" ? "text-sm uppercase tracking-wider" : "text-sm",
          )}
        >
          Medios de pago
        </h3>
      </div>

      <ul className={cn("mt-3 flex flex-wrap items-center gap-2", variant === "full" && "gap-2.5")}>
        {/* Todas las pastillas miden lo mismo: una sola altura y un solo alto
            de logo. Cualquier imagen nueva debe recortarse con proporción
            apaisada (~2:1) para que entre sin romper la fila. */}
        {methods.map((m) => (
          <li
            key={m.id}
            title={m.label}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-3 shadow-sm"
          >
            <Image
              src={m.logo}
              alt={m.label}
              width={120}
              height={40}
              className="h-6 w-auto object-contain"
            />
          </li>
        ))}
      </ul>

      {note && <p className="mt-3 text-xs text-mist">{note}</p>}
    </div>
  );
}
