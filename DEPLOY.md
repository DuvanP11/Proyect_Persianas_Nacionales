# Despliegue en producción — Cortinería Nacional

Esta es una app **full-stack** (Next.js + Prisma + PostgreSQL). Se despliega en
**Vercel** (app) + **Neon** (base de datos). Ambos tienen plan gratis.

> ❌ GitHub Pages NO sirve: solo aloja sitios estáticos y aquí se necesita
> servidor + base de datos (panel admin, portal de clientes, pedidos, etc.).

## 1) Base de datos — Neon

1. Crea una cuenta en https://neon.tech (gratis) y un proyecto (región cercana).
2. Copia la **connection string** (Pooled connection). Se ve así:
   `postgresql://usuario:clave@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
3. Esa cadena será tu `DATABASE_URL` en producción.

## 2) Inicializar el esquema y los datos en Neon

Con la `DATABASE_URL` de Neon (una sola vez, desde tu máquina):

```bash
# En la carpeta del proyecto, apunta temporalmente a Neon:
DATABASE_URL="<cadena_de_neon>" npx prisma db push        # crea las tablas
DATABASE_URL="<cadena_de_neon>" npm run seed:products      # 9 productos + fotos
DATABASE_URL="<cadena_de_neon>" ADMIN_EMAIL="tu@correo.com" ADMIN_PASSWORD="TuClaveSegura" npm run seed:admin
```

## 3) App — Vercel

1. Crea cuenta en https://vercel.com con tu GitHub.
2. **Add New → Project** → importa el repo `DuvanP11/Proyect_Persianas_Nacionales`.
3. Framework: Next.js (se detecta solo). No cambies el build command.
4. En **Environment Variables** agrega:

   | Variable | Valor |
   |----------|-------|
   | `DATABASE_URL` | la connection string de Neon |
   | `AUTH_SECRET` | una cadena aleatoria (32+ bytes en base64) |
   | `EMAIL_FROM` | *(opcional)* `Cortinería Nacional <onboarding@resend.dev>` |
   | `RESEND_API_KEY` | *(opcional)* para enviar correos |

5. **Deploy**. En cada `git push` a `main` se redepliega solo.

## Notas

- **Fotos subidas por el admin:** el almacenamiento local (`/public/uploads`) NO
  persiste en Vercel (disco de solo lectura). Las fotos del catálogo ya vienen
  incluidas (`/public/catalog`). Para que el admin suba fotos nuevas en producción,
  hay que integrar **Cloudinary** (pendiente).
- **Correos:** sin `RESEND_API_KEY` las cotizaciones igual funcionan (abren WhatsApp
  y se guardan en la BD); solo no se envía el correo.
- **Dominio:** Vercel da un dominio `*.vercel.app` gratis. Puedes conectar un dominio
  propio (p. ej. cortinerianacional.com) en Settings → Domains.
