"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 print:hidden",
        scrolled
          ? "border-b border-line/70 bg-ink/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="container-app flex h-16 items-center justify-between md:h-20">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-full px-4 py-2 text-sm text-mist transition-colors hover:bg-white/[0.05] hover:text-cloud"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/cuenta"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mist transition-colors hover:bg-white/[0.05] hover:text-cloud"
          >
            <User className="h-4 w-4" />
            Mi cuenta
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
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-cloud lg:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-line/60 bg-ink/95 backdrop-blur-xl lg:hidden"
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
                  <User className="h-4 w-4" /> Mi cuenta
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
                  <MessageCircle className="h-4 w-4" />
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
