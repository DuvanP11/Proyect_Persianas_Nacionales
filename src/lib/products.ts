/**
 * Catálogo de productos — Cortinería Nacional.
 *
 * Contenido tomado del catálogo digital de la empresa (especificaciones, paletas
 * de color y fotos de ambiente). Estos datos siembran la base de datos
 * (`npm run seed:products`) y sirven de respaldo si no hay BD.
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
  images: string[];
  videos: string[];
  gradient: string; // clases Tailwind para el placeholder
  featured?: boolean;
  /** Categoría a la que pertenece (solo si está activa). `null` si no tiene. */
  category?: ProductCategory | null;
}

/**
 * Fotografías reales de cada línea, en `public/catalog/<slug>/01.jpg`…
 * Se numeran de forma correlativa, así que basta con indicar cuántas hay.
 */
function fotos(slug: string, cantidad: number): string[] {
  return Array.from(
    { length: cantidad },
    (_, i) => `/catalog/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
  );
}

export const products: Product[] = [
  {
    slug: "blackout",
    name: "Blackout",
    short: "Oscuridad total y aislamiento térmico para un descanso perfecto.",
    description:
      "La cortina Blackout bloquea hasta el 100% de la luz exterior, ideal para dormitorios, salas de proyección y espacios donde se busca privacidad absoluta y control de temperatura. Tejido en 100% poliéster de alta densidad, con protección UV del 100% y excelente solidez del color a la luz (Class 4.5). Su superficie opaca reduce el ruido y protege del calor.",
    tela: "100% Poliéster de alta densidad",
    material: "Tejido opaco — bloqueo solar total · Protección UV 100%",
    diseno: "Liso, Cebra, Matiz, Rayas y Pop",
    colors: [
      { name: "Blanco", hex: "#f2f2f0" },
      { name: "Crema", hex: "#e7dcc6" },
      { name: "Fawn", hex: "#ddd2bb" },
      { name: "Gris", hex: "#b7bcc1" },
      { name: "Humo", hex: "#b3c4d6" },
      { name: "Titanio", hex: "#6b7581" },
      { name: "Negro", hex: "#1a1a1a" },
    ],
    pricePerMeter: 55000,
    productionTime: "3 a 5 días hábiles",
    features: ["Bloqueo total de luz", "Protección UV 100%", "Aislamiento térmico", "Reduce el ruido"],
    images: [...fotos("blackout", 8), "/catalog/blackout.jpg"],
    videos: [],
    gradient: "from-slate-800 via-slate-700 to-slate-900",
    featured: true,
  },
  {
    slug: "sheer-elegance",
    name: "Sheer Elegance",
    short: "Elegancia translúcida que gradúa la luz con sofisticación.",
    description:
      "Sheer Elegance combina franjas de tela opaca y de voile translúcido que se gradúan para regular la entrada de luz de forma suave y elegante. Compuesta en PVC y poliéster con protección UV del 99%, aporta luminosidad, privacidad de día y un acabado premium a cualquier ambiente moderno. Franja opaca de 7.5 cm y franja traslúcida de 5 cm.",
    tela: "Voile con bandas de tela (65% PVC · 35% Poliéster)",
    material: "Termofijado de alta temperatura · Protección UV 99%",
    diseno: "Bandas horizontales graduables (día/noche)",
    colors: [
      { name: "White Linen", hex: "#e9e4d6" },
      { name: "Arena", hex: "#d7c9ad" },
      { name: "Gris Blanco", hex: "#c8c8c8" },
      { name: "Titanio", hex: "#8b8e91" },
      { name: "Gris Negro", hex: "#484b50" },
    ],
    pricePerMeter: 89000,
    productionTime: "4 a 6 días hábiles",
    features: ["Luz graduable", "Privacidad de día", "Acabado premium", "Look moderno"],
    images: [...fotos("sheer-elegance", 17), "/catalog/sheer-elegance.jpg"],
    videos: [],
    gradient: "from-zinc-300 via-zinc-200 to-zinc-400",
    featured: true,
  },
  {
    slug: "sistema-2-en-1-sheer-elegance",
    name: "Sistema 2 en 1 Sheer Elegance",
    short: "Doble función: privacidad y control de luz en un solo sistema.",
    description:
      "El sistema Sheer Screen 2 en 1 integra la elegancia translúcida del sheer con una capa tipo screen, permitiendo pasar de la luz difusa al oscurecimiento con un solo mecanismo. La solución más versátil para salas y habitaciones, con telas termofijadas de alta temperatura y protección UV.",
    tela: "Voile + banda screen (PVC · Poliéster)",
    material: "Doble cortina en un riel · Termofijado de alta temperatura",
    diseno: "Sistema dual día/noche",
    colors: [
      { name: "Blanco", hex: "#f0ece2" },
      { name: "Lino", hex: "#e0d6c3" },
      { name: "Gris", hex: "#9ca3af" },
      { name: "Taupe", hex: "#8a7b6b" },
    ],
    pricePerMeter: 119000,
    productionTime: "5 a 7 días hábiles",
    features: ["Día y noche", "Un solo mecanismo", "Máxima versatilidad", "Diseño elegante"],
    images: [
      ...fotos("sistema-2-en-1-sheer-elegance", 1),
      "/catalog/sistema-2en1.jpg",
    ],
    videos: [],
    gradient: "from-stone-400 via-stone-300 to-stone-500",
    featured: true,
  },
  {
    slug: "persianas-verticales",
    name: "Persianas Verticales",
    short: "Líneas verticales que estilizan y controlan la luz a la perfección.",
    description:
      "Las persianas verticales son una opción versátil, funcional y estética para dar privacidad y permitir un direccionamiento variable y graduable de la luz. Ideales para ventanales amplios y puertas corredizas: sus lamas giran para regular la luz y la privacidad, aportando un aire profesional a oficinas y hogares. Disponibles en poliéster y en tela screen.",
    tela: "Lamas en poliéster o screen (89 mm y 127 mm)",
    material: "Sistema de riel con lamas graduables",
    diseno: "Lamas verticales — control de luz y privacidad",
    colors: [
      { name: "Blanco", hex: "#f4f4f2" },
      { name: "Beige", hex: "#d8cbb3" },
      { name: "Trigo", hex: "#cbb994" },
      { name: "Gris", hex: "#9aa0a6" },
      { name: "Rosado", hex: "#e9cdd8" },
      { name: "Cielo", hex: "#bcd7e8" },
      { name: "Azul", hex: "#3d7fb5" },
    ],
    pricePerMeter: 48000,
    productionTime: "3 a 5 días hábiles",
    features: ["Ideal para ventanales", "Luz graduable", "Siete colores", "Look profesional"],
    images: [...fotos("persianas-verticales", 23), "/catalog/persianas-verticales.jpg"],
    videos: [],
    gradient: "from-neutral-600 via-neutral-500 to-neutral-700",
  },
  {
    slug: "persianas-screen",
    name: "Persianas Screen",
    short: "Tejido técnico que protege del sol sin perder la vista exterior.",
    description:
      "Las persianas Screen usan un tejido técnico micro-perforado (PVC y poliéster) que filtra los rayos UV y reduce el calor manteniendo la visibilidad hacia el exterior. Con protección UV del 100%, acabado termofijado de alta temperatura y distintos porcentajes de apertura (3%, 5%, 8%…), son perfectas para oficinas, estudios y espacios con mucha luz.",
    tela: "Screen técnico (70% PVC · 30% Poliéster)",
    material: "Tejido micro-perforado · Termofijado · Protección UV 100%",
    diseno: "Enrollable — Asiático, Clásico, Kubic, Escandinavo y más",
    colors: [
      { name: "Blanco", hex: "#f2f2f0" },
      { name: "Beige", hex: "#ddd8ce" },
      { name: "Linen", hex: "#d6cdbb" },
      { name: "Humo", hex: "#a7adb3" },
      { name: "Gris", hex: "#8f9499" },
      { name: "Carbón", hex: "#4a4d52" },
      { name: "Grafito", hex: "#3f4348" },
    ],
    pricePerMeter: 72000,
    productionTime: "4 a 6 días hábiles",
    features: ["Protección UV", "Reduce el calor", "Conserva la vista", "Uso comercial"],
    images: [...fotos("persianas-screen", 5), "/catalog/persianas-screen.jpg"],
    videos: [],
    gradient: "from-gray-600 via-gray-500 to-gray-700",
  },
  {
    slug: "panel-japones",
    name: "Panel Japonés",
    short: "Grandes paneles deslizantes con estética minimalista y limpia.",
    description:
      "El Panel Japonés está compuesto por amplios paños de tela que se deslizan lateralmente, ideal para grandes ventanales y como divisor de ambientes. Se confecciona en screen, blackout o voile, y su estilo minimalista aporta amplitud y sofisticación a cualquier espacio.",
    tela: "Screen, Blackout o voile en paneles",
    material: "Paneles rígidos deslizantes sobre riel",
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
    images: [...fotos("panel-japones", 7), "/catalog/panel-japones.jpg"],
    videos: [],
    gradient: "from-zinc-500 via-zinc-400 to-zinc-600",
  },
  {
    slug: "persianas-motorizadas",
    name: "Persianas Motorizadas",
    short: "Domótica y confort: controla tus cortinas con un botón o tu voz.",
    description:
      "Automatiza tu hogar u oficina con persianas motorizadas controlables por control remoto, app o asistentes de voz. Compatibles con telas Blackout, Screen y Sheer: programa horarios, integra con domótica y disfruta del máximo confort y sofisticación con un motor tubular silencioso.",
    tela: "Compatible con Blackout, Screen y Sheer",
    material: "Motor tubular + control inalámbrico",
    diseno: "Enrollable / vertical motorizada",
    colors: [
      { name: "Blanco", hex: "#f4f4f2" },
      { name: "Beige", hex: "#d9cdb5" },
      { name: "Gris", hex: "#8b9096" },
      { name: "Titanio", hex: "#6b7581" },
      { name: "Negro", hex: "#26262a" },
    ],
    pricePerMeter: null,
    productionTime: "7 a 10 días hábiles",
    features: ["Control remoto / app", "Compatible domótica", "Programable", "Máximo confort"],
    images: ["/catalog/persianas-motorizadas.jpg"],
    videos: [],
    gradient: "from-violet-900 via-violet-800 to-slate-900",
    featured: true,
  },
  {
    slug: "hanas-vintage",
    name: "Hanas Vintage",
    short: "Textura artesanal y ondas modernas con un encanto atemporal.",
    description:
      "Las cortinas Hanas (Onda Moderna) y su evolución Vintage 2 aportan una caída de ondas suaves y elegantes que llenan de movimiento tus espacios. Confeccionadas en 100% poliéster con acabado termofijado de alta temperatura, se ofrecen en colecciones como Fantasía, Royal, Clasik, Musa 2, Nina 2 e Inspiración 2, para un aire moderno y con carácter.",
    tela: "100% Poliéster texturizado (termofijado)",
    material: "Sistema de onda / riel con carril continuo",
    diseno: "Onda moderna — colecciones Fantasía, Royal, Clasik, Musa 2, Nina 2",
    colors: [
      { name: "Blanco", hex: "#efe9db" },
      { name: "Marfil", hex: "#e7ddc8" },
      { name: "Beige", hex: "#d6c7ab" },
      { name: "Taupe", hex: "#a3937d" },
      { name: "Gris", hex: "#9a9a9a" },
    ],
    pricePerMeter: 84000,
    productionTime: "5 a 8 días hábiles",
    features: ["Ondas modernas", "Textura artesanal", "Caída elegante", "Estilo con carácter"],
    images: [...fotos("hanas-vintage", 49), "/catalog/hanas-vintage.jpg"],
    videos: [],
    gradient: "from-amber-800 via-amber-700 to-stone-800",
  },
  {
    slug: "cortinas-tradicionales",
    name: "Cortinas Tradicionales",
    short: "El clásico atemporal, confeccionado a la medida de tu espacio.",
    description:
      "Nuestras cortinas de Pliegue Francés y Onda Moderna son la evolución de la cortina tradicional: telas nobles con pliegues elegantes y confección a la medida para vestir tus ventanas con distinción. Trabajamos las colecciones Brisa (velos, dimout y blackout) y Luxury, con opciones translúcidas, dimout que bloquea el 60–70% de la luz y blackout con 100% de oscuridad y buen aislamiento térmico y acústico.",
    tela: "Amplia variedad — Velos, Dimout y Blackout (100% Poliéster texturizado)",
    material: "Textil confeccionado a medida",
    diseno: "Pliegue francés, onda moderna — colecciones Brisa y Luxury",
    colors: [
      { name: "Blanco", hex: "#f4f2ec" },
      { name: "Cáscara", hex: "#e6ddca" },
      { name: "Beige", hex: "#d8c8ab" },
      { name: "Perlado", hex: "#cfc7ba" },
      { name: "Gris", hex: "#9a9ea1" },
      { name: "Grafito", hex: "#4b4f53" },
    ],
    pricePerMeter: 65000,
    productionTime: "4 a 7 días hábiles",
    features: ["Confección a medida", "Telas nobles", "Pliegue francés / onda", "Colecciones Brisa y Luxury"],
    images: [...fotos("cortinas-tradicionales", 7), "/catalog/cortinas-tradicionales.jpg"],
    videos: [],
    gradient: "from-rose-950 via-rose-900 to-slate-900",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const productSlugs = products.map((p) => p.slug);
