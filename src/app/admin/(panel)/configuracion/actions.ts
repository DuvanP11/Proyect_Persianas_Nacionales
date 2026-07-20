"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { saveFiscalSettings, type FiscalSettings } from "@/lib/settings";

export type FiscalFormState = { ok?: boolean; error?: string };

/** Texto recortado; cadena vacía si no vino nada. */
function text(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

/**
 * Guarda los datos fiscales del emisor.
 *
 * Solo el ADMINISTRADOR puede tocarlos (`requireOwner`): de estos campos
 * dependen las facturas y los documentos legales, así que no es algo que deba
 * poder cambiar un asesor.
 *
 * Se guardan en la tabla `SiteSetting`, de modo que quedan disponibles para
 * todas las facturas siguientes sin volver a escribirlos.
 */
export async function saveFiscal(
  _prev: FiscalFormState,
  formData: FormData,
): Promise<FiscalFormState> {
  await requireOwner();

  // El NIT se normaliza: la gente lo escribe con puntos, guiones o espacios.
  const nitCrudo = text(formData.get("nit"));
  const nit = nitCrudo.replace(/[^\d]/g, "");
  const dv = text(formData.get("dv")).replace(/[^\d]/g, "");

  if (nitCrudo && !nit) {
    return { error: "El NIT debe contener números. Escríbelo sin puntos ni guiones." };
  }
  if (nit && (nit.length < 6 || nit.length > 15)) {
    return { error: "El NIT debe tener entre 6 y 15 dígitos." };
  }
  if (dv.length > 1) {
    return { error: "El dígito de verificación es un solo número (0 a 9)." };
  }

  const personType = text(formData.get("personType"));
  const environment = text(formData.get("environment"));

  const patch: Partial<FiscalSettings> = {
    legalName: text(formData.get("legalName")),
    nit,
    dv,
    personType: personType === "1" ? "1" : "2",
    taxLevelCode: text(formData.get("taxLevelCode")) || "R-99-PN",
    cityName: text(formData.get("cityName")) || "Bogotá, D.C.",
    environment: environment === "1" ? "1" : "2",
  };

  try {
    await saveFiscalSettings(patch);
  } catch (e) {
    console.error("[configuracion] error guardando los datos fiscales:", e);
    return { error: "No se pudieron guardar los datos. Revisa la conexión e intenta de nuevo." };
  }

  // Las políticas legales y el XML muestran el NIT: hay que refrescarlas.
  revalidatePath("/admin/configuracion");
  revalidatePath("/politicas/privacidad");
  revalidatePath("/politicas/tratamiento-datos");
  revalidatePath("/politicas/terminos");

  return { ok: true };
}
