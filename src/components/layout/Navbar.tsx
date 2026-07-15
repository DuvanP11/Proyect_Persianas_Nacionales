"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { SiteNotificationBell } from "@/components/admin/SiteNotificationBell";
import { CartMenu } from "@/components/cart/CartMenu";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Logo } from "./Logo";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/como-medir", label: "¿Cómo medir?" },
  { href: "/#categorias", label: "Productos" },
  { href: "/#contacto", label: "Contacto" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // El panel de administración tiene su propia barra lateral: sin navbar público.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 print:hidden",
        scrolled
          ? "border-b border-line/70 bg-ink/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="container-app flex h-16 items-center justify-between gap-3 md:h-20">
        <div className="shrink-0">
          <Logo />
        </div>

        {/* `whitespace-nowrap`: sin esto, en cuanto el espacio aprieta el
            navegador parte las etiquetas de dos palabras ("¿Cómo medir?",
            "Ingreso Cliente") en dos líneas y descuadra la barra. */}
        <ul className="hidden items-center gap-1 xl:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm text-mist transition-colors hover:bg-white/[0.05] hover:text-cloud"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {/* Entre 1280 y 1536 px estos dos accesos se quedan en ícono: con sus
              etiquetas, el contenido de la barra pasa de ~1250 px y solo hay
              ~1216 disponibles, así que volveríamos a apretarla. El nombre sigue
              disponible en el tooltip y para lectores de pantalla. */}
          <Link
            href="/cuenta"
            title="Ingreso Cliente"
            aria-label="Ingreso Cliente"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm text-mist transition-colors hover:bg-white/[0.05] hover:text-cloud"
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="hidden 2xl:inline">Ingreso Cliente</span>
          </Link>
          <Link
            href="/admin/login"
            title="Admin"
            aria-label="Admin"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm text-mist transition-colors hover:bg-white/[0.05] hover:text-cloud"
          >
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden 2xl:inline">Admin</span>
          </Link>
          <Button href="/cotizar" variant="outline" size="sm">
            Cotizar
          </Button>
          <Button
            href={buildWhatsAppUrl(quickQuoteMessage())}
            external
            variant="whatsapp"
            size="sm"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </Button>
          <ThemeSwitcher />
          {/* Solo se pinta si hay sesión de admin o asesor. */}
          <SiteNotificationBell />
          <CartMenu />
        </div>

        {/* Tema + notificaciones + carrito + menú compacto.
            El umbral es `xl` y no `lg` a propósito: entre 1024 y 1280 px no caben
            el logo, cinco enlaces, dos accesos, dos botones y tres íconos, y la
            barra se apretaba hasta romperse. Ese rango también es donde cae un
            monitor normal con el zoom al 110-125 %, que es como se ve el
            problema en la práctica. Ahí ahora sale el menú desplegable. */}
        <div className="flex shrink-0 items-center gap-0.5 xl:hidden">
          <ThemeSwitcher />
          <SiteNotificationBell />
          <CartMenu />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-morado to-naranja text-white shadow-lg shadow-morado/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-morado/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-morado/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-line/60 bg-ink/95 backdrop-blur-xl xl:hidden"
          >
            <ul className="container-app flex flex-col gap-1 py-4">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base text-cloud transition-colors hover:bg-white/[0.05]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cuenta"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-base text-cloud transition-colors hover:bg-white/[0.05]"
                >
                  <User className="h-4 w-4" /> Ingreso Cliente
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-base text-mist transition-colors hover:bg-white/[0.05]"
                >
                  <Lock className="h-4 w-4" /> Admin
                </Link>
              </li>
              <li className="mt-2 flex gap-2 px-1">
                <Button href="/cotizar" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                  Cotizar
                </Button>
                <Button
                  href={buildWhatsAppUrl(quickQuoteMessage())}
                  external
                  variant="whatsapp"
                  size="sm"
                  className="flex-1"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
