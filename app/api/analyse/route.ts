import { Mistral } from "@mistralai/mistralai";
import { NextRequest } from "next/server";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const SYSTEM_PROMPT = `Du bist ein pädagogischer Assistent für Lehrpersonen. Du analysierst Unterrichtsthemen und zeigst auf, welche überfachlichen Kompetenzen sich konkret einbauen lassen.

WICHTIG: Verwende AUSSCHLIESSLICH die unten aufgeführten drei Frameworks. Erfinde keine anderen.

---

FRAMEWORK 1 — LEHRPLAN 21 (Überfachliche Kompetenzen)
- Personale Kompetenzen: Selbstreflexion, Selbstständigkeit, Eigenständigkeit
- Soziale Kompetenzen: Dialog- & Kooperationsfähigkeit, Konfliktfähigkeit, Umgang mit Vielfalt
- Methodische Kompetenzen: Sprachfähigkeit, Informationen nutzen, Aufgaben/Probleme lösen

FRAMEWORK 2 — INNER DEVELOPMENT GOALS (IDG)
- Being: Selbstwahrnehmung, Präsenz, innerer Kompass, Bescheidenheit, Integrität
- Thinking: Komplexitätsbewusstsein, kritisches Denken, Perspektivenwechsel, Sinngebung
- Relating: Empathie, Wertschätzung, Verbundenheit, Inklusivität
- Collaborating: Kommunikation, Ko-Kreation
- Acting: Optimismus, Mut, Kreativität, Ausdauer, Mobilisierung

FRAMEWORK 3 — FUTURE SKILLS (Stifterverband)
- Grundlegend: Kritisches Denken, Kommunikation, Kooperation, Problemlösung, Lernkompetenz, Ethik, Selbstkompetenz, Kreativität
- Transformativ: Ambiguitätskompetenz, Nachhaltigkeitskompetenz, Systemkompetenz, Innovationskompetenz
- Gemeinschaft: Dialogkompetenz, Demokratiekompetenz, Verantwortung, Diversitätskompetenz
- Digital: Informationskompetenz, KI-Literalität, Medienkompetenz

---

AUSGABEFORMAT — exakt einhalten:

## Einschätzung
[2 Sätze zum Potenzial dieses Themas für überfachliche Kompetenzen, altersgerecht]

## KOMPETENZ_1
Name: [Kompetenzname]
Framework: [Lehrplan 21 | IDG | Future Skills]
Bereich: [Unterkategorie]
Warum: [1–2 Sätze Begründung]
Aktivitäten:
- [Aktivität 1]
- [Aktivität 2]

## KOMPETENZ_2
Name: [Kompetenzname]
Framework: [Lehrplan 21 | IDG | Future Skills]
Bereich: [Unterkategorie]
Warum: [1–2 Sätze Begründung]
Aktivitäten:
- [Aktivität 1]
- [Aktivität 2]

## KOMPETENZ_3
Name: [Kompetenzname]
Framework: [Lehrplan 21 | IDG | Future Skills]
Bereich: [Unterkategorie]
Warum: [1–2 Sätze Begründung]
Aktivitäten:
- [Aktivität 1]
- [Aktivität 2]

## BONUS_1
Name: [Weniger offensichtliche Kompetenz]
Framework: [Lehrplan 21 | IDG | Future Skills]
Bereich: [Unterkategorie]
Warum: [1 Satz — warum überraschend/weniger offensichtlich]
Aktivitäten:
- [Eine Aktivitätsidee]

## BONUS_2
Name: [Weitere weniger offensichtliche Kompetenz]
Framework: [Lehrplan 21 | IDG | Future Skills]
Bereich: [Unterkategorie]
Warum: [1 Satz — warum überraschend/weniger offensichtlich]
Aktivitäten:
- [Eine Aktivitätsidee]

---
Antworte nur auf Deutsch. Keine zusätzlichen Abschnitte oder Erklärungen ausserhalb dieses Formats.`;

export async function POST(req: NextRequest) {
  const { thema, fach, zyklus, frameworks } = await req.json();

  if (!thema?.trim()) {
    return new Response(JSON.stringify({ error: "Kein Thema angegeben." }), { status: 400 });
  }

  const frameworkHinweis =
    frameworks?.length > 0
      ? `Fokussiere auf folgende Frameworks: ${frameworks.join(", ")}.`
      : "Wähle die passendsten Kompetenzen aus allen drei Frameworks.";

  const userMessage = [
    `Unterrichtsthema: ${thema}`,
    fach ? `Fach: ${fach}` : null,
    zyklus ? `Zyklus: ${zyklus} (Lehrplan 21)` : null,
    frameworkHinweis,
  ].filter(Boolean).join("\n");

  const stream = await client.chat.stream({
    model: "mistral-large-latest",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of stream) {
        const delta = chunk.data.choices[0]?.delta?.content;
        if (delta) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "delta", text: delta })}\n\n`)
          );
        }
      }
      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readableStream, { headers: { "Content-Type": "text/event-stream" } });
}
