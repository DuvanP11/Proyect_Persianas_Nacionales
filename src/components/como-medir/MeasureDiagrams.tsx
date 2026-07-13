/**
 * Diagramas de medición vectoriales (SVG) — nítidos y claros.
 * Reemplazan las ilustraciones borrosas del PDF.
 */

const wall = "#1b1b20";
const wallLine = "#2c2c34";
const frame = "#cbd0d6";
const morado = "#8b5cf6";
const moradoLight = "#c4b5fd";
const naranja = "#fb7a1e";
const naranjaLight = "#fdba74";

/** Medir el ANCHO: cota horizontal sobre la ventana + holgura a los lados. */
export function DiagramAncho() {
  return (
    <svg viewBox="0 0 320 240" className="w-full" role="img" aria-label="Cómo medir el ancho de la ventana">
      <rect x="6" y="6" width="308" height="228" rx="10" fill={wall} stroke={wallLine} />
      {/* Ventana */}
      <rect x="86" y="86" width="148" height="120" rx="4" fill="#111318" stroke={frame} strokeWidth="3" />
      <line x1="160" y1="86" x2="160" y2="206" stroke={frame} strokeWidth="2" />
      <line x1="86" y1="146" x2="234" y2="146" stroke={frame} strokeWidth="2" />

      {/* Cota del ancho de la ventana (X) */}
      <g stroke={morado} strokeWidth="2" fill={morado}>
        <line x1="86" y1="62" x2="234" y2="62" />
        <line x1="86" y1="55" x2="86" y2="69" />
        <line x1="234" y1="55" x2="234" y2="69" />
        <polygon points="86,62 96,57 96,67" />
        <polygon points="234,62 224,57 224,67" />
      </g>
      <rect x="140" y="50" width="40" height="18" rx="4" fill={wall} />
      <text x="160" y="63" textAnchor="middle" fill={moradoLight} fontSize="14" fontWeight="700">X</text>

      {/* Holgura a los lados (+ cm) */}
      <g stroke={naranja} strokeWidth="1.6" strokeDasharray="4 3">
        <line x1="86" y1="220" x2="60" y2="220" />
        <line x1="234" y1="220" x2="260" y2="220" />
      </g>
      <text x="52" y="224" textAnchor="end" fill={naranjaLight} fontSize="11">+ cm</text>
      <text x="268" y="224" textAnchor="start" fill={naranjaLight} fontSize="11">+ cm</text>

      <text x="160" y="30" textAnchor="middle" fill={frame} fontSize="13" fontWeight="600">Mide el ANCHO (X)</text>
    </svg>
  );
}

/** Medir el ALTO: cota vertical al lado de la ventana. */
export function DiagramAlto() {
  return (
    <svg viewBox="0 0 320 240" className="w-full" role="img" aria-label="Cómo medir el alto de la ventana">
      <rect x="6" y="6" width="308" height="228" rx="10" fill={wall} stroke={wallLine} />
      {/* Techo insinuado */}
      <line x1="6" y1="34" x2="314" y2="34" stroke={wallLine} strokeWidth="2" />
      {/* Ventana */}
      <rect x="120" y="62" width="140" height="140" rx="4" fill="#111318" stroke={frame} strokeWidth="3" />
      <line x1="190" y1="62" x2="190" y2="202" stroke={frame} strokeWidth="2" />
      <line x1="120" y1="132" x2="260" y2="132" stroke={frame} strokeWidth="2" />

      {/* Cota del alto (Y) */}
      <g stroke={morado} strokeWidth="2" fill={morado}>
        <line x1="92" y1="62" x2="92" y2="202" />
        <line x1="85" y1="62" x2="99" y2="62" />
        <line x1="85" y1="202" x2="99" y2="202" />
        <polygon points="92,62 87,72 97,72" />
        <polygon points="92,202 87,192 97,192" />
      </g>
      <rect x="80" y="123" width="24" height="18" rx="4" fill={wall} />
      <text x="92" y="136" textAnchor="middle" fill={moradoLight} fontSize="14" fontWeight="700">Y</text>

      {/* Holgura arriba (+ cm) / si va al piso (− cm) */}
      <g stroke={naranja} strokeWidth="1.6" strokeDasharray="4 3">
        <line x1="120" y1="48" x2="120" y2="34" />
      </g>
      <text x="128" y="46" textAnchor="start" fill={naranjaLight} fontSize="11">+ cm (soporte)</text>
      <text x="190" y="224" textAnchor="middle" fill={naranjaLight} fontSize="11">− 3 cm si va al piso</text>

      <text x="160" y="26" textAnchor="middle" fill={frame} fontSize="13" fontWeight="600">Mide el ALTO (Y)</text>
    </svg>
  );
}
