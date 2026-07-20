-- ============================================================================
--  Migración: módulo de facturación + cadenilla configurable
--  Fecha: 2026-07-19
-- ----------------------------------------------------------------------------
--  Generada con:
--    npx prisma migrate diff --from-schema-datamodel <schema anterior> \
--                            --to-schema-datamodel prisma/schema.prisma --script
--
--  Equivale exactamente a correr `npx prisma db push` con el esquema nuevo.
--  Existe para poder aplicarla desde el SQL Editor de Neon, sin terminal.
--
--  Es ADITIVA: crea columnas y tablas nuevas, no borra ni modifica datos
--  existentes. Las facturas/remisiones ya emitidas quedan intactas (sus
--  totales nuevos arrancan en 0 y el documento sigue mostrando `amount`).
--
--  Se puede correr una sola vez. Si se repite, fallará en el primer
--  ALTER TABLE porque la columna ya existirá: eso es esperado y no rompe nada.
-- ============================================================================

-- Invoice.orderId pasa a ser opcional: ahora una factura puede existir sin
-- pedido previo (armada directamente desde el catálogo).
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_orderId_fkey";

-- Producto: referencia del diseño y switch de la posición del mando.
ALTER TABLE "Product" ADD COLUMN     "allowChainSide" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "designRef" TEXT;

-- Cotización: guarda la posición del mando elegida por el cliente.
ALTER TABLE "Quote" ADD COLUMN     "chainSide" TEXT;

-- Factura: cliente propio, desglose de totales y observaciones.
ALTER TABLE "Invoice" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "discountTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "extrasTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "subtotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "orderId" DROP NOT NULL;

-- Líneas de la factura, con sus extras por producto.
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "designRef" TEXT,
    "fabric" TEXT,
    "chainSide" TEXT,
    "widthM" DOUBLE PRECISION,
    "heightM" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL DEFAULT 0,
    "accessories" INTEGER NOT NULL DEFAULT 0,
    "installation" INTEGER NOT NULL DEFAULT 0,
    "transport" INTEGER NOT NULL DEFAULT 0,
    "surcharge" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "lineTotal" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");

CREATE INDEX "Invoice_issuedAt_idx" ON "Invoice"("issuedAt");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
