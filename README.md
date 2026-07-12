# Cortinería Nacional 🪟

Plataforma web premium para la venta, confección e instalación de cortinas y persianas.
**Slogan:** _"De la máquina a tu puerta"._

Aplicación full-stack construida con **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + Prisma + PostgreSQL**.

---

## ✨ Estado del proyecto — Fase 1 (completada)

| Módulo | Estado |
| --- | --- |
| Diseño premium (paleta negro/morado/naranja, tipografía, animaciones) | ✅ |
| Fondo animado aislado y reemplazable | ✅ |
| Página principal (Hero, beneficios, proceso, nosotros, referencias, CTA) | ✅ |
| Catálogo con las 9 líneas de producto | ✅ |
| Buscador inteligente + filtros (color, material, orden) | ✅ |
| Ficha de producto con galería y CTAs | ✅ |
| Cotización → guarda en BD + correo + **abre WhatsApp** con los datos | ✅ |
| Módulo de descuento por volante promocional | ✅ |
| Guía "¿Cómo medir tus ventanas?" (lista para imágenes) | ✅ |
| SEO técnico (metadata, sitemap, robots, Open Graph) | ✅ |
| Modelo de datos completo (Prisma) para todos los módulos | ✅ |

### Próximas fases (estructura ya preparada)
- **Fase 2:** Autenticación (cliente/admin), panel administrativo, dashboard con estadísticas, gestión de productos/clientes/inventario, facturación (PDF), seguimiento de pedidos, auditoría.
- **Fase 3:** Carga de fotos/videos reales (Cloudinary/S3), integraciones (Analytics, Meta Pixel, reCAPTCHA), contenido definitivo de "Quiénes somos", referencias y calificaciones.

---

## 🚀 Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env      # y completa los valores (ver abajo)

# 3. (Opcional) Base de datos — crea una gratis en https://neon.tech
#    Pega la connection string en DATABASE_URL y luego:
npx prisma generate
npx prisma db push

# 4. Levantar en desarrollo
npm run dev                # http://localhost:3000
```

> **Importante:** el sitio funciona sin base de datos. Sin `DATABASE_URL`, la
> cotización sigue abriendo WhatsApp con los datos; solo no se persiste.

---

## 🎨 Personalización rápida

| Quiero cambiar… | Archivo |
| --- | --- |
| Datos del negocio (dirección, WhatsApp, redes, horario) | `src/lib/site-config.ts` |
| Colores / tipografía | `src/app/globals.css` (bloque `@theme`) |
| El fondo animado | `src/components/layout/AnimatedBackground.tsx` |
| Productos del catálogo | `src/lib/products.ts` |
| El logo | `src/components/layout/Logo.tsx` (+ `public/logo.svg`) |
| Pasos de "¿Cómo medir?" e imágenes | `src/app/como-medir/page.tsx` |

---

## 🗂️ Estructura

```
src/
├── app/                      # Rutas (App Router)
│   ├── page.tsx              # Home
│   ├── catalogo/             # Catálogo + [slug] detalle
│   ├── cotizar/              # Formulario de cotización
│   ├── como-medir/           # Guía de medición
│   ├── politicas/[doc]/      # Páginas legales
│   ├── api/cotizaciones/     # Endpoint de cotización
│   ├── sitemap.ts / robots.ts
│   └── layout.tsx            # Fuentes, SEO, Navbar/Footer/fondo
├── components/
│   ├── layout/               # Navbar, Footer, Logo, AnimatedBackground
│   ├── home/                 # Secciones de la página principal
│   ├── catalog/              # ProductCard, filtros, media
│   ├── quote/                # Formulario de cotización
│   └── ui/                   # Button, Reveal, SectionHeading
└── lib/                      # site-config, products, whatsapp, schemas, prisma, mailer…
prisma/schema.prisma          # Modelo de datos completo
```

---

## 🔐 Seguridad
- Validación de formularios con **Zod** (cliente y servidor).
- **Rate limiting** en el endpoint de cotizaciones.
- **Honeypot** anti-spam.
- Cabeceras de seguridad (`next.config.ts`).
- Credenciales solo por variables de entorno.

Hecho con ❤️ para **Cortinería Nacional**.
