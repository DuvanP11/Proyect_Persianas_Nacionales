/**
 * Crea (o actualiza) el usuario administrador del panel.
 *
 * Uso (carga .env con la bandera nativa de Node):
 *   node --env-file=.env scripts/seed-admin.mjs
 *
 * Variables opcionales:
 *   ADMIN_EMAIL     correo del admin (por defecto admin@cortinerianacional.com)
 *   ADMIN_PASSWORD  contraseña; si se omite y el usuario es nuevo, se genera una
 *                   y se guarda en .admin-credentials.txt (ignorado por git).
 *   ADMIN_NAME      nombre a mostrar (por defecto "Administrador")
 */
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

function hashPassword(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

const prisma = new PrismaClient();
const email = (process.env.ADMIN_EMAIL || "admin@cortinerianacional.com")
  .trim()
  .toLowerCase();
const name = process.env.ADMIN_NAME || "Administrador";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } });
  let generated = null;
  let password = process.env.ADMIN_PASSWORD || null;

  if (existing) {
    const data = { role: "ADMIN", isActive: true, name };
    if (password) data.passwordHash = hashPassword(password);
    await prisma.user.update({ where: { email }, data });
    console.log(
      `✔ Usuario admin actualizado: ${email}` +
        (password ? " (contraseña restablecida)" : " (contraseña sin cambios)"),
    );
    return;
  }

  if (!password) {
    generated = randomBytes(12).toString("base64url").slice(0, 14);
    password = generated;
  }

  await prisma.user.create({
    data: { email, name, role: "ADMIN", isActive: true, passwordHash: hashPassword(password) },
  });

  if (generated) {
    const body =
      `Credenciales del panel Cortinería Nacional\n` +
      `URL:      /admin/login\n` +
      `Correo:   ${email}\n` +
      `Password: ${generated}\n\n` +
      `Cámbiala luego desde el panel. Este archivo está ignorado por git.\n`;
    writeFileSync(".admin-credentials.txt", body, "utf8");
    console.log(`✔ Admin creado: ${email}`);
    console.log(`  Contraseña generada y guardada en .admin-credentials.txt`);
  } else {
    console.log(`✔ Admin creado: ${email} (con la contraseña indicada en ADMIN_PASSWORD)`);
  }
}

main()
  .catch((e) => {
    console.error("Error creando el admin:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
