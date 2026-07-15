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
};

export const ANCHO_CASOS: MeasureCase[] = [
  {
    caso: "Ventana entre paredes",
    formula: "Ancho = X − 0.5 cm",
    nota: "Descuenta medio centímetro para que la cortina entre justa entre las dos paredes.",
  },
  {
    caso: "Ventana libre a un lado",
    formula: "Ancho = X + 10 cm",
    nota: "Suma 10 cm hacia el lado libre para cubrir bien la ventana.",
  },
  {
    caso: "Ventana libre a ambos lados",
    formula: "Ancho = X + 20 cm",
    nota: "Suma 10 cm a cada lado (20 cm en total) para una mejor cobertura.",
  },
];

export const ALTO_CASOS: MeasureCase[] = [
  {
    caso: "Ventana desde el techo",
    formula: "Alto = Y + 15 cm",
    nota: "Suma 15 cm para el soporte arriba y una caída elegante debajo del marco.",
  },
  {
    caso: "Ventana separada del techo",
    formula: "Alto = Y + 10 a 15 cm",
    nota: "Suma entre 10 y 15 cm cuando hay espacio entre el techo y la ventana.",
  },
  {
    caso: "Ventana que va hasta el piso",
    formula: "Alto = Y − 3 cm",
    nota: "Descuenta 3 cm para que la cortina no arrastre ni roce el piso.",
  },
];

/** Ilustraciones oficiales de medición (`public/medir`). */
export const MEASURE_IMAGES: MeasureImage[] = [
  {
    src: "/medir/ancho-entre-paredes.png",
    alt: "Ventana entre paredes: el ancho de la cortina es X menos 0,5 cm",
    caption: "Ventana entre paredes — Ancho = X − 0,5 cm",
  },
  {
    src: "/medir/ancho-libre-un-lado.png",
    alt: "Ventana libre a un lado: el ancho es X más 10 cm, con las dos formas de medir la altura",
    caption: "Libre a un lado — Ancho = X + 10 cm · Altura según el techo",
  },
  {
    src: "/medir/ancho-libre-ambos-lados.png",
    alt: "Ventana libre a ambos lados: el ancho es X más 20 cm, con las dos formas de medir la altura",
    caption: "Libre a ambos lados — Ancho = X + 20 cm · Altura según el techo",
  },
  {
    src: "/medir/sin-metro-usa-tu-cuerpo.png",
    alt: "Referencias del cuerpo para estimar medidas sin metro: dedo 2 cm, palma 10 cm, antebrazo 45 cm, paso 70 a 80 cm",
    caption: "¿No tienes metro? Usa tu cuerpo como referencia aproximada",
  },
];

/** Consejo transversal, se repite en la página y en la ventana flotante. */
export const MEASURE_TIP =
  "Mide el ancho en tres puntos (arriba, centro y abajo) y usa la medida menor. Registra ancho × alto de cada ventana en centímetros.";
