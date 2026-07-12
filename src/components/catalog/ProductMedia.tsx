import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

/**
 * Muestra la imagen principal del producto. Mientras no haya fotos cargadas,
 * renderiza un placeholder degradado elegante con el nombre. Cuando agregues
 * URLs a `product.images`, la foto se mostrará automáticamente.
 */
export function ProductMedia({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const src = product.images[0];

  return (
    <div className={cn("relative overflow-hidden bg-ink-soft", className)}>
      {src ? (
        <Image
          src={src}
          alt={product.name}
          fill
          priority={priority}
          unoptimized={src.startsWith("/api/uploads/")}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105", product.gradient)}>
          {/* Textura tipo "tela" para dar sensación premium al placeholder */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(0,0,0,0.14)_0px,rgba(0,0,0,0.14)_1px,transparent_1px,transparent_9px)] mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,transparent_40%,rgba(0,0,0,0.5))]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end p-5">
            <span className="font-display text-lg font-semibold text-white/90 drop-shadow">
              {product.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
