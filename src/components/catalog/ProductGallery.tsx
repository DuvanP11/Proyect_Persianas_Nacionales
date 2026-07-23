"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ImageIcon } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductMedia } from "./ProductMedia";
import { SilentVideo } from "@/components/ui/SilentVideo";
import { cn } from "@/lib/utils";

type Media = { type: "image" | "video"; url: string };

export function ProductGallery({ product }: { product: Product }) {
  const media: Media[] = [
    ...product.images.map((url) => ({ type: "image" as const, url })),
    ...product.videos.map((url) => ({ type: "video" as const, url })),
  ];
  const [active, setActive] = useState(0);

  // Sin archivos aún: placeholder elegante.
  if (media.length === 0) {
    return (
      <div>
        <div className="group overflow-hidden rounded-3xl border border-line">
          <ProductMedia product={product} className="aspect-[4/3]" priority />
        </div>
        <p className="mt-3 text-center text-xs text-mist-2">Galería lista para cargar fotos y videos.</p>
      </div>
    );
  }

  const current = media[Math.min(active, media.length - 1)];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-ink-soft">
        {current.type === "image" ? (
          <Image
            src={current.url}
            alt={product.name}
            fill
            priority
            unoptimized={current.url.startsWith("/api/uploads/")}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <SilentVideo src={current.url} controls className="h-full w-full object-cover" />
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {media.map((m, i) => (
            <button
              key={m.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver ${m.type === "video" ? "video" : "imagen"} ${i + 1}`}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border transition",
                i === active ? "border-morado" : "border-line hover:border-morado/50",
              )}
            >
              {m.type === "image" ? (
                <Image src={m.url} alt="" fill sizes="120px" unoptimized={m.url.startsWith("/api/uploads/")} className="object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center bg-ink text-mist-2">
                  <Play className="h-5 w-5" />
                </span>
              )}
            </button>
          ))}
          {media.length < 5 &&
            Array.from({ length: 5 - media.length }).map((_, i) => (
              <div key={`ph-${i}`} className="grid aspect-square place-items-center rounded-xl border border-dashed border-line bg-ink-soft text-mist-2">
                <ImageIcon className="h-4 w-4" />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
