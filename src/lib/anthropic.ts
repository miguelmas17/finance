import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "Falta ANTHROPIC_API_KEY. Configúrala en tu archivo .env para poder analizar capturas.",
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const VISION_MODEL = "claude-sonnet-5";

export type ExtractedTransaction = {
  date: string; // ISO yyyy-mm-dd
  description: string;
  merchant: string | null;
  amount: number; // negativo = gasto, positivo = ingreso
  currency: string;
  suggestedCategory: string;
};

const EXTRACTION_PROMPT = `Eres un asistente financiero. Se te muestra una captura de pantalla de una app \
o web bancaria con un listado de movimientos/gastos de una cuenta.

Extrae TODOS los movimientos visibles en la imagen y devuélvelos EXCLUSIVAMENTE como un array JSON \
(sin texto adicional, sin markdown, sin \`\`\`), con este formato exacto por cada movimiento:

[
  {
    "date": "YYYY-MM-DD",
    "description": "texto original del movimiento tal cual aparece",
    "merchant": "nombre del comercio o entidad, o null si no se distingue",
    "amount": -12.34,
    "currency": "EUR",
    "suggestedCategory": "una de: Alimentación, Transporte, Vivienda, Salud, Ocio, Compras, Finanzas, Ingresos, Inversión, Otros"
  }
]

Reglas importantes:
- Los gastos deben tener "amount" NEGATIVO y los ingresos POSITIVO.
- Si no puedes deducir el año de la fecha, usa el año actual.
- Si no hay movimientos legibles, devuelve un array vacío [].
- No inventes movimientos que no aparezcan en la imagen.
- Responde SOLO con el JSON, nada más.`;

export async function analyzeStatementImage(
  base64Image: string,
  mediaType: string,
): Promise<ExtractedTransaction[]> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: VISION_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("El modelo no devolvió texto con los movimientos.");
  }

  const jsonText = extractJson(textBlock.text);
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error("La respuesta del modelo no es un array de movimientos.");
  }
  return parsed as ExtractedTransaction[];
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("No se encontró un array JSON en la respuesta del modelo.");
  }
  return trimmed.slice(start, end + 1);
}
