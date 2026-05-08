import { Mistral } from "@mistralai/mistralai";
import { NextRequest } from "next/server";
import { getKompetenzenForFrameworks } from "@/data/kompetenzen";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

function buildSystemPrompt(frameworks: string[]): string {
  const list = getKompetenzenForFrameworks(frameworks);

  const grouped = list.reduce<Record<string, typeof list>>((acc, k) => {
    const key = `${k.framework} · ${k.bereich}`;
    (acc[key] ??= []).push(k);
    return acc;
  }, {});

  const dbText = Object.entries(grouped)
    .map(([header, entries]) =>
      `[${header}]\n` +
      entries.map((e) => `  ${e.id} | ${e.name}: ${e.beschreibung}`).join("\n")
    )
    .join("\n\n");

  return `Du bist ein pädagogischer Assistent für Lehrpersonen in der Schweiz. Du analysierst Unterrichtsthemen und zeigst auf, welche überfachlichen Kompetenzen sich konkret einbauen lassen.

KOMPETENZ-DATENBANK — wähle AUSSCHLIESSLICH aus dieser Liste:

${dbText}

---

AUFGABE:
1. Wähle 3 Kompetenzen aus der Datenbank, die am besten zum Unterrichtsthema passen (KOMPETENZ_1–3).
2. Wähle 2 weitere Kompetenzen, die weniger offensichtlich sind (BONUS_1–2).
3. Generiere für jede Kompetenz konkrete Aktivitätsideen passend zum Thema, Fach und Zyklus.

AUSGABEFORMAT — exakt einhalten, keine anderen Felder:

## Einschätzung
[2 Sätze zum Potenzial dieses Themas]

## KOMPETENZ_1
ID: [exakte ID aus der Datenbank]
Warum: [1–2 Sätze Begründung, warum diese Kompetenz zum Thema passt]
Aktivitäten:
- [Konkrete Aktivität 1 für den angegebenen Zyklus]
- [Konkrete Aktivität 2]

## KOMPETENZ_2
ID: [exakte ID aus der Datenbank]
Warum: [1–2 Sätze]
Aktivitäten:
- [Aktivität 1]
- [Aktivität 2]

## KOMPETENZ_3
ID: [exakte ID aus der Datenbank]
Warum: [1–2 Sätze]
Aktivitäten:
- [Aktivität 1]
- [Aktivität 2]

## BONUS_1
ID: [exakte ID aus der Datenbank]
Warum: [1 Satz — warum überraschend/weniger offensichtlich]
Aktivitäten:
- [Eine Aktivitätsidee]

## BONUS_2
ID: [exakte ID aus der Datenbank]
Warum: [1 Satz — warum überraschend/weniger offensichtlich]
Aktivitäten:
- [Eine Aktivitätsidee]

---
Antworte nur auf Deutsch. Keine zusätzlichen Abschnitte.`;
}

export async function POST(req: NextRequest) {
  const { thema, fach, zyklus, frameworks } = await req.json();

  if (!thema?.trim()) {
    return new Response(JSON.stringify({ error: "Kein Thema angegeben." }), { status: 400 });
  }

  const frameworkHinweis =
    frameworks?.length > 0
      ? `Fokussiere auf folgende Frameworks: ${frameworks.join(", ")}.`
      : "Wähle die passendsten Kompetenzen aus allen Frameworks.";

  const userMessage = [
    `Unterrichtsthema: ${thema}`,
    fach ? `Fach: ${fach}` : null,
    zyklus ? `Zyklus: ${zyklus} (Lehrplan 21)` : null,
    frameworkHinweis,
  ].filter(Boolean).join("\n");

  const stream = await client.chat.stream({
    model: "mistral-large-latest",
    messages: [
      { role: "system", content: buildSystemPrompt(frameworks ?? []) },
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
