/**
 * Facturación electrónica — XML en formato UBL 2.1 (perfil DIAN Colombia).
 *
 * Genera el documento con la estructura que exige la DIAN, para que integrar
 * un proveedor tecnológico autorizado sea conectar la firma y el envío, no
 * rehacer el modelo de datos.
 *
 * ⚠️ LO QUE ESTE ARCHIVO **NO** HACE (a propósito, según lo acordado):
 *   · NO calcula el CUFE (requiere la clave técnica de la resolución DIAN).
 *   · NO firma digitalmente (requiere certificado .p12 y XAdES-EPES).
 *   · NO se conecta a los servicios web de la DIAN.
 * El bloque `ext:UBLExtensions` queda vacío y reservado justo para eso.
 *
 * Referencia: "Anexo Técnico de Factura Electrónica de Venta" (DIAN), que se
 * apoya en UBL 2.1 de OASIS.
 */

import { computeLine, itemDetails, type InvoiceView } from "@/lib/invoice";
import { addressLine, siteConfig } from "@/lib/site-config";

/** Escapa los cinco caracteres que no pueden ir crudos en XML. */
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Importe con dos decimales. El COP se maneja en enteros dentro de la app,
 * pero UBL exige decimales explícitos en todos los montos.
 */
function amount(value: number): string {
  return (value / 1).toFixed(2);
}

/** Fecha `YYYY-MM-DD` en hora de Colombia (UTC-5), que es la que exige la DIAN. */
function isoDate(date: Date): string {
  const bogota = new Date(date.getTime() - 5 * 60 * 60 * 1000);
  return bogota.toISOString().slice(0, 10);
}

/** Hora `HH:MM:SS-05:00`. */
function isoTime(date: Date): string {
  const bogota = new Date(date.getTime() - 5 * 60 * 60 * 1000);
  return `${bogota.toISOString().slice(11, 19)}-05:00`;
}

/**
 * Agrupa el IVA por porcentaje.
 *
 * UBL pide un `TaxSubtotal` por cada tarifa distinta (0 %, 5 %, 19 %…), no uno
 * por línea. Aquí se consolidan las líneas que comparten tarifa.
 */
function taxSubtotals(invoice: InvoiceView) {
  const byRate = new Map<number, { taxable: number; tax: number }>();

  for (const item of invoice.items) {
    const totals = computeLine({
      productId: null,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      accessories: item.accessories,
      installation: item.installation,
      transport: item.transport,
      surcharge: item.surcharge,
      discount: item.discount,
      taxRate: item.taxRate,
    });
    const current = byRate.get(item.taxRate) ?? { taxable: 0, tax: 0 };
    current.taxable += totals.taxable;
    current.tax += totals.tax;
    byRate.set(item.taxRate, current);
  }

  return [...byRate.entries()].map(([rate, v]) => ({ rate, ...v }));
}

/** Bloque `cac:Address` reutilizable para emisor y receptor. */
function addressBlock(indent: string, line: string, cityName: string): string {
  const f = siteConfig.fiscal;
  const i = indent;
  return `${i}<cac:Address>
${i}  <cbc:ID>${esc(f.cityCode)}</cbc:ID>
${i}  <cbc:CityName>${esc(cityName)}</cbc:CityName>
${i}  <cbc:CountrySubentity>${esc(f.departmentName)}</cbc:CountrySubentity>
${i}  <cbc:CountrySubentityCode>${esc(f.departmentCode)}</cbc:CountrySubentityCode>
${i}  <cac:AddressLine>
${i}    <cbc:Line>${esc(line)}</cbc:Line>
${i}  </cac:AddressLine>
${i}  <cac:Country>
${i}    <cbc:IdentificationCode>${esc(f.countryCode)}</cbc:IdentificationCode>
${i}    <cbc:Name languageID="es">${esc(f.countryName)}</cbc:Name>
${i}  </cac:Country>
${i}</cac:Address>`;
}

/** Emisor (`AccountingSupplierParty`). */
function supplierParty(): string {
  const f = siteConfig.fiscal;
  return `  <cac:AccountingSupplierParty>
    <cbc:AdditionalAccountID>${esc(f.personType)}</cbc:AdditionalAccountID>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${esc(siteConfig.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PhysicalLocation>
${addressBlock("        ", addressLine(", "), f.cityName)}
      </cac:PhysicalLocation>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${esc(f.legalName)}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeAgencyName="CO, DIAN" schemeID="${esc(f.dv)}" schemeName="31">${esc(f.nit)}</cbc:CompanyID>
        <cbc:TaxLevelCode listName="No aplica">${esc(f.taxLevelCode)}</cbc:TaxLevelCode>
${addressBlock("        ", addressLine(", "), f.cityName)}
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:Telephone>${esc(siteConfig.whatsapp.display)}</cbc:Telephone>
        <cbc:ElectronicMail>${esc(siteConfig.email)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>`;
}

/** Receptor (`AccountingCustomerParty`). */
function customerParty(invoice: InvoiceView): string {
  const f = siteConfig.fiscal;
  const c = invoice.customer;
  const nombre = c ? `${c.firstName} ${c.lastName}`.trim() : "Consumidor final";
  // Sin identificación del cliente la DIAN admite "222222222222" para
  // consumidor final; se usa como marcador mientras no se capture el documento.
  const id = "222222222222";

  return `  <cac:AccountingCustomerParty>
    <cbc:AdditionalAccountID>2</cbc:AdditionalAccountID>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${esc(nombre)}</cbc:Name>
      </cac:PartyName>
      <cac:PhysicalLocation>
${addressBlock("        ", c?.address ?? "", c?.city ?? f.cityName)}
      </cac:PhysicalLocation>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${esc(nombre)}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeAgencyName="CO, DIAN" schemeName="13">${id}</cbc:CompanyID>
        <cbc:TaxLevelCode listName="No aplica">R-99-PN</cbc:TaxLevelCode>
        <cac:TaxScheme>
          <cbc:ID>ZZ</cbc:ID>
          <cbc:Name>No aplica</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:Telephone>${esc(c?.phone ?? "")}</cbc:Telephone>
        <cbc:ElectronicMail>${esc(c?.email ?? "")}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>`;
}

/** Una línea de la factura (`cac:InvoiceLine`). */
function invoiceLine(item: InvoiceView["items"][number], index: number): string {
  const totals = computeLine({
    productId: null,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    accessories: item.accessories,
    installation: item.installation,
    transport: item.transport,
    surcharge: item.surcharge,
    discount: item.discount,
    taxRate: item.taxRate,
  });

  const detalle = itemDetails(item);
  const descripcion = detalle ? `${item.name} — ${detalle}` : item.name;

  // unitCode="94" = unidad, según UN/ECE Recommendation 20 (tabla de la DIAN).
  return `  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="94">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${amount(totals.taxable)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">${amount(totals.tax)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="COP">${amount(totals.taxable)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="COP">${amount(totals.tax)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${item.taxRate.toFixed(2)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>01</cbc:ID>
            <cbc:Name>IVA</cbc:Name>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${esc(descripcion)}</cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${amount(item.unitPrice)}</cbc:PriceAmount>
      <cbc:BaseQuantity unitCode="94">${item.quantity}</cbc:BaseQuantity>
    </cac:Price>
  </cac:InvoiceLine>`;
}

/**
 * Documento completo en UBL 2.1.
 *
 * `fiscalReady` indica si los datos del RUT están cargados; cuando faltan, el
 * XML lleva un comentario de aviso en vez de aparentar estar listo.
 */
export function invoiceToUbl(invoice: InvoiceView): string {
  const f = siteConfig.fiscal;
  const issued = new Date(invoice.issuedAt);
  const subtotals = taxSubtotals(invoice);

  /*
   * Todos los totales se derivan de las MISMAS líneas, no de las columnas
   * guardadas en la factura.
   *
   * Es deliberado: la DIAN rechaza un documento cuyo `TaxAmount` global no
   * cuadre con la suma de sus `TaxSubtotal`, y mezclar ambas fuentes deja esa
   * puerta abierta si una remisión antigua trae los totales en cero o si
   * alguien edita la factura a mano en la base. Derivando todo de las líneas,
   * el XML siempre es coherente consigo mismo.
   */
  const taxExclusive = subtotals.reduce((s, t) => s + t.taxable, 0);
  const taxAmount = subtotals.reduce((s, t) => s + t.tax, 0);
  const lineExtension = taxExclusive;
  const taxInclusive = taxExclusive + taxAmount;
  const fiscalReady = Boolean(f.nit && f.legalName && !f.legalName.startsWith("PENDIENTE"));

  const aviso = fiscalReady
    ? ""
    : `
<!-- AVISO: faltan los datos fiscales del emisor (NIT y razon social) en
     src/lib/site-config.ts, bloque "fiscal". El documento NO es presentable
     mientras esos campos esten vacios. -->`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Factura electrónica UBL 2.1 — perfil DIAN Colombia.
     Documento PREPARATORIO: sin CUFE, sin firma digital (XAdES) y sin envío
     a la DIAN. No tiene validez fiscal en este estado. -->${aviso}
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <!-- Reservado para DianExtensions (CUFE, QR) y ds:Signature. -->
  <ext:UBLExtensions/>
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1: Factura Electrónica de Venta</cbc:ProfileID>
  <cbc:ProfileExecutionID>${esc(f.environment)}</cbc:ProfileExecutionID>
  <cbc:ID>${esc(invoice.number)}</cbc:ID>
  <!-- El CUFE lo calcula el proveedor tecnológico con la clave técnica. -->
  <cbc:UUID schemeID="${esc(f.environment)}" schemeName="CUFE-SHA384"></cbc:UUID>
  <cbc:IssueDate>${isoDate(issued)}</cbc:IssueDate>
  <cbc:IssueTime>${isoTime(issued)}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  <cbc:Note>${esc(invoice.notes ?? "")}</cbc:Note>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${invoice.items.length}</cbc:LineCountNumeric>
${supplierParty()}
${customerParty(invoice)}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="COP">${amount(taxAmount)}</cbc:TaxAmount>
${subtotals
  .map(
    (t) => `    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="COP">${amount(t.taxable)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="COP">${amount(t.tax)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>${t.rate.toFixed(2)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>`,
  )
  .join("\n")}
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">${amount(lineExtension)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="COP">${amount(taxExclusive)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="COP">${amount(taxInclusive)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="COP">${amount(invoice.discountTotal)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="COP">${amount(taxInclusive)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${invoice.items.map(invoiceLine).join("\n")}
</Invoice>
`;
}

/** `true` si los datos fiscales del RUT ya están cargados. */
export function isFiscalDataReady(): boolean {
  const f = siteConfig.fiscal;
  return Boolean(f.nit && f.legalName && !f.legalName.startsWith("PENDIENTE"));
}
