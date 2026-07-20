/**
 * Cambia el correo de un usuario del panel CONSERVANDO su contraseña.
 *
 * A diferencia de `seed-admin.mjs`, este script nunca toca `passwordHash`:
 * solo reescribe la columna `email`. Sirve para migrar la cuenta del
 * administrador cuando la empresa cambia de correo.
 *
 * Uso:
 *   node --env-file=.env scripts/rename-admin-email.mjs <correo-viejo> <correo-nuevo>
 *
 * Contra producción (Neon), sin escribir la cadena en el .env local:
 *   DATABASE_URL="postgresql://…" node scripts/rename-admin-email.mjs viejo@x.com nuevo@x.com
 *
 * Es idempotente: si el correo nuevo ya es el que está en uso, no hace nada.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const [rawFrom, rawTo] = process.argv.slice(2);
if (!rawFrom || !rawTo) {
  console.error(
    "Uso: node --env-file=.env scripts/rename-admin-email.mjs <correo-viejo> <correo-nuevo>",
  );
  process.exit(1);
}

// Los correos se guardan en minúsculas en toda la app (ver /api/cotizaciones).
const from = rawFrom.trim().toLowerCase();
const to = rawTo.trim().toLowerCase();

async function main() {
  if (from === to) {
    console.log("Los dos correos son iguales: no hay nada que cambiar.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: from } });

  if (!user) {
    // Puede que la migración ya se haya corrido antes. Se distingue ese caso
    // de un error real para no asustar a quien ejecute el script dos veces.
    const already = await prisma.user.findUnique({ where: { email: to } });
    if (already) {
      console.log(`✔ Nada que hacer: el usuario ya usa ${to}.`);
      return;
    }
    console.error(`✘ No existe ningún usuario con el correo ${from}.`);
    process.exit(1);
  }

  const clash = await prisma.user.findUnique({ where: { email: to } });
  if (clash) {
    console.error(
      `✘ Ya existe otro usuario con el correo ${to}. Resuélvelo a mano antes de continuar.`,
    );
    process.exit(1);
  }

  // Solo `email`: la contraseña, el rol y el resto del perfil quedan intactos.
  await prisma.user.update({ where: { id: user.id }, data: { email: to } });

  // El perfil de cliente (si lo tuviera) guarda su propia copia del correo.
  const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
  if (customer) {
    await prisma.customer.update({ where: { id: customer.id }, data: { email: to } });
  }

  console.log(`✔ Correo actualizado: ${from} → ${to}`);
  console.log("  La contraseña NO se modificó: entra con la misma de siempre.");
}

main()
  .catch((e) => {
    console.error("Error cambiando el correo:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
