import { Mistral } from "@mistralai/mistralai";
import { NextRequest } from "next/server";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function POST(req: NextRequest) {
  const { thema, fach, zyklus, kompetenz, framework, bereich, begruendung } =
    await req.json();

  const zyklusLabel: Record<string, string> = {
    "Zyklus 1": "Zyklus 1 (1.–2. Klasse, ca. 6–9 Jahre)",
    "Zyklus 2": "Zyklus 2 (3.–6. Klasse, ca. 9–12 Jahre)",
    "Zyklus 3": "Zyklus 3 (7.–9. Klasse, ca. 12–15 Jahre)",
  };

  const zyklusHinweis: Record<string, string> = {
    "Zyklus 1": "Sprache einfach halten (kurze Sätze, bekannte Wörter), spielerische Elemente, körperliche Aktivität wenn möglich, max. 20 Minuten Aufmerksamkeit",
    "Zyklus 2": "Klare Struktur mit Schritten, Einzel- oder Partnerarbeit, konkrete Materialien oder Vorlagen, 30–45 Minuten realistisch",
    "Zyklus 3": "Eigenverantwortung betonen, Reflexionsanteil einbauen, komplexere Fragestellungen möglich, Ergebnis kann präsentiert oder diskutiert werden",
  };

  const prompt = `Du bist eine erfahrene Schweizer Lehrperson und Didaktik-Expertin. Erstelle eine konkrete, direkt einsetzbare Aufgabe für Schüler:innen.

Kontext:
- Unterrichtsthema: ${thema}
${fach ? `- Fach: ${fach}` : ""}
${zyklus ? `- Stufe: ${zyklusLabel[zyklus] ?? zyklus}` : ""}
- Zu fördernde Kompetenz: ${kompetenz} (${framework} · ${bereich})
- Warum diese Kompetenz passt: ${begruendung}
${zyklus && zyklusHinweis[zyklus] ? `- Didaktische Hinweise für diese Stufe: ${zyklusHinweis[zyklus]}` : ""}

QUALITÄTSKRITERIEN:
- Die Aufgabenstellung soll direkt an Schüler:innen gerichtet sein (Du-/Ihr-Form), nicht an die Lehrperson
- Die Kompetenz soll durch die Aufgabe geübt werden — nicht nur erwähnt werden
- Kein «Recherchiert das Thema» oder andere Leerformeln — sei spezifisch für DIESES Thema
- Die Aufgabe soll realistisch in einer Unterrichtsstunde durchführbar sein

FORMAT — exakt einhalten:

**Aufgabenstellung**
[Die Aufgabe direkt in der Du-/Ihr-Form, so wie sie an Schüler:innen kommuniziert wird — 3–5 Sätze, präzise und motivierend]

**Was die Lehrperson vorbereiten muss**
- [Konkretes Material oder Vorbereitung 1]
- [Konkretes Material oder Vorbereitung 2]

**Hinweis zur Kompetenzförderung**
[1 Satz: Wo genau wird die Kompetenz in dieser Aufgabe sichtbar und geübt?]

Antworte auf Deutsch.`;

  const stream = await client.chat.stream({
    model: "mistral-large-latest",
    messages: [{ role: "user", content: prompt }],
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of stream) {
        const delta = chunk.data.choices[0]?.delta?.content;
        if (delta) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "delta", text: delta })}\n\n`
            )
          );
        }
      }
      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
