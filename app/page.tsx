"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Constants ───────────────────────────────────────────────────────────────

const FRAMEWORKS = ["Lehrplan 21", "IDG", "Future Skills"];
const ZYKLEN = ["Zyklus 1", "Zyklus 2", "Zyklus 3"];
const ZYKLUS_LABELS: Record<string, string> = {
  "Zyklus 1": "Z1 · 1.–2. Klasse",
  "Zyklus 2": "Z2 · 3.–6. Klasse",
  "Zyklus 3": "Z3 · 7.–9. Klasse",
};
const FRAMEWORK_COLORS: Record<string, { badge: string; dot: string; num: string }> = {
  "Lehrplan 21": { badge: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500", num: "bg-blue-500" },
  IDG: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", num: "bg-emerald-500" },
  "Future Skills": { badge: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-500", num: "bg-violet-500" },
};
const DEFAULT_COLORS = { badge: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400", num: "bg-gray-400" };

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kompetenz {
  name: string;
  framework: string;
  bereich: string;
  warum: string;
  aktivitaeten: string[];
  isBonus?: boolean;
}

interface AnalyseResult {
  einschaetzung: string;
  kompetenzen: Kompetenz[];
  bonus: Kompetenz[];
}

interface ModalTarget {
  feedbackKey: string;
  label: string;
  type: "kompetenz" | "aufgabe";
  meta: Record<string, string>;
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

function stripBold(s: string): string {
  return s.replace(/\*\*/g, "").trim();
}

function extractField(line: string, key: string): string | null {
  const m = line.trim().match(new RegExp(`^\\*{0,2}${key}:\\*{0,2}\\s*(.+)`, "i"));
  return m ? stripBold(m[1]) : null;
}

function parseResult(raw: string): AnalyseResult | null {
  try {
    const lines = raw.split("\n");
    const result: AnalyseResult = { einschaetzung: "", kompetenzen: [], bonus: [] };
    let section = "";
    let cur: Partial<Kompetenz> | null = null;
    let isBonus = false;
    const einLines: string[] = [];
    let inAktiv = false;

    const pushCur = () => {
      if (cur?.name) {
        (isBonus ? result.bonus : result.kompetenzen).push({ ...cur, isBonus } as Kompetenz);
      }
      cur = null;
      inAktiv = false;
    };

    for (const line of lines) {
      const t = line.trim();
      if (t === "## Einschätzung" || t === "## Einschaetzung") { pushCur(); section = "ein"; continue; }
      if (/^## KOMPETENZ_\d+$/i.test(t)) { pushCur(); cur = { aktivitaeten: [] }; isBonus = false; section = "komp"; continue; }
      if (/^## BONUS_\d+$/i.test(t)) { pushCur(); cur = { aktivitaeten: [] }; isBonus = true; section = "komp"; continue; }
      if (t.startsWith("## ")) { pushCur(); section = "other"; continue; }

      if (section === "ein" && t) {
        einLines.push(stripBold(t));
      } else if (section === "komp" && cur) {
        const name = extractField(t, "Name");
        const fw = extractField(t, "Framework");
        const bereich = extractField(t, "Bereich");
        const warum = extractField(t, "Warum");
        if (name) { cur.name = name; continue; }
        if (fw) { cur.framework = fw; continue; }
        if (bereich) { cur.bereich = bereich; continue; }
        if (warum) { cur.warum = warum; continue; }
        if (/^(\*{0,2})Aktivit[äa]ten:(\*{0,2})$/.test(t)) { inAktiv = true; continue; }
        if (inAktiv && (t.startsWith("- ") || t.startsWith("* "))) {
          cur.aktivitaeten = cur.aktivitaeten ?? [];
          cur.aktivitaeten.push(stripBold(t.slice(2)));
        }
      }
    }
    pushCur();
    result.einschaetzung = einLines.join(" ");
    return result.kompetenzen.length >= 2 ? result : null;
  } catch { return null; }
}

// ─── Streaming helper ─────────────────────────────────────────────────────────

function streamTo(url: string, body: object, onChunk: (t: string) => void, onDone: () => void) {
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then(async (res) => {
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return onDone();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") break;
          try { const p = JSON.parse(d); if (p.type === "delta" && p.text) onChunk(p.text); } catch { /* skip */ }
        }
      }
      onDone();
    });
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

function sendFeedback(payload: object) {
  fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {/* silent */});
}

function FeedbackButtons({
  feedbackKey,
  label,
  type,
  meta,
  feedbacks,
  onThumbsDown,
  onThumbsUp,
}: {
  feedbackKey: string;
  label: string;
  type: "kompetenz" | "aufgabe";
  meta: Record<string, string>;
  feedbacks: Record<string, "up" | "down">;
  onThumbsDown: (target: ModalTarget) => void;
  onThumbsUp: (key: string, meta: object) => void;
}) {
  const current = feedbacks[feedbackKey];

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          if (current === "up") return;
          onThumbsUp(feedbackKey, { ...meta, type, rating: "up" });
        }}
        className={`p-1.5 rounded-lg transition-colors text-base ${
          current === "up"
            ? "bg-green-100 text-green-600"
            : "hover:bg-gray-100 text-gray-400"
        }`}
        title="Passt gut"
      >
        👍
      </button>
      <button
        onClick={() => {
          if (current === "down") return;
          onThumbsDown({ feedbackKey, label, type, meta: { ...meta, type, rating: "down" } });
        }}
        className={`p-1.5 rounded-lg transition-colors text-base ${
          current === "down"
            ? "bg-red-100 text-red-500"
            : "hover:bg-gray-100 text-gray-400"
        }`}
        title="Passt nicht"
      >
        👎
      </button>
    </div>
  );
}

function FeedbackModal({
  target,
  onSubmit,
  onClose,
}: {
  target: ModalTarget;
  onSubmit: (comment: string) => void;
  onClose: () => void;
}) {
  const [comment, setComment] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-gray-900 mb-1">Was hat nicht gepasst?</h3>
        <p className="text-xs text-gray-500 mb-4">
          Bei: <span className="font-medium text-gray-700">{target.label}</span>
        </p>
        <textarea
          autoFocus
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="z.B. «Aktivität ist zu komplex für diesen Zyklus» oder «Framework-Zuordnung stimmt nicht»..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
          rows={3}
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onSubmit(comment)}
            className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            Absenden
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Markdown components ──────────────────────────────────────────────────────

const MdComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-sm text-gray-700 leading-relaxed mb-2">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="space-y-1.5 my-2">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex gap-2 text-sm text-gray-700">
      <span className="text-amber-500 shrink-0 mt-0.5">›</span>
      <span>{children}</span>
    </li>
  ),
};

// ─── Kompetenz Card ───────────────────────────────────────────────────────────

function KompetenzCard({
  k, i, isBonus, thema, fach, zyklus,
  task, taskLoading,
  feedbacks, onThumbsUp, onThumbsDown,
  onGenerateTask,
}: {
  k: Kompetenz; i: number; isBonus: boolean;
  thema: string; fach: string; zyklus: string;
  task?: string; taskLoading?: boolean;
  feedbacks: Record<string, "up" | "down">;
  onThumbsUp: (key: string, meta: object) => void;
  onThumbsDown: (target: ModalTarget) => void;
  onGenerateTask: (i: number, k: Kompetenz) => void;
}) {
  const colors = FRAMEWORK_COLORS[k.framework] ?? DEFAULT_COLORS;
  const kompKey = `komp-${isBonus ? "b" : ""}${i}`;
  const taskKey = `task-${isBonus ? "b" : ""}${i}`;
  const meta = {
    thema,
    fach,
    zyklus,
    kompetenz_name: k.name,
    framework: k.framework,
    bereich: k.bereich,
    warum: k.warum,
    aktivitaeten: k.aktivitaeten.join(" | "),
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}>
              {k.framework}
            </span>
            <span className="text-xs text-gray-400">{k.bereich}</span>
            {isBonus && (
              <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                weniger offensichtlich
              </span>
            )}
          </div>
          <FeedbackButtons
            feedbackKey={kompKey}
            label={k.name}
            type="kompetenz"
            meta={meta}
            feedbacks={feedbacks}
            onThumbsUp={onThumbsUp}
            onThumbsDown={onThumbsDown}
          />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-3">{k.name}</h2>

        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Warum passt das?
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{k.warum}</p>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Aktivitäten
          </p>
          <ul className="space-y-2">
            {k.aktivitaeten.map((a, j) => (
              <li key={j} className="flex gap-2">
                <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5 ${colors.num}`}>
                  {j + 1}
                </span>
                <span className="text-sm text-gray-700 leading-snug">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Generated task */}
      {task !== undefined && (
        <div className="mx-5 mb-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Aufgabe für Schüler:innen
            </p>
            {!taskLoading && task && (
              <FeedbackButtons
                feedbackKey={taskKey}
                label={`Aufgabe: ${k.name}`}
                type="aufgabe"
                meta={{ ...meta, aufgabe_text: task }}
                feedbacks={feedbacks}
                onThumbsUp={onThumbsUp}
                onThumbsDown={onThumbsDown}
              />
            )}
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MdComponents}>
            {task}
          </ReactMarkdown>
          {taskLoading && (
            <span className="inline-block w-1 h-3.5 bg-amber-400 animate-pulse rounded ml-0.5" />
          )}
        </div>
      )}

      {/* Generate task button */}
      <div className="px-5 pb-5">
        {task === undefined ? (
          <button
            onClick={() => onGenerateTask(i, k)}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Aufgabe für Schüler:innen generieren →
          </button>
        ) : !taskLoading ? (
          <button
            onClick={() => onGenerateTask(i, k)}
            className="w-full py-2 rounded-xl border border-gray-200 text-xs text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Neue Aufgabe generieren
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [thema, setThema] = useState("");
  const [fach, setFach] = useState("");
  const [zyklus, setZyklus] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [rawResult, setRawResult] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [parsed, setParsed] = useState<AnalyseResult | null>(null);
  const [tasks, setTasks] = useState<Record<string, string>>({});
  const [taskLoading, setTaskLoading] = useState<Record<string, boolean>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, "up" | "down">>({});
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);

  const toggleFramework = (fw: string) =>
    setSelectedFrameworks((prev) =>
      prev.includes(fw) ? prev.filter((f) => f !== fw) : [...prev, fw]
    );

  const analyse = () => {
    if (!thema.trim()) return;
    setAnalysing(true);
    setRawResult("");
    setParsed(null);
    setTasks({});
    setTaskLoading({});
    setFeedbacks({});

    let acc = "";
    streamTo(
      "/api/analyse",
      { thema, fach, zyklus, frameworks: selectedFrameworks },
      (text) => { acc += text; setRawResult(acc); },
      () => { setParsed(parseResult(acc)); setAnalysing(false); }
    );
  };

  const generateTask = useCallback((key: string, k: Kompetenz) => {
    setTaskLoading((prev) => ({ ...prev, [key]: true }));
    setTasks((prev) => ({ ...prev, [key]: "" }));
    streamTo(
      "/api/aufgabe",
      { thema, fach, zyklus, kompetenz: k.name, framework: k.framework, bereich: k.bereich, begruendung: k.warum },
      (text) => setTasks((prev) => ({ ...prev, [key]: (prev[key] ?? "") + text })),
      () => setTaskLoading((prev) => ({ ...prev, [key]: false }))
    );
  }, [thema, fach, zyklus]);

  const handleThumbsUp = useCallback((key: string, meta: object) => {
    setFeedbacks((prev) => ({ ...prev, [key]: "up" }));
    sendFeedback(meta);
  }, []);

  const handleThumbsDown = useCallback((target: ModalTarget) => {
    setModalTarget(target);
  }, []);

  const handleModalSubmit = (comment: string) => {
    if (!modalTarget) return;
    setFeedbacks((prev) => ({ ...prev, [modalTarget.feedbackKey]: "down" }));
    sendFeedback({ ...modalTarget.meta, comment });
    setModalTarget(null);
  };

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Kompetenz-Finder</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Überfachliche Kompetenzen in den Unterricht einbauen
          </p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Unterrichtsthema *
            </label>
            <textarea
              value={thema}
              onChange={(e) => setThema(e.target.value)}
              placeholder='z.B. «Fotosynthese», «Erster Weltkrieg», «Bruchrechnen»...'
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
              rows={2}
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) analyse(); }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Fach</label>
              <input
                type="text"
                value={fach}
                onChange={(e) => setFach(e.target.value)}
                placeholder="z.B. Biologie..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Zyklus</label>
              <div className="flex gap-1.5">
                {ZYKLEN.map((z) => (
                  <button key={z} onClick={() => setZyklus((p) => (p === z ? "" : z))} title={ZYKLUS_LABELS[z]}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${zyklus === z ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {z.replace("Zyklus ", "Z")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Framework-Filter <span className="normal-case font-normal text-gray-400">(leer = alle)</span>
            </label>
            <div className="flex gap-2">
              {FRAMEWORKS.map((fw) => {
                const c = FRAMEWORK_COLORS[fw];
                return (
                  <button key={fw} onClick={() => toggleFramework(fw)}
                    className={`flex-1 px-2 py-1.5 rounded-xl text-xs font-medium border transition-colors ${selectedFrameworks.includes(fw) ? c.badge + " border-current" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}>
                    {fw}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={analyse} disabled={analysing || !thema.trim()}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm shadow-sm">
            {analysing ? "Analysiere…" : "Kompetenzen vorschlagen →"}
          </button>
        </div>

        {/* Loading */}
        {analysing && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Analyse läuft…
            </div>
          </div>
        )}

        {/* Result */}
        {!analysing && parsed && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Einschätzung</p>
              <p className="text-sm text-gray-700 leading-relaxed">{parsed.einschaetzung}</p>
            </div>

            {parsed.kompetenzen.map((k, i) => (
              <KompetenzCard key={`k${i}`}
                k={k} i={i} isBonus={false}
                thema={thema} fach={fach} zyklus={zyklus}
                task={tasks[`k${i}`]} taskLoading={taskLoading[`k${i}`]}
                feedbacks={feedbacks}
                onThumbsUp={handleThumbsUp}
                onThumbsDown={handleThumbsDown}
                onGenerateTask={(idx, komp) => generateTask(`k${idx}`, komp)}
              />
            ))}

            {parsed.bonus.length > 0 && (
              <>
                <div className="pt-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                    Weniger offensichtlich
                  </p>
                </div>
                {parsed.bonus.map((k, i) => (
                  <KompetenzCard key={`b${i}`}
                    k={k} i={i} isBonus={true}
                    thema={thema} fach={fach} zyklus={zyklus}
                    task={tasks[`b${i}`]} taskLoading={taskLoading[`b${i}`]}
                    feedbacks={feedbacks}
                    onThumbsUp={handleThumbsUp}
                    onThumbsDown={handleThumbsDown}
                    onGenerateTask={(idx, komp) => generateTask(`b${idx}`, komp)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Fallback */}
        {!analysing && rawResult && !parsed && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawResult}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Feedback modal */}
      {modalTarget && (
        <FeedbackModal
          target={modalTarget}
          onSubmit={handleModalSubmit}
          onClose={() => setModalTarget(null)}
        />
      )}
    </main>
  );
}
