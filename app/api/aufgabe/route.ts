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

  const prompt = `Erstelle eine konkrete Aufgabenstellung für Schüler:innen.

Kontext:
- Unterrichtsthema: ${thema}
${fach ? `- Fach: ${fach}` : ""}
${zyklus ? `- Stufe: ${zyklusLabel[zyklus] ?? zyklus}` : ""}
- Zu fördernde Kompetenz: ${kompetenz} (${framework} · ${bereich})
- Begründung der Wahl: ${begruendung}

Erstelle eine klar formulierte Aufgabenstellung für die Schüler:innen, die:
1. Direkt in den Fachinhalt eingebettet ist (nicht als Zusatz wirkt)
2. Die genannte Kompetenz explizit fördert
3. Altersgerecht formuliert ist
4. Konkret und durchführbar ist (nicht zu vage)

Format:
**Aufgabenstellung**
[Die Aufgabe direkt, so wie sie an Schüler:innen kommuniziert werden könnte — 3–6 Sätze]

**Was die Lehrperson vorbereiten muss**
- [Punkt 1]
- [Punkt 2]

**Hinweis zur Kompetenzförderung**
[1 Satz: Wie wird die Kompetenz konkret sichtbar/geübt?]

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
