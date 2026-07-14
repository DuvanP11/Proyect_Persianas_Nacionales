/**
 * Configuración central del sitio — Cortinería Nacional.
 *
 * Toda la información del negocio vive aquí para poder editarla en un solo lugar.
 * En una fase posterior, estos valores podrán administrarse desde el panel
 * (tabla `SiteSetting` en Prisma) sin tocar código.
 */

export const siteConfig = {
  name: "Cortinería Nacional",
  slogan: "De la máquina a tu puerta",
  description:
    "Venta y confección de cortinas y persianas en diferentes diseños, materiales y colores. Creamos espacios elegantes y funcionales para hogares y empresas.",
  tagline: "Que tus ventanas hablen de tu buen gusto.",

  // Contacto
  whatsapp: {
    // Número en formato internacional, solo dígitos (para el enlace wa.me)
    number: "573125526742",
    display: "312 552 6742",
  },
  email: "contacto@cortinerianacional.com", // Ajustar cuando exista el correo oficial

  // Ubicación
  address: {
    street: "Carrera 61D #52-20 Sur",
    neighborhood: "Barrio Nuevo Muzú",
    city: "Bogotá D.C.",
    country: "Colombia",
    // Coordenadas aproximadas de Nuevo Muzú para el mapa (ajustar si se requiere)
    mapQuery: "Carrera 61D 52-20 Sur, Nuevo Muzú, Bogotá",
  },

  schedule: "Lunes a Sábado, 9:00 a.m. a 6:00 p.m.",

  // Redes sociales
  social: {
    facebook: "https://www.facebook.com/share/1GgcemyYh6/",
    instagram: "https://www.instagram.com/cortinerianacional",
  },

  // URL pública del sitio (para SEO / Open Graph). Ajustar al dominio real.
  url: "https://www.cortinerianacional.com",

  // Beneficio destacado que aparece en cada producto
  freeInstall: "Instalación totalmente GRATIS",

  // Medios de pago aceptados. Se muestran en el footer y en cada producto.
  // `id` mapea al icono en el componente <PaymentMethods>. Ajusta esta lista
  // según los medios reales de la empresa.
  payments: {
    note: "Elige tu medio de pago preferido al confirmar la cotización.",
    methods: [
      { id: "nequi", label: "Nequi" },
      { id: "bold", label: "Bold · Tarjeta débito y crédito" },
      { id: "daviplata", label: "Daviplata" },
      { id: "davivienda", label: "Davivienda" },
    ],
  },

  // Mostrar precios al público. Ponlo en `true` para volver a mostrarlos en la
  // ficha del producto y el estimado del formulario de cotización.
  showPrices: false,
} as const;

export type SiteConfig = typeof siteConfig;
