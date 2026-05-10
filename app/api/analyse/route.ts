import { Mistral } from "@mistralai/mistralai";
import { NextRequest } from "next/server";
import { getKompetenzenForFrameworks } from "@/data/kompetenzen";
import { put } from "@vercel/blob";

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

  return `Du bist ein erfahrener pädagogischer Berater für Lehrpersonen in der Schweiz. Du weisst genau, wie sich überfachliche Kompetenzen organisch in bestehende Unterrichtsthemen einbauen lassen — nicht als Zusatz, sondern als natürlicher Teil des Lernprozesses.

KOMPETENZ-DATENBANK — wähle AUSSCHLIESSLICH aus dieser Liste:

${dbText}

---

QUALITÄTSKRITERIEN:

Warum-Begründung:
- Beziehe dich auf einen konkreten Moment im Unterricht zu diesem Thema (z.B. «Beim Vergleich der Messwerte...», «Wenn Schüler:innen die Ursachen diskutieren...»)
- Erkläre WARUM genau diese Kompetenz bei DIESEM Thema besonders gut passt — nicht generisch
- Vermeide «dieses Thema bietet Potenzial für...» — zeige stattdessen WO im Unterricht die Kompetenz konkret auftaucht

Aktivitäten:
- Direkt verwendbar: so konkret, dass eine Lehrperson sie morgen einsetzen kann
- Zyklus 1 (1.–2. Klasse): spielerisch, körperlich, kurz, mit Material oder Bildern
- Zyklus 2 (3.–6. Klasse): strukturierte Einzel-/Gruppenarbeit, einfache Reflexion, Protokolle
- Zyklus 3 (7.–9. Klasse): Diskussion, Recherche, eigenständige Projekte, tiefere Selbstreflexion
- Nenne konkrete Methoden (z.B. «Think-Pair-Share», «Forschertagebuch», «Galerierundgang», «Rollenspiel»)
- Schreib WAS und WIE — nicht nur «Schüler:innen reflektieren»

---

BEISPIELAUSGABE (Fotosynthese, Biologie, Zyklus 2):

## Einschätzung
Die Fotosynthese verbindet Beobachten, Hypothesenbildung und Systemdenken auf natürliche Weise — Schüler:innen arbeiten mit echten Pflanzen, sehen Veränderungen und müssen Ursachen erklären. Das schafft ideale Bedingungen für methodische und kognitive Kompetenzen.

## KOMPETENZ_1
ID: lp21-methodik-problemloesen
Warum: Beim klassischen Belichtungsexperiment stehen Schüler:innen vor einem echten Rätsel — sie beobachten Unterschiede, entwickeln Hypothesen und müssen Erklärungen finden, bevor die Lösung besprochen wird.
Aktivitäten:
- Zwei Topfpflanzen: eine beleuchtet, eine abgedeckt — Wachstum täglich messen und Hypothesen notieren, bevor die Erklärung erarbeitet wird
- «Was würde passieren, wenn...»-Karten: Schüler:innen schreiben Vorhersagen auf, vergleichen in der Gruppe und diskutieren Abweichungen

## KOMPETENZ_2
ID: idg-thinking-systems
Warum: Die Fotosynthese-Gleichung ist ein ideales Einstiegsobjekt für Systemdenken: Schüler:innen erkennen Inputs, Outputs und Kreisläufe — und verstehen, dass das Entfernen eines Elements das ganze System beeinflusst.
Aktivitäten:
- Gemeinsam ein Kreislaufdiagramm des Kohlenstoffzyklus erarbeiten: Pfeile beschriften, Rückkopplungen markieren
- Rollenspiel «Molekülreise»: Schüler:innen spielen CO₂-, H₂O- und O₂-Moleküle und wandern physisch durch die Fotosynthese-Stationen im Klassenzimmer

## KOMPETENZ_3
ID: lp21-methodik-lernorganisation
Warum: Das Versuchsprotokoll zwingt Schüler:innen, ihren Erkenntnisprozess zu strukturieren — Fragestellung, Vorgehen, Beobachtung und Schluss werden explizit gemacht und anschliessend verglichen.
Aktivitäten:
- Forschertagebuch: täglich zwei Sätze zur Pflanzenbeobachtung mit Datum und Skizze
- Versuchsprotokoll in Partnerarbeit erstellen, dann mit einer anderen Gruppe tauschen und gegenseitig auf Vollständigkeit prüfen

## BONUS_1
ID: idg-acting-resources
Warum: Weniger offensichtlich — doch Fotosynthese ist der Ursprung aller Nahrungsenergie, was direkte Fragen zu Ressourcenverbrauch und Ernährung aufwirft.
Aktivitäten:
- Rechnung: Wie viel Sonnenlicht braucht eine Mittagsmahlzeit? Schüler:innen schätzen und recherchieren

## BONUS_2
ID: fs-meta-ethik
Warum: Überraschend, aber naheliegend: Wer hat Zugang zu fruchtbarem Boden und Wasser? Die Fotosynthese öffnet eine Tür zu Fragen über Ernährungsgerechtigkeit weltweit.
Aktivitäten:
- Weltkarte: Wo wächst was — und warum nicht überall? Kurzrecherche und Diskussion in Kleingruppen

---

AUSGABEFORMAT — exakt einhalten wie im Beispiel oben:

## Einschätzung
[2 präzise Sätze: was macht dieses spezifische Thema besonders geeignet]

## KOMPETENZ_1
ID: [exakte ID aus der Datenbank]
Warum: [1–2 Sätze mit konkretem Bezug zu einem Moment im Unterricht]
Aktivitäten:
- [Konkrete, direkt einsetzbare Aktivität mit Methode]
- [Zweite Aktivität]

## KOMPETENZ_2
ID: [exakte ID]
Warum: [1–2 Sätze]
Aktivitäten:
- [Aktivität 1]
- [Aktivität 2]

## KOMPETENZ_3
ID: [exakte ID]
Warum: [1–2 Sätze]
Aktivitäten:
- [Aktivität 1]
- [Aktivität 2]

## BONUS_1
ID: [exakte ID]
Warum: [1 Satz — warum überraschend, konkreter Bezug zum Thema]
Aktivitäten:
- [Eine direkt einsetzbare Aktivität]

## BONUS_2
ID: [exakte ID]
Warum: [1 Satz]
Aktivitäten:
- [Eine Aktivität]

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
      let fullText = "";
      const encoder = new TextEncoder();
      for await (const chunk of stream) {
        const delta = chunk.data.choices[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "delta", text: delta })}\n\n`)
          );
        }
      }
      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      controller.close();

      // Save query log (fire and forget)
      const id = crypto.randomUUID();
      const competencyIds = [...fullText.matchAll(/^ID:\s*(.+)$/gm)].map((m) => m[1].trim());
      const entry = {
        id,
        created_at: new Date().toISOString(),
        thema,
        fach: fach ?? null,
        zyklus: zyklus ?? null,
        frameworks: frameworks ?? [],
        competency_ids: competencyIds,
        raw_output: fullText,
      };
      put(`queries/${id}.json`, JSON.stringify(entry), {
        access: "public",
        contentType: "application/json",
      }).catch(() => {});
    },
  });

  return new Response(readableStream, { headers: { "Content-Type": "text/event-stream" } });
}
