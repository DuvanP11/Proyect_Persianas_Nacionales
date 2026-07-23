# Acta de Entrega — Cortinería Nacional

**Proyecto:** Plataforma web para Cortinería Nacional
**Slogan:** _"De la máquina a tu puerta."_
**Fecha de entrega:** 20 de julio de 2026
**Modalidad:** Desarrollo + servicio gestionado (hosting, base de datos y mantenimiento a cargo del proveedor)

---

## 1. Sitio en vivo

La plataforma está **publicada y operativa** en:

🔗 **https://proyect-persianas-nacionales.vercel.app**

> Está lista para conectarse a un dominio propio (p. ej. `www.cortinerianacional.com`)
> cuando el cliente lo adquiera. Ese paso es opcional y se coordina aparte.

---

## 2. Qué se construyó

Se entregó una **plataforma full-stack completa**, no solo una página informativa. Incluye la web pública y un panel de administración privado.

### 2.1 Sitio público (para los clientes finales)

| Módulo | Descripción |
| --- | --- |
| **Página principal** | Portada premium con hero, beneficios, proceso, "nosotros", referencias y llamados a la acción, con animaciones. |
| **Catálogo** | 9 líneas de producto con buscador inteligente, filtros (color, material, orden) y ficha de producto con galería. |
| **Cotización** | Formulario que guarda la solicitud, envía correo y **abre WhatsApp** con los datos listos para atender. |
| **Descuento por volante** | Módulo de promoción para campañas con volantes físicos. |
| **Guía "¿Cómo medir tus ventanas?"** | Instructivo paso a paso para el cliente. |
| **Portal de cliente** | Registro e ingreso de clientes para seguimiento. |
| **Facturas y políticas** | Consulta de factura pública y páginas legales. |
| **SEO** | Metadata, sitemap, robots y Open Graph para posicionamiento en buscadores. |

### 2.2 Panel de administración (privado, solo para el negocio)

| Módulo | Función |
| --- | --- |
| **Productos e inventario** | Alta, edición y control de existencias. |
| **Categorías** | Organización del catálogo. |
| **Pedidos** | Seguimiento del estado de cada pedido. |
| **Cotizaciones** | Bandeja de solicitudes recibidas. |
| **Facturación** | Constructor de facturas con vista previa en vivo, firma del cliente y **XML UBL 2.1** (factura electrónica), con datos fiscales editables. |
| **Promociones** | Gestión de campañas y descuentos. |
| **Reseñas** | Moderación de calificaciones. |
| **Empleados** | Gestión de usuarios del panel. |
| **Estadísticas** | Dashboard con gráficas del negocio. |
| **Configuración** | Datos de contacto, fiscales y del sitio, editables sin tocar código. |

---

## 3. Tecnología

Construida con tecnología moderna y estándar de la industria, pensada para crecer:

- **Next.js 16** (framework web full-stack) + **TypeScript**
- **Tailwind CSS v4** + animaciones (diseño premium negro / morado / naranja)
- **Prisma** + **PostgreSQL** (base de datos)
- **Vercel** (hosting de la aplicación) + **Neon** (base de datos)

### Seguridad incluida
- Validación de formularios en cliente y servidor.
- Rate limiting y honeypot anti-spam en cotizaciones.
- Cabeceras de seguridad HTTP.
- Credenciales protegidas por variables de entorno (nunca expuestas en el código).

---

## 4. Modelo de servicio (importante)

Esta entrega corresponde a un esquema de **servicio gestionado**. Esto significa:

**El proveedor mantiene y opera por ti:**
- ✅ Hosting de la aplicación (Vercel).
- ✅ Base de datos (Neon).
- ✅ Código fuente y su mantenimiento.
- ✅ Despliegue de nuevas versiones y corrección de errores.
- ✅ Copias de seguridad y monitoreo.

**El cliente recibe:**
- ✅ La plataforma publicada y funcionando 24/7.
- ✅ Acceso al **panel de administración** con su usuario y contraseña para gestionar el negocio (productos, pedidos, facturas, etc.).
- ✅ Este documento y el soporte acordado.

> El código fuente, las credenciales de infraestructura y la base de datos forman parte
> del servicio y permanecen administrados por el proveedor. Si en el futuro se acuerda una
> **transferencia total de propiedad**, se realiza como un traspaso formal aparte.

---

## 5. Acceso al panel de administración

- **URL del panel:** `https://proyect-persianas-nacionales.vercel.app/admin/login`
- **Usuario y contraseña:** se entregan de forma segura y directa al responsable del negocio
  (no se incluyen en este documento por seguridad).

---

## 6. Pendientes y próximos pasos (opcional / fases siguientes)

Estos puntos **no** son fallos: son mejoras planificadas que se activan cuando el negocio lo decida.

| Mejora | Detalle |
| --- | --- |
| **Dominio propio** | Conectar `cortinerianacional.com` (requiere comprar el dominio). |
| **Fotos desde el panel** | Hoy las fotos del catálogo vienen incluidas. Para que el admin **suba fotos nuevas** en producción se integra almacenamiento en la nube (Cloudinary). |
| **Correos automáticos** | Activar envío de correos con un proveedor (Resend) — actualmente la cotización abre WhatsApp y guarda en BD. |
| **Notificaciones WhatsApp** | Avisos automáticos de estado del pedido vía WhatsApp Cloud API. |
| **Analítica** | Google Analytics / Meta Pixel para medir visitas y campañas. |

---

## 7. Soporte

Cualquier ajuste, error o consulta se atiende bajo el acuerdo de servicio.

**Contacto del proveedor:** _[completar]_

---

_Documento de entrega generado el 20 de julio de 2026._
