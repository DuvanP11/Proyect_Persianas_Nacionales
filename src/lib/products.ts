/**
 * Catálogo de productos — Cortinería Nacional.
 *
 * Esta es la fuente de datos de la Fase 1. Está tipada exactamente igual que el
 * modelo `Product`/`Category` de Prisma, de modo que en la Fase 2 se reemplaza
 * este arreglo por una consulta a la base de datos SIN tocar la interfaz.
 *
 * Cada categoría deja preparado:
 *  - `images` y `videos`: arreglos vacíos listos para cargar los archivos reales.
 *  - `gradient`: color de respaldo elegante mientras no hay foto (placeholder).
 */

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductCategory {
  slug: string;
  name: string;
}

export interface Product {
  slug: string;
  name: string;
  short: string; // descripción corta para la tarjeta
  description: string; // descripción larga para el detalle
  tela: string;
  material: string;
  diseno: string;
  colors: ProductColor[];
  /** Precio por metro (opcional). `null` => "Cotiza tu medida". */
  pricePerMeter: number | null;
  productionTime: string;
  features: string[];
  images: string[]; // vacío por ahora — se cargan luego
  videos: string[]; // vacío por ahora — se cargan luego
  gradient: string; // clases Tailwind para el placeholder
  featured?: boolean;
  /** Categoría a la que pertenece (solo si está activa). `null` si no tiene. */
  category?: ProductCategory | null;
}

export const products: Product[] = [
  {
    slug: "blackout",
    name: "Blackout",
    short: "Oscuridad total y aislamiento térmico para un descanso perfecto.",
    description:
      "La cortina Blackout bloquea hasta el 100% de la luz exterior, ideal para dormitorios, salas de proyección y espacios donde se busca privacidad absoluta y control de temperatura. Su tejido de alta densidad reduce el ruido y protege del calor.",
    tela: "Poliéster de alta densidad (triple capa)",
    material: "Tejido opaco con revestimiento térmico",
    diseno: "Liso, texturizado y estampado",
    colors: [
      { name: "Blanco humo", hex: "#e7e5e4" },
      { name: "Beige", hex: "#d6c7b0" },
      { name: "Gris plomo", hex: "#6b7280" },
      { name: "Chocolate", hex: "#5b4636" },
      { name: "Negro", hex: "#1c1c1c" },
    ],
    pricePerMeter: 55000,
    productionTime: "3 a 5 días hábiles",
    features: ["Bloqueo total de luz", "Aislamiento térmico", "Reduce el ruido", "Fácil de lavar"],
    images: [],
    videos: [],
    gradient: "from-slate-800 via-slate-700 to-slate-900",
    featured: true,
  },
  {
    slug: "sheer-elegance",
    name: "Sheer Elegance",
    short: "Elegancia translúcida que filtra la luz con sofisticación.",
    description:
      "Sheer Elegance combina franjas de tela y voile que se gradúan para regular la entrada de luz de forma suave y elegante. Aporta luminosidad, privacidad y un acabado premium a cualquier ambiente moderno.",
    tela: "Voile con bandas de tela",
    material: "Poliéster translúcido",
    diseno: "Bandas horizontales graduables",
    colors: [
      { name: "Blanco", hex: "#f5f5f4" },
      { name: "Marfil", hex: "#efe9dd" },
      { name: "Arena", hex: "#cbb994" },
      { name: "Gris perla", hex: "#b8b8b8" },
    ],
    pricePerMeter: 89000,
    productionTime: "4 a 6 días hábiles",
    features: ["Luz graduable", "Privacidad de día", "Acabado premium", "Look moderno"],
    images: [],
    videos: [],
    gradient: "from-zinc-300 via-zinc-200 to-zinc-400",
    featured: true,
  },
  {
    slug: "sistema-2-en-1-sheer-elegance",
    name: "Sistema 2 en 1 Sheer Elegance",
    short: "Doble función: privacidad y control de luz en un solo sistema.",
    description:
      "El sistema 2 en 1 integra Sheer Elegance con una segunda capa opaca, permitiendo pasar de la luz difusa al oscurecimiento total con un solo mecanismo. La solución más versátil para salas y habitaciones.",
    tela: "Voile + banda opaca",
    material: "Doble cortina en un riel",
    diseno: "Sistema dual día/noche",
    colors: [
      { name: "Blanco", hex: "#f5f5f4" },
      { name: "Lino", hex: "#e0d6c3" },
      { name: "Gris", hex: "#9ca3af" },
      { name: "Taupe", hex: "#8a7b6b" },
    ],
    pricePerMeter: 119000,
    productionTime: "5 a 7 días hábiles",
    features: ["Día y noche", "Un solo mecanismo", "Máxima versatilidad", "Diseño elegante"],
    images: [],
    videos: [],
    gradient: "from-stone-400 via-stone-300 to-stone-500",
    featured: true,
  },
  {
    slug: "persianas-verticales",
    name: "Persianas Verticales",
    short: "Líneas verticales que estilizan y controlan la luz a la perfección.",
    description:
      "Las persianas verticales son ideales para ventanales amplios y puertas corredizas. Sus lamas giran 180° para regular la luz y la privacidad, aportando un aire profesional a oficinas y hogares.",
    tela: "Lamas de PVC o tela",
    material: "PVC / poliéster",
    diseno: "Lamas verticales de 89 mm y 127 mm",
    colors: [
      { name: "Blanco", hex: "#fafafa" },
      { name: "Beige", hex: "#d8cbb3" },
      { name: "Gris", hex: "#9aa0a6" },
      { name: "Verde salvia", hex: "#8a9a7b" },
    ],
    pricePerMeter: 48000,
    productionTime: "3 a 5 días hábiles",
    features: ["Ideal para ventanales", "Giro 180°", "Resistente", "Look profesional"],
    images: [],
    videos: [],
    gradient: "from-neutral-600 via-neutral-500 to-neutral-700",
  },
  {
    slug: "persianas-screen",
    name: "Persianas Screen",
    short: "Tejido técnico que protege del sol sin perder la vista exterior.",
    description:
      "Las persianas Screen usan un tejido técnico micro-perforado que filtra los rayos UV y reduce el calor manteniendo la visibilidad hacia el exterior. Perfectas para oficinas, estudios y espacios con mucha luz.",
    tela: "Screen técnico (fibra de vidrio / PVC)",
    material: "Tejido micro-perforado",
    diseno: "Enrollable, apertura del 1% al 10%",
    colors: [
      { name: "Blanco", hex: "#f2f2f0" },
      { name: "Perla", hex: "#ddd8ce" },
      { name: "Gris", hex: "#8f9499" },
      { name: "Grafito", hex: "#3f4348" },
    ],
    pricePerMeter: 72000,
    productionTime: "4 a 6 días hábiles",
    features: ["Protección UV", "Reduce el calor", "Conserva la vista", "Uso comercial"],
    images: [],
    videos: [],
    gradient: "from-gray-600 via-gray-500 to-gray-700",
  },
  {
    slug: "panel-japones",
    name: "Panel Japonés",
    short: "Grandes paneles deslizantes con estética minimalista y limpia.",
    description:
      "El Panel Japonés está compuesto por amplios paños de tela que se deslizan lateralmente, ideal para grandes ventanales y como divisor de ambientes. Su estilo minimalista aporta amplitud y sofisticación.",
    tela: "Screen, Blackout o voile en paneles",
    material: "Paneles rígidos deslizantes",
    diseno: "Paneles de 40 a 60 cm de ancho",
    colors: [
      { name: "Blanco", hex: "#f6f6f4" },
      { name: "Crema", hex: "#e8dfcc" },
      { name: "Gris claro", hex: "#c2c4c6" },
      { name: "Antracita", hex: "#4a4d51" },
    ],
    pricePerMeter: 98000,
    productionTime: "5 a 7 días hábiles",
    features: ["Grandes ventanales", "Divisor de ambientes", "Estilo minimalista", "Deslizamiento suave"],
    images: [],
    videos: [],
    gradient: "from-zinc-500 via-zinc-400 to-zinc-600",
  },
  {
    slug: "persianas-motorizadas",
    name: "Persianas Motorizadas",
    short: "Domótica y confort: controla tus cortinas con un botón o tu voz.",
    description:
      "Automatiza tu hogar u oficina con persianas motorizadas controlables por control remoto, app o asistentes de voz. Programa horarios, integra con domótica y disfruta del máximo confort y sofisticación.",
    tela: "Compatible con Blackout, Screen y Sheer",
    material: "Motor tubular + control inalámbrico",
    diseno: "Enrollable / vertical motorizada",
    colors: [
      { name: "Blanco", hex: "#f4f4f2" },
      { name: "Beige", hex: "#d9cdb5" },
      { name: "Gris", hex: "#8b9096" },
      { name: "Negro", hex: "#26262a" },
    ],
    pricePerMeter: null,
    productionTime: "7 a 10 días hábiles",
    features: ["Control remoto / app", "Compatible domótica", "Programable", "Máximo confort"],
    images: [],
    videos: [],
    gradient: "from-violet-900 via-violet-800 to-slate-900",
    featured: true,
  },
  {
    slug: "hanas-vintage",
    name: "Hanas Vintage",
    short: "Textura artesanal y calidez con un encanto retro atemporal.",
    description:
      "Las cortinas Hanas Vintage aportan una textura artesanal y cálida, con caídas suaves y un aire retro que llena de personalidad los espacios. Perfectas para ambientes acogedores y con carácter.",
    tela: "Lino y algodón texturizado",
    material: "Fibras naturales",
    diseno: "Ondas suaves, estilo vintage",
    colors: [
      { name: "Hueso", hex: "#e9e1d2" },
      { name: "Terracota", hex: "#b5744f" },
      { name: "Mostaza", hex: "#c9a227" },
      { name: "Verde oliva", hex: "#77743f" },
    ],
    pricePerMeter: 84000,
    productionTime: "5 a 8 días hábiles",
    features: ["Textura artesanal", "Fibras naturales", "Caída elegante", "Estilo con carácter"],
    images: [],
    videos: [],
    gradient: "from-amber-800 via-amber-700 to-stone-800",
  },
  {
    slug: "cortinas-tradicionales",
    name: "Cortinas Tradicionales",
    short: "El clásico atemporal, confeccionado a la medida de tu espacio.",
    description:
      "Las cortinas tradicionales son un clásico que nunca pasa de moda: telas nobles, pliegues elegantes y confección a la medida para vestir tus ventanas con distinción. Amplia variedad de telas y acabados.",
    tela: "Amplia variedad (jacquard, gasa, terciopelo)",
    material: "Textil confeccionado a medida",
    diseno: "Pliegues, ojales, presillas y más",
    colors: [
      { name: "Blanco", hex: "#f7f7f5" },
      { name: "Champagne", hex: "#e4d4b8" },
      { name: "Vino", hex: "#6e2b3a" },
      { name: "Azul noche", hex: "#26364f" },
    ],
    pricePerMeter: 65000,
    productionTime: "4 a 7 días hábiles",
    features: ["Confección a medida", "Telas nobles", "Acabados variados", "Estilo clásico"],
    images: [],
    videos: [],
    gradient: "from-rose-950 via-rose-900 to-slate-900",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const productSlugs = products.map((p) => p.slug);
