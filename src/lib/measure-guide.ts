/**
 * Guía de medición — fuente única de verdad.
 *
 * La consumen la página `/como-medir` y el botón "¿Cómo tomar medidas?" que el
 * cliente debe abrir antes de agregar un producto al carrito. Al vivir en un
 * solo módulo, ambas superficies muestran exactamente la misma información y no
 * se desincronizan cuando cambien las holguras.
 */

export type MeasureCase = {
  caso: string;
  formula: string;
  nota: string;
};

export type MeasureImage = {
  src: string;
  alt: string;
  caption: string;
  /** Tamaño REAL del archivo. Declararlo mal hace que Next reescale y desenfoque. */
  width: number;
  height: number;
};

/** La regla en una frase. Encabeza el bloque de ancho en la página y en la
 *  ventana flotante; los casos de abajo solo la desglosan. */
export const ANCHO_INTRO =
  "Mide de extremo a extremo de la ventana y agrega 10 cm por cada lado libre. Si un lado está pegado a una pared, no agregues esos 10 cm.";

export const ALTO_INTRO =
  "Mide de arriba hacia abajo y agrega 10 cm en la parte superior y 10 cm en la parte inferior para una mejor cobertura.";

/** El caso que más se equivoca: dentro de un vano NO se suma, se resta. */
export const MEASURE_IMPORTANTE =
  "Si tu ventana está entre dos paredes (dentro de un vano), no agregues centímetros. Solo mide el espacio y resta 0,5 cm al ancho para facilitar la instalación.";

export const ANCHO_CASOS: MeasureCase[] = [
  {
    caso: "Ventana entre paredes",
    formula: "Ancho = X − 0,5 cm",
    nota: "Está dentro de un vano: no sumes nada. Resta medio centímetro para que entre justa entre las dos paredes.",
  },
  {
    caso: "Ventana libre a un lado",
    formula: "Ancho = X + 10 cm",
    nota: "Un lado toca pared y el otro está libre: suma 10 cm solo hacia el lado libre.",
  },
  {
    caso: "Ventana libre a ambos lados",
    formula: "Ancho = X + 20 cm",
    nota: "Los dos lados están libres: suma 10 cm a cada uno, 20 cm en total.",
  },
];

export const ALTO_CASOS: MeasureCase[] = [
  {
    caso: "Caso general",
    formula: "Alto = Y + 20 cm",
    nota: "Suma 10 cm arriba (para el soporte) y 10 cm abajo, para una mejor cobertura.",
  },
  {
    caso: "Ventana que va hasta el piso",
    formula: "Alto = Y − 3 cm",
    nota: "Aquí no sumes los 10 cm de abajo: descuenta 3 cm para que la cortina no arrastre ni roce el piso.",
  },
];

/**
 * Ilustraciones oficiales de medición (`public/medir`).
 *
 * `width`/`height` son las dimensiones reales de cada archivo. Importan: son
 * capturas pequeñas, así que se muestran a tamaño nativo como máximo. Estirarlas
 * para llenar la columna las vuelve borrosas — no hay más detalle que inventar.
 *
 * A las dos ilustraciones de "lado libre" se les recortó el panel de altura que
 * traían debajo: indicaba Y + 15 cm y Y + 10-15 cm, que ya no es la regla
 * (ahora son 10 cm arriba y 10 abajo). Se conserva la mitad del ancho, que sí
 * coincide. Cuando haya ilustraciones nuevas de altura, se agregan aquí.
 */
export const MEASURE_IMAGES: MeasureImage[] = [
  {
    src: "/medir/ancho-entre-paredes.png",
    alt: "Ventana entre paredes: el ancho de la cortina es X menos 0,5 cm",
    caption: "Ventana entre paredes — Ancho = X − 0,5 cm",
    width: 416,
    height: 381,
  },
  {
    src: "/medir/ancho-libre-un-lado.png",
    alt: "Ventana libre a un lado: el ancho es X más 10 cm",
    caption: "Libre a un lado — Ancho = X + 10 cm",
    width: 376,
    height: 248,
  },
  {
    src: "/medir/ancho-libre-ambos-lados.png",
    alt: "Ventana libre a ambos lados: el ancho es X más 20 cm",
    caption: "Libre a ambos lados — Ancho = X + 20 cm",
    width: 391,
    height: 248,
  },
  {
    src: "/medir/sin-metro-usa-tu-cuerpo.png",
    alt: "Referencias del cuerpo para estimar medidas sin metro: dedo 2 cm, palma 10 cm, antebrazo 45 cm, paso 70 a 80 cm",
    caption: "¿No tienes metro? Usa tu cuerpo como referencia aproximada",
    width: 944,
    height: 228,
  },
];

/** Consejo transversal, se repite en la página y en la ventana flotante. */
export const MEASURE_TIP =
  "Mide el ancho en tres puntos (arriba, centro y abajo) y usa la medida menor. Registra ancho × alto de cada ventana en centímetros.";
