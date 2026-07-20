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
  email: "cortinerianacional@gmail.com",

  // Ubicación
  address: {
    street: "Cra. 42A #12-02",
    // Sin barrio en la dirección oficial actual. Se deja vacío (en vez de
    // borrar la clave) para no romper los componentes que ya la leen; todos
    // la imprimen condicionada con `&&`.
    neighborhood: "",
    city: "Bogotá",
    country: "Colombia",
    mapQuery: "Cra. 42A #12-02, Bogotá",
  },

  /**
   * Logotipo oficial (fondo blanco). Se usa en documentos impresos —facturas,
   * remisiones y su vista previa/PDF—, donde el fondo siempre es blanco.
   * La marca de la interfaz sigue siendo el SVG de `components/layout/Logo`,
   * que se adapta a los temas claro y oscuro.
   */
  logo: "/logo.png",

  /**
   * Datos fiscales del emisor — necesarios para la facturación electrónica.
   *
   * ⚠️ TODO: los marcados con "PENDIENTE" hay que reemplazarlos por los reales
   * del RUT antes de presentar nada ante la DIAN. Con valores vacíos el XML se
   * genera igual (para poder trabajar), pero sale marcado como incompleto.
   *
   * Los códigos siguen las tablas de la DIAN:
   *  · `personType`  1 = jurídica, 2 = natural
   *  · `taxLevelCode` régimen: "R-99-PN" (no responsable de IVA), "O-13"/"O-15"…
   *  · `cityCode`/`departmentCode` códigos DANE
   *  · `environment` 1 = producción, 2 = pruebas (habilitación)
   */
  fiscal: {
    legalName: "PENDIENTE — razón social del RUT",
    nit: "", // PENDIENTE, sin dígito de verificación
    dv: "", // PENDIENTE, dígito de verificación
    personType: "2",
    taxLevelCode: "R-99-PN",
    cityCode: "11001",
    cityName: "Bogotá, D.C.",
    departmentCode: "11",
    departmentName: "Bogotá",
    countryCode: "CO",
    countryName: "Colombia",
    postalZone: "",
    environment: "2",
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
    // `label` sigue siendo la fuente del texto accesible (alt/title) aunque en
    // pantalla se muestre el logo de cada entidad.
    // `wide: true` marca las piezas que NO son wordmarks anchos sino
    // ilustraciones casi cuadradas: se muestran más altas para que se lean.
    methods: [
      { id: "nequi", label: "Nequi", logo: "/pagos/nequi.webp" },
      {
        id: "tarjetas",
        label: "Tarjeta débito y crédito",
        logo: "/pagos/tarjetas.jpg",
        wide: true,
      },
      { id: "daviplata", label: "Daviplata", logo: "/pagos/daviplata.png" },
      { id: "davivienda", label: "Davivienda", logo: "/pagos/davivienda.webp" },
    ],
  },

  // Mostrar precios al público. Ponlo en `true` para volver a mostrarlos en la
  // ficha del producto y el estimado del formulario de cotización.
  showPrices: false,
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Partes de la dirección que sí tienen contenido, en orden de lectura.
 * Existe para que footer, facturas y textos legales impriman la misma
 * dirección sin repetir la lógica ni dejar separadores sueltos (" · , ")
 * cuando alguna parte —hoy el barrio— está vacía.
 */
export function addressParts(): string[] {
  const { street, neighborhood, city } = siteConfig.address;
  return [street, neighborhood, city].filter((p) => p.trim().length > 0);
}

/** Dirección en una sola línea, p. ej. "Cra. 42A #12-02 · Bogotá". */
export function addressLine(separator = " · "): string {
  return addressParts().join(separator);
}
