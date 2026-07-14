import {
  CreditCard,
  Landmark,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Icono para cada medio de pago (según el `id` en site-config). */
const ICONS: Record<string, LucideIcon> = {
  nequi: Smartphone,
  bold: CreditCard,
  daviplata: Smartphone,
  davivienda: Landmark,
};

/**
 * Medios de pago aceptados. Se usa en el footer (`variant="full"`) y, en versión
 * compacta (`variant="compact"`), en la ficha de producto y el modal del carrito.
 * Los datos salen de `siteConfig.payments` para editarlos en un solo lugar.
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
            variant === "full"
              ? "text-sm uppercase tracking-wider"
              : "text-sm",
          )}
        >
          Medios de pago
        </h3>
      </div>

      <ul
        className={cn(
          "mt-3 flex flex-wrap gap-2",
          variant === "full" && "gap-2.5",
        )}
      >
        {methods.map((m) => {
          const Icon = ICONS[m.id] ?? CreditCard;
          return (
            <li
              key={m.id}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-cloud"
            >
              <Icon className="h-3.5 w-3.5 text-morado-light" />
              {m.label}
            </li>
          );
        })}
      </ul>

      {note && <p className="mt-3 text-xs text-mist">{note}</p>}
    </div>
  );
}
