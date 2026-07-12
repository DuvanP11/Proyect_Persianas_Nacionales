import { NextResponse } from "next/server";
import { quoteSchema } from "@/lib/schemas";
import { notifyQuote } from "@/lib/mailer";
import { generateOrderCode } from "@/lib/orders";

/**
 * POST /api/cotizaciones
 * Recibe una cotización, la valida, la persiste (si hay BD), notifica por correo
 * y devuelve un código de pedido. Diseñado para NO fallar la experiencia del
 * usuario: la persistencia y el correo son best-effort.
 */

// Rate limiting simple en memoria (por IP). Para producción multi-instancia,
// migrar a un store compartido (Upstash Redis, etc.).
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const hits = new Map<string, { count: number; ts: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

async function persistQuote(data: unknown, code: string): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const { prisma } = await import("@/lib/prisma");
    const q = data as Record<string, unknown>;
    const email = String(q.correo).toLowerCase();
    // Si ya existe un cliente con ese correo, enlaza la cotización a su cuenta.
    const customer = await prisma.customer.findFirst({ where: { email } });
    await prisma.quote.create({
      data: {
        code,
        firstName: String(q.nombre),
        lastName: String(q.apellidos),
        phone: String(q.telefono),
        email,
        city: String(q.ciudad),
        address: String(q.direccion),
        productName: String(q.producto),
        quantity: Number(q.cantidad),
        meters: q.metros != null ? Number(q.metros) : null,
        comments: q.comentarios ? String(q.comentarios) : null,
        promoCode: q.tieneVolante ? (q.codigoPromo as string) ?? null : null,
        discountPct: q.tieneVolante && q.descuentoPct != null ? Number(q.descuentoPct) : null,
        customerId: customer?.id ?? null,
      },
    });
    return true;
  } catch (e) {
    console.error("[cotizaciones] persist error:", e);
    return false;
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Honeypot anti-spam: si viene lleno, fingimos éxito sin procesar.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, code: generateOrderCode() });
  }

  const code = generateOrderCode();
  const [persisted, mail] = await Promise.all([
    persistQuote(parsed.data, code),
    notifyQuote(parsed.data),
  ]);

  return NextResponse.json({ ok: true, code, persisted, emailed: mail.emailed });
}
