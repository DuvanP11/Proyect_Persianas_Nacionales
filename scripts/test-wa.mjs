// ============================================================================
//  Prueba rápida de la WhatsApp Cloud API — Cortinería Nacional
// ----------------------------------------------------------------------------
//  Verifica que WHATSAPP_TOKEN y WHATSAPP_PHONE_ID funcionan, enviando un
//  mensaje de prueba al número que le pases.
//
//  Uso (Node 20.6+ carga el .env solo):
//    node --env-file=.env scripts/test-wa.mjs 3001112233
//
//  El número puede ir en formato local (Colombia) o internacional.
//  Si tienes WHATSAPP_TEMPLATE definido, prueba la plantilla; si no, texto libre
//  (recuerda: el texto libre solo llega si ese número te escribió en las últimas 24 h).
// ============================================================================

const API_VERSION = "v21.0";
const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;
const template = process.env.WHATSAPP_TEMPLATE;
const templateLang = process.env.WHATSAPP_TEMPLATE_LANG ?? "es";

const raw = process.argv[2];
if (!raw) {
  console.error("Falta el número de destino. Ej: node --env-file=.env scripts/test-wa.mjs 3001112233");
  process.exit(1);
}
if (!token || !phoneId) {
  console.error("Faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_ID en el .env");
  process.exit(1);
}

const digits = raw.replace(/\D/g, "");
const to = digits.startsWith("57") ? digits : `57${digits}`;
const body = "Prueba de notificaciones de Cortinería Nacional. Si ves este mensaje, ¡la API funciona!";

const payload = template
  ? {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: templateLang },
        components: [{ type: "body", parameters: [{ type: "text", text: body }] }],
      },
    }
  : { messaging_product: "whatsapp", to, type: "text", text: { preview_url: false, body } };

console.log(`Enviando a ${to} (${template ? `plantilla "${template}"` : "texto libre"})…`);

const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const data = await res.json().catch(() => ({}));
if (res.ok) {
  console.log("✅ Enviado. Respuesta de Meta:");
  console.log(JSON.stringify(data, null, 2));
} else {
  console.error(`❌ Error ${res.status}:`);
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}
