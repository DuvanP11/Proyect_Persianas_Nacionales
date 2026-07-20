import "server-only";

import { hasDatabase, prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

/**
 * Configuración editable desde el panel — Cortinería Nacional.
 *
 * Vive en la tabla `SiteSetting` (clave/valor JSON), que ya existía en el
 * esquema para esto mismo. La idea: el administrador escribe el dato UNA vez
 * y queda guardado para todas las facturas y documentos siguientes, sin tocar
 * código ni la base a mano.
 *
 * Degradación elegante: si no hay base de datos, la consulta falla o la clave
 * todavía no existe, se devuelven los valores de `site-config.ts`. Así el
 * sitio nunca se rompe, ni siquiera durante un build sin base.
 */

/** Clave bajo la que se guardan los datos fiscales en `SiteSetting`. */
const FISCAL_KEY = "fiscal";

/** Datos fiscales del emisor. Coincide con `siteConfig.fiscal`. */
export interface FiscalSettings {
  /** Razón social exacta del RUT. */
  legalName: string;
  /** NIT sin dígito de verificación ni puntos. */
  nit: string;
  /** Dígito de verificación del NIT. */
  dv: string;
  /** 1 = persona jurídica, 2 = persona natural. */
  personType: string;
  /** Código de régimen de la DIAN (p. ej. "R-99-PN"). */
  taxLevelCode: string;
  cityCode: string;
  cityName: string;
  departmentCode: string;
  departmentName: string;
  countryCode: string;
  countryName: string;
  postalZone: string;
  /** 1 = producción, 2 = pruebas (habilitación). */
  environment: string;
}

/** Valores por defecto: los de `site-config.ts`. */
function defaults(): FiscalSettings {
  return { ...siteConfig.fiscal };
}

/** Campos que el administrador puede editar desde el panel. */
export const FISCAL_EDITABLE = [
  "legalName",
  "nit",
  "dv",
  "personType",
  "taxLevelCode",
  "cityName",
  "environment",
] as const;

export type FiscalEditableField = (typeof FISCAL_EDITABLE)[number];

/**
 * Datos fiscales vigentes: lo guardado en la base sobre los valores por
 * defecto del código. Nunca lanza.
 */
export async function getFiscalSettings(): Promise<FiscalSettings> {
  const base = defaults();
  if (!hasDatabase) return base;

  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: FISCAL_KEY } });
    if (!row || typeof row.value !== "object" || row.value === null) return base;
    // Se mezcla sobre los valores por defecto: si mañana se agrega un campo
    // nuevo al código, las filas viejas siguen funcionando sin migración.
    return { ...base, ...(row.value as Partial<FiscalSettings>) };
  } catch {
    return base;
  }
}

/** Guarda (o crea) los datos fiscales. Solo debe llamarse desde el panel. */
export async function saveFiscalSettings(patch: Partial<FiscalSettings>): Promise<void> {
  const actual = await getFiscalSettings();
  const value = { ...actual, ...patch };
  await prisma.siteSetting.upsert({
    where: { key: FISCAL_KEY },
    create: { key: FISCAL_KEY, value },
    update: { value },
  });
}

/**
 * `true` si los datos mínimos del RUT ya están cargados.
 *
 * Se comprueba que el NIT tenga contenido y que la razón social no siga siendo
 * el marcador "PENDIENTE" que trae el código por defecto.
 */
export function isFiscalReady(f: FiscalSettings): boolean {
  return Boolean(f.nit.trim() && f.legalName.trim() && !f.legalName.startsWith("PENDIENTE"));
}

/**
 * NIT con formato legible: "901234567-8".
 * Devuelve `null` si todavía no se ha cargado, para que quien lo muestre
 * decida qué poner en su lugar en vez de imprimir un guion suelto.
 */
export function formatNit(f: FiscalSettings): string | null {
  const nit = f.nit.trim();
  if (!nit) return null;
  const dv = f.dv.trim();
  return dv ? `${nit}-${dv}` : nit;
}
