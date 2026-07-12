import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sesión de administrador — token firmado (HMAC-SHA256) guardado en cookie
 * httpOnly. Sin dependencias externas: usa `node:crypto` y corre solo en el
 * servidor (Server Components / Server Actions / Route Handlers).
 */

const COOKIE = "cn_session";
const MAX_AGE = 60 * 60 * 8; // 8 horas

export type Session = {
  uid: string;
  email: string;
  name: string | null;
  role: string;
  exp: number; // epoch en segundos
};

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET no está configurado en el entorno");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createToken(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): Session | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as Session;
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

type SessionUser = { id: string; email: string; name: string | null; role: string };

export async function setSession(user: SessionUser): Promise<void> {
  const session: Session = {
    uid: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
  const store = await cookies();
  store.set(COOKIE, createToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Gate para páginas del panel. Redirige a /admin/login si no hay sesión válida de staff. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    redirect("/admin/login");
  }
  return session;
}

/** Gate para el portal del cliente. Redirige a /cuenta/ingresar si no hay sesión válida. */
export async function requireCustomer(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/cuenta/ingresar");
  }
  return session;
}
