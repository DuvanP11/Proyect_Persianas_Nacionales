import { formatNit, isFiscalReady, type FiscalSettings } from "@/lib/settings";
import { addressLine, siteConfig } from "@/lib/site-config";

/**
 * Textos legales del sitio — Cortinería Nacional.
 *
 * Redactados conforme al marco colombiano aplicable a una tienda que vende
 * productos confeccionados a la medida y capta datos por formulario web:
 *
 *  · Ley 1581 de 2012 y Decreto 1074 de 2015 — protección de datos personales
 *  · Ley 1480 de 2011 — Estatuto del Consumidor
 *  · Ley 527 de 1999 — comercio electrónico
 *
 * ⚠️ IMPORTANTE — ESTOS TEXTOS NO SON ASESORÍA JURÍDICA.
 * Son una base sólida y específica para este negocio, pero deben ser revisados
 * y aprobados por un abogado antes de considerarse definitivos. Hay datos que
 * dependen de la operación real de la empresa y están marcados como PENDIENTE
 * (NIT, plazos de garantía propios, política de devoluciones).
 *
 * Los datos de contacto y de identificación salen de `site-config` para no
 * repetirlos: cambiar la dirección o el correo actualiza los tres documentos.
 */

/** Fecha de la última revisión de estos textos. Actualízala al modificarlos. */
export const LEGAL_UPDATED = "19 de julio de 2026";

export type LegalBlock =
  | { tipo: "parrafo"; texto: string }
  | { tipo: "lista"; items: string[] }
  | { tipo: "aviso"; texto: string };

export interface LegalSection {
  titulo: string;
  bloques: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  /** Frase corta bajo el título. */
  intro: string;
  /**
   * Explicación del tema y de la norma colombiana que lo regula, para que
   * quien llegue a la página entienda de qué trata el documento antes de
   * leerlo completo.
   */
  descripcion: string[];
  secciones: LegalSection[];
}

/**
 * Identificación del responsable, común a los tres documentos.
 *
 * Recibe los datos fiscales vigentes (los que el administrador guardó desde el
 * panel) en vez de leerlos del código: así, en cuanto se carga el NIT, aparece
 * en las tres políticas sin tocar nada más.
 */
function identificacion(fiscal: FiscalSettings): LegalSection {
  const nit = formatNit(fiscal);
  // En un documento legal debe constar la RAZÓN SOCIAL, no solo el nombre
  // comercial. Si todavía no se ha cargado, se usa el nombre comercial para
  // que el texto siga leyéndose bien.
  const razonSocial = isFiscalReady(fiscal) ? fiscal.legalName : null;
  const denominacion = razonSocial
    ? `${siteConfig.name}, nombre comercial de ${razonSocial}`
    : siteConfig.name;

  return {
    titulo: "Identificación del responsable",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          `${denominacion}${nit ? `, identificada con NIT ${nit}` : ""} (en adelante, “la Empresa”), ` +
          `con domicilio en ${addressLine(", ")}, Colombia, es responsable del tratamiento de los datos ` +
          `personales recolectados a través de este sitio web y de los canales de atención asociados.`,
      },
      {
        tipo: "lista",
        items: [
          ...(razonSocial ? [`Razón social: ${razonSocial}`] : []),
          ...(nit ? [`NIT: ${nit}`] : []),
          `Correo electrónico: ${siteConfig.email}`,
          `Teléfono y WhatsApp: ${siteConfig.whatsapp.display}`,
          `Dirección: ${addressLine(", ")}`,
          `Horario de atención: ${siteConfig.schedule}`,
        ],
      },
    ],
  };
}

/** Aviso de revisión jurídica, visible al final de cada documento. */
const revision: LegalSection = {
  titulo: "Vigencia y modificaciones",
  bloques: [
    {
      tipo: "parrafo",
      texto:
        `Este documento rige desde su publicación y permanece vigente mientras la Empresa ` +
        `desarrolle su objeto social. La Empresa puede modificarlo en cualquier momento; los ` +
        `cambios sustanciales se comunicarán a través de este sitio web y, cuando corresponda, ` +
        `por los canales de contacto registrados. Última actualización: ${LEGAL_UPDATED}.`,
    },
  ],
};

// ---------------------------------------------------------------------------
//  Documentos
// ---------------------------------------------------------------------------

/** Construye los tres documentos con los datos fiscales vigentes. */
export function buildLegalDocs(fiscal: FiscalSettings): Record<string, LegalDoc> {
  const responsable = identificacion(fiscal);

  return {
  privacidad: {
    title: "Política de Privacidad",
    intro:
      "Explica qué información recogemos cuando usas este sitio, para qué la usamos y cómo la protegemos.",
    descripcion: [
      "La privacidad es el derecho que tienes a decidir qué información tuya compartes y qué se hace con ella. En Colombia este derecho tiene rango constitucional: el artículo 15 de la Constitución Política reconoce a toda persona el derecho a su intimidad y a conocer, actualizar y rectificar la información que se haya recogido sobre ella en bancos de datos.",
      "Este documento traduce ese derecho a la práctica concreta de nuestro sitio web. Aquí encontrarás, en lenguaje claro, qué datos te pedimos cuando solicitas una cotización o creas una cuenta, con qué finalidad los usamos, con quién los compartimos, cuánto tiempo los guardamos y qué medidas de seguridad aplicamos para protegerlos.",
      "Se complementa con nuestra Política de Tratamiento de Datos Personales, que desarrolla en detalle el procedimiento formal para ejercer tus derechos conforme a la Ley 1581 de 2012.",
    ],
    secciones: [
      responsable,
      {
        titulo: "Qué información recogemos",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Solo pedimos los datos necesarios para atender tu solicitud. Según cómo uses el sitio, podemos recoger:",
          },
          {
            tipo: "lista",
            items: [
              "Datos de contacto que tú nos entregas en el formulario de cotización: nombre, apellidos, teléfono, correo electrónico, ciudad y dirección de instalación.",
              "Detalles de tu solicitud: producto de interés, cantidad, medidas de la ventana, color, tela, posición del mando y comentarios adicionales.",
              "Datos de tu cuenta, si te registras en el portal de clientes: correo electrónico y una contraseña, que se almacena cifrada y que nadie de la Empresa puede leer.",
              "Información de facturación cuando se concreta una compra, incluida la firma de recibido si la autorizas.",
            ],
          },
          {
            tipo: "parrafo",
            texto:
              "Este sitio no utiliza cookies de publicidad ni de seguimiento de terceros. Las cookies que empleamos son estrictamente necesarias para mantener tu sesión iniciada en el portal de clientes.",
          },
        ],
      },
      {
        titulo: "Para qué usamos tu información",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Elaborar y enviarte la cotización que solicitaste.",
              "Contactarte por WhatsApp, teléfono o correo para resolver dudas y coordinar medidas, fabricación e instalación.",
              "Gestionar tu pedido y mantenerte informado de su estado.",
              "Emitir las facturas y los documentos de entrega correspondientes.",
              "Atender garantías, reclamos y solicitudes de servicio posventa.",
              "Cumplir obligaciones legales, contables y tributarias.",
            ],
          },
          {
            tipo: "parrafo",
            texto:
              "No vendemos, arrendamos ni cedemos tus datos personales a terceros con fines comerciales. Solo los compartimos con proveedores que nos prestan servicios necesarios para operar (por ejemplo, alojamiento del sitio y envío de correos), quienes actúan como encargados del tratamiento y están obligados a proteger la información.",
          },
        ],
      },
      {
        titulo: "Por cuánto tiempo conservamos tus datos",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Conservamos tus datos mientras exista una relación comercial contigo y, después, durante los plazos que exija la ley para efectos contables, tributarios y de garantía. Cumplidos esos plazos, la información se elimina o se anonimiza. Si solicitas la supresión de tus datos y no existe un deber legal de conservarlos, procedemos a eliminarlos.",
          },
        ],
      },
      {
        titulo: "Seguridad de la información",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Aplicamos medidas técnicas y administrativas razonables para proteger tu información: conexión cifrada (HTTPS), contraseñas almacenadas mediante funciones de derivación criptográfica, control de acceso por roles para el personal y acceso restringido a la base de datos. Ningún sistema es infalible, pero nos comprometemos a informarte oportunamente si detectamos un incidente que afecte tus datos.",
          },
        ],
      },
      {
        titulo: "Tus derechos",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              `Puedes ejercer en cualquier momento tus derechos como titular de datos personales escribiendo a ${siteConfig.email}. El detalle de esos derechos y del procedimiento está en nuestra política de Tratamiento de Datos Personales.`,
          },
        ],
      },
      revision,
    ],
  },

  "tratamiento-datos": {
    title: "Política de Tratamiento de Datos Personales",
    intro:
      "Documento adoptado conforme a la Ley 1581 de 2012 y al Decreto 1074 de 2015, que regulan la protección de datos personales en Colombia.",
    descripcion: [
      "En Colombia, el «tratamiento» de datos personales es toda operación que se realice sobre ellos: recolectarlos, guardarlos, usarlos, circularlos o suprimirlos. La norma que lo regula es la Ley Estatutaria 1581 de 2012, que desarrolla el derecho fundamental de habeas data —el derecho de toda persona a conocer, actualizar y rectificar la información que otros tienen sobre ella—.",
      "Esa ley fue reglamentada por el Decreto 1377 de 2013, hoy compilado en el Decreto Único Reglamentario 1074 de 2015 del sector Comercio, Industria y Turismo. El artículo 2.2.2.25.3.1 de ese decreto exige que todo responsable del tratamiento adopte una política escrita como esta, en la que conste quién trata los datos, con qué finalidad, cuáles son los derechos del titular y qué procedimiento debe seguirse para ejercerlos.",
      "La ley distingue dos figuras: el «responsable», que decide sobre la base de datos —en este caso, nosotros—, y el «encargado», que trata los datos por cuenta del responsable, como nuestros proveedores de alojamiento web y de correo. La vigilancia del cumplimiento corresponde a la Delegatura para la Protección de Datos Personales de la Superintendencia de Industria y Comercio.",
      "Este documento es, entonces, la política formal que la ley nos obliga a tener y a poner a tu disposición. Léelo si quieres saber exactamente qué podemos y qué no podemos hacer con tu información, y cómo pedirnos que la corrijamos o la eliminemos.",
    ],
    secciones: [
      responsable,
      {
        titulo: "Marco legal y ámbito de aplicación",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Esta política se adopta en cumplimiento de la Ley 1581 de 2012, del Decreto 1074 de 2015 y de las demás normas que los modifiquen o reglamenten. Aplica a todos los datos personales registrados en las bases de datos de la Empresa, cuyo tratamiento realiza en calidad de responsable.",
          },
        ],
      },
      {
        titulo: "Autorización del titular",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Al enviar el formulario de cotización, registrarte en el portal de clientes o contactarnos por nuestros canales, autorizas de manera previa, expresa e informada a la Empresa para recolectar y tratar tus datos personales con las finalidades descritas en esta política. La autorización se conserva como prueba en nuestros registros.",
          },
          {
            tipo: "parrafo",
            texto:
              "No recolectamos datos sensibles (aquellos que afectan la intimidad o cuyo uso indebido puede generar discriminación) ni datos de menores de edad. Si detectamos que se ha registrado información de este tipo por error, procedemos a eliminarla.",
          },
        ],
      },
      {
        titulo: "Finalidades del tratamiento",
        bloques: [
          {
            tipo: "lista",
            items: [
              "Atender solicitudes de cotización y elaborar propuestas comerciales.",
              "Formalizar, ejecutar y hacer seguimiento a los pedidos, incluidas las etapas de fabricación, despacho e instalación.",
              "Facturar y llevar el registro contable de las operaciones.",
              "Prestar servicio posventa y atender garantías y reclamos.",
              "Enviar información sobre el estado de tu pedido por correo electrónico y WhatsApp.",
              "Cumplir obligaciones legales, contables, tributarias y de conservación de información.",
            ],
          },
        ],
      },
      {
        titulo: "Derechos del titular",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "De acuerdo con el artículo 8 de la Ley 1581 de 2012, como titular de tus datos personales tienes derecho a:",
          },
          {
            tipo: "lista",
            items: [
              "Conocer, actualizar y rectificar tus datos personales frente a la Empresa.",
              "Solicitar prueba de la autorización que otorgaste, salvo en los casos en que la ley no la exige.",
              "Ser informado, previa solicitud, sobre el uso que se ha dado a tus datos.",
              "Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley, una vez agotado el trámite de consulta o reclamo ante la Empresa.",
              "Revocar la autorización y solicitar la supresión de tus datos, cuando no exista un deber legal o contractual que obligue a conservarlos.",
              "Acceder de forma gratuita a tus datos personales que hayan sido objeto de tratamiento.",
            ],
          },
        ],
      },
      {
        titulo: "Cómo ejercer tus derechos",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              `El área encargada de atender estas solicitudes es la administración de ${siteConfig.name}. Puedes escribir a ${siteConfig.email} o comunicarte al ${siteConfig.whatsapp.display}, indicando tu nombre completo, los datos de contacto, la descripción de los hechos y los documentos que quieras aportar.`,
          },
          {
            tipo: "parrafo",
            texto:
              "Las consultas se atienden en un término máximo de diez (10) días hábiles contados desde su recibo. Cuando no sea posible atenderlas en ese plazo, te informaremos los motivos y la fecha en que se atenderá, que no superará los cinco (5) días hábiles siguientes al vencimiento del primer término.",
          },
          {
            tipo: "parrafo",
            texto:
              "Los reclamos se atienden en un término máximo de quince (15) días hábiles contados desde el día siguiente a su recibo. Cuando no sea posible atenderlos en ese plazo, te informaremos los motivos y la fecha en que se atenderá, que no superará los ocho (8) días hábiles siguientes al vencimiento del primer término.",
          },
        ],
      },
      {
        titulo: "Transferencia y transmisión de datos",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Para operar el sitio web y enviar notificaciones utilizamos proveedores de alojamiento y de correo electrónico que pueden almacenar información en servidores ubicados fuera de Colombia. Estos proveedores actúan como encargados del tratamiento, cuentan con estándares de seguridad adecuados y no están autorizados para usar tus datos con fines distintos a la prestación del servicio contratado.",
          },
        ],
      },
      revision,
    ],
  },

  terminos: {
    title: "Términos y Condiciones",
    intro:
      "Regulan el uso de este sitio web y la relación comercial derivada de la compra de nuestros productos y servicios.",
    descripcion: [
      "Los términos y condiciones son el contrato que rige la relación entre la empresa y el cliente: fijan qué ofrecemos, bajo qué reglas, y cuáles son los derechos y obligaciones de cada parte. No los redactamos con entera libertad, porque en Colombia esa relación está protegida por normas de orden público que ninguna cláusula puede desconocer.",
      "La principal es la Ley 1480 de 2011, el Estatuto del Consumidor, que consagra el derecho a recibir información veraz y suficiente, la garantía legal sobre la calidad e idoneidad de los productos, el derecho de retracto en las ventas a distancia y la protección frente a cláusulas abusivas. A ella se suma la Ley 527 de 1999, que le da validez jurídica a los mensajes de datos y al comercio electrónico.",
      "Hay dos puntos donde la ley se aplica de forma particular a nuestro caso, y por eso los verás explicados con detalle más abajo. El primero: fabricamos a la medida, y el artículo 47 de la Ley 1480 exceptúa del derecho de retracto los bienes confeccionados según las especificaciones del consumidor. El segundo: este sitio no procesa pagos en línea, de modo que las solicitudes que envías son cotizaciones y no compras cerradas.",
      "La autoridad competente para vigilar el cumplimiento de estas normas y atender las quejas de los consumidores es la Superintendencia de Industria y Comercio.",
    ],
    secciones: [
      responsable,
      {
        titulo: "Objeto y aceptación",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Estos términos regulan el acceso y uso del sitio web de la Empresa, así como la contratación de productos de cortinería y persianería fabricados a la medida y de los servicios asociados de asesoría, confección e instalación. Al usar el sitio o solicitar una cotización, aceptas estos términos.",
          },
          {
            tipo: "parrafo",
            texto:
              "La relación comercial se rige por la Ley 1480 de 2011 (Estatuto del Consumidor), la Ley 527 de 1999 sobre comercio electrónico y las demás normas colombianas aplicables.",
          },
        ],
      },
      {
        titulo: "Naturaleza del sitio y de las cotizaciones",
        bloques: [
          {
            tipo: "aviso",
            texto:
              "Este sitio no procesa pagos en línea. Las solicitudes que envías son cotizaciones, no compras confirmadas.",
          },
          {
            tipo: "parrafo",
            texto:
              "La información publicada sobre productos, materiales y colores es orientativa. Las cotizaciones se elaboran a partir de las medidas y especificaciones que suministras, tienen carácter de propuesta comercial y no constituyen una venta hasta que la Empresa las confirme y tú las aceptes de forma expresa.",
          },
          {
            tipo: "parrafo",
            texto:
              "Los precios se expresan en pesos colombianos (COP). Las cotizaciones tienen la vigencia que se indique en cada caso; vencido ese plazo, los valores pueden variar por cambios en los costos de los materiales.",
          },
        ],
      },
      {
        titulo: "Medidas y responsabilidad del cliente",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Nuestros productos se fabrican a la medida. Cuando las medidas son suministradas por el cliente, este es responsable de su exactitud. La Empresa pone a disposición una guía de medición y recomienda solicitar la visita técnica gratuita antes de confirmar el pedido.",
          },
          {
            tipo: "parrafo",
            texto:
              "Los productos fabricados con medidas erróneas suministradas por el cliente no dan lugar a cambio ni a devolución del dinero, salvo que el error sea atribuible a la Empresa. En estos casos se podrá cotizar una corrección o una nueva fabricación.",
          },
        ],
      },
      {
        titulo: "Derecho de retracto",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "El artículo 47 de la Ley 1480 de 2011 concede al consumidor el derecho de retractarse dentro de los cinco (5) días hábiles siguientes a la entrega del bien, en las ventas realizadas por métodos no tradicionales o a distancia.",
          },
          {
            tipo: "aviso",
            texto:
              "Ese mismo artículo exceptúa del derecho de retracto los bienes confeccionados conforme a las especificaciones del consumidor o claramente personalizados. Las cortinas y persianas fabricadas a la medida quedan comprendidas en esta excepción.",
          },
          {
            tipo: "parrafo",
            texto:
              "En consecuencia, los productos fabricados a la medida no admiten retracto. Sí lo admiten, en los términos de ley, los productos de línea que se entreguen sin personalización alguna. Cuando el retracto proceda, la Empresa reintegrará el dinero pagado dentro de los treinta (30) días calendario siguientes, y el consumidor deberá devolver el producto en las mismas condiciones en que lo recibió, asumiendo los costos de transporte.",
          },
        ],
      },
      {
        titulo: "Garantía legal",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Conforme a los artículos 7 y siguientes de la Ley 1480 de 2011, la Empresa responde por la calidad, idoneidad, seguridad y buen funcionamiento de los productos que comercializa, así como por la correcta prestación del servicio de instalación.",
          },
          {
            tipo: "parrafo",
            texto:
              "La garantía cubre defectos de fabricación, de los materiales y de la instalación realizada por nuestro personal. No cubre el desgaste normal por el uso, ni los daños derivados de uso indebido, limpieza con productos inadecuados, manipulación o reparación por terceros, humedad excesiva, fuerza mayor o alteraciones hechas por el cliente.",
          },
          {
            tipo: "parrafo",
            texto:
              "Plazo de garantía: PENDIENTE — indicar el plazo que ofrece la Empresa. A falta de indicación expresa, aplica el término legal supletorio previsto en el artículo 8 de la Ley 1480 de 2011.",
          },
          {
            tipo: "parrafo",
            texto:
              `Para hacer efectiva la garantía, comunícate a ${siteConfig.email} o al ${siteConfig.whatsapp.display} indicando el número de pedido o de factura y una descripción del inconveniente. La Empresa podrá optar por reparar el producto, cambiarlo o devolver el dinero, en los términos que fija la ley.`,
          },
        ],
      },
      {
        titulo: "Instalación y plazos de entrega",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Los tiempos de fabricación e instalación se informan en cada cotización y se cuentan en días hábiles a partir de la confirmación del pedido y, cuando aplique, del pago del anticipo acordado. Estos plazos pueden verse afectados por la disponibilidad de materiales o por causas ajenas a la Empresa, situaciones que se comunicarán oportunamente al cliente.",
          },
          {
            tipo: "parrafo",
            texto:
              "El cliente debe garantizar el acceso al inmueble en la fecha y hora acordadas para la instalación. Si la visita no puede realizarse por causas atribuibles al cliente, podrá cobrarse el desplazamiento de una nueva visita.",
          },
        ],
      },
      {
        titulo: "Propiedad intelectual",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Los contenidos de este sitio —textos, fotografías, diseños, logotipos y demás elementos— son propiedad de la Empresa o se usan con autorización de sus titulares. No está permitida su reproducción, distribución o modificación sin consentimiento previo y escrito.",
          },
        ],
      },
      {
        titulo: "Atención al consumidor",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              `Las peticiones, quejas y reclamos pueden dirigirse a ${siteConfig.email} o al ${siteConfig.whatsapp.display}. La Empresa dará respuesta dentro de los quince (15) días hábiles siguientes a su recibo. Si no obtienes una respuesta satisfactoria, puedes acudir a la Superintendencia de Industria y Comercio, autoridad competente en materia de protección al consumidor en Colombia.`,
          },
        ],
      },
      {
        titulo: "Ley aplicable y jurisdicción",
        bloques: [
          {
            tipo: "parrafo",
            texto:
              "Estos términos se rigen por la ley colombiana. Cualquier controversia que se derive de ellos se someterá a los jueces y tribunales competentes de la República de Colombia.",
          },
        ],
      },
      revision,
    ],
  },
  };
}

/** Claves válidas de documento legal (para rutas y `generateStaticParams`). */
export const LEGAL_DOC_KEYS = ["privacidad", "tratamiento-datos", "terminos"] as const;

export type LegalDocKey = (typeof LEGAL_DOC_KEYS)[number];
