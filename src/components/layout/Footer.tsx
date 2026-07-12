import Link from "next/link";
import { MapPin, Phone, Clock, Mail, User, Lock, ArrowRight } from "lucide-react";

// Iconos de marca (lucide v1 los removió) — SVG inline.
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94Z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
import { Logo } from "./Logo";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl, quickQuoteMessage } from "@/lib/whatsapp";

const catalogo = [
  { href: "/catalogo", label: "Catálogo completo" },
  { href: "/catalogo/blackout", label: "Blackout" },
  { href: "/catalogo/sheer-elegance", label: "Sheer Elegance" },
  { href: "/catalogo/persianas-motorizadas", label: "Persianas Motorizadas" },
  { href: "/como-medir", label: "¿Cómo medir?" },
];

const empresa = [
  { href: "/#nosotros", label: "Quiénes somos" },
  { href: "/#referencias", label: "Referencias" },
  { href: "/#calificaciones", label: "Calificaciones" },
  { href: "/cotizar", label: "Cotizar" },
  { href: "/#contacto", label: "Contacto" },
];

const legal = [
  { href: "/politicas/privacidad", label: "Política de privacidad" },
  { href: "/politicas/tratamiento-datos", label: "Tratamiento de datos" },
  { href: "/politicas/terminos", label: "Términos y condiciones" },
  { href: "/sitemap.xml", label: "Mapa del sitio" },
];

export function Footer() {
  return (
    <footer id="contacto" className="relative mt-24 border-t border-line/60 bg-ink-soft/60 print:hidden">
      <div className="container-app py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          {/* Marca + descripción */}
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-mist">
              {siteConfig.description}
            </p>
            <p className="mt-3 text-sm italic text-morado-light">“{siteConfig.tagline}”</p>

            <div className="mt-5 flex gap-3">
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-mist transition-colors hover:border-morado/60 hover:text-cloud"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-mist transition-colors hover:border-morado/60 hover:text-cloud"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Catálogo */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cloud">Catálogo</h3>
            <ul className="mt-4 space-y-2.5">
              {catalogo.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-mist transition-colors hover:text-morado-light">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cloud">Empresa</h3>
            <ul className="mt-4 space-y-2.5">
              {empresa.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-mist transition-colors hover:text-morado-light">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cloud">Contacto</h3>
            <ul className="mt-4 space-y-3.5 text-sm text-mist">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-morado-light" />
                <span>
                  {siteConfig.address.street}
                  <br />
                  {siteConfig.address.neighborhood}
                  <br />
                  {siteConfig.address.city}, {siteConfig.address.country}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-morado-light" />
                <a href={buildWhatsAppUrl(quickQuoteMessage())} target="_blank" rel="noopener noreferrer" className="hover:text-cloud">
                  WhatsApp: {siteConfig.whatsapp.display}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-morado-light" />
                <span>{siteConfig.schedule}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-morado-light" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-cloud">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mapa */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-line/60">
          <iframe
            title="Ubicación Cortinería Nacional"
            src={`https://www.google.com/maps?q=${encodeURIComponent(siteConfig.address.mapQuery)}&output=embed`}
            width="100%"
            height="260"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full grayscale-[0.3] contrast-110"
          />
        </div>

        {/* Accesos — distingue el portal del cliente del panel del equipo */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/cuenta"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/50 p-5 transition-colors hover:border-morado/50"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-morado/15 text-morado-light">
                <User className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-mist-2">Para clientes</p>
                <p className="font-display text-base font-semibold text-cloud">Mi cuenta</p>
                <p className="text-xs text-mist">Ingresa o regístrate para ver tus cotizaciones y pedidos.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-mist transition-transform group-hover:translate-x-1 group-hover:text-morado-light" />
          </Link>

          <Link
            href="/admin/login"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/50 p-5 transition-colors hover:border-naranja/50"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-naranja/15 text-naranja-light">
                <Lock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-mist-2">Para el equipo</p>
                <p className="font-display text-base font-semibold text-cloud">Panel administrativo</p>
                <p className="text-xs text-mist">Acceso del personal a productos, pedidos e inventario.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-mist transition-transform group-hover:translate-x-1 group-hover:text-naranja-light" />
          </Link>
        </div>

        {/* Barra inferior */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-mist-2">
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-mist-2 transition-colors hover:text-morado-light">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
