-- ============================================================================
--  Migración: firma del cliente en la factura
--  Fecha: 2026-07-19 (posterior a 2026-07-19-facturacion-y-cadenilla.sql)
-- ----------------------------------------------------------------------------
--  Generada con:
--    npx prisma migrate diff --from-schema-datamodel <schema anterior> \
--                            --to-schema-datamodel prisma/schema.prisma --script
--
--  Equivale a `npx prisma db push`. Se puede pegar en el SQL Editor de Neon.
--  Es ADITIVA: solo agrega tres columnas nulables, no toca datos existentes.
--
--  `signature` guarda la imagen como data URI (data:image/png;base64,…) en vez
--  de un archivo, porque el disco de Vercel es de solo lectura y un archivo en
--  /public/uploads no sobrevive al despliegue.
-- ============================================================================

ALTER TABLE "Invoice" ADD COLUMN "signature" TEXT,
ADD COLUMN "signedAt" TIMESTAMP(3),
ADD COLUMN "signerName" TEXT;
