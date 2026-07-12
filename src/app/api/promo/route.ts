import { NextResponse } from "next/server";
import { validatePromo } from "@/lib/promo";

/**
 * GET /api/promo?code=XXXX
 * Valida un código promocional (activo, vigente, con usos). Público: solo
 * expone si es válido y el porcentaje de descuento.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const result = await validatePromo(code);
  return NextResponse.json(result);
}
