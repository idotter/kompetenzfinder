"use client";

import { useState } from "react";

interface FeedbackEntry {
  id: string;
  created_at: string;
  type: "kompetenz" | "aufgabe";
  thema: string | null;
  fach: string | null;
  zyklus: string | null;
  kompetenz_name: string | null;
  framework: string | null;
  bereich: string | null;
  warum: string | null;
  aktivitaeten: string | null;
  aufgabe_text: string | null;
  rating: "up" | "down";
  comment: string | null;
}

interface QueryEntry {
  id: string;
  created_at: string;
  thema: string;
  fach: string | null;
  zyklus: string | null;
  frameworks: string[];
  competency_ids: string[];
  raw_output: string;
}

const FRAMEWORK_COLORS: Record<string, string> = {
  "Lehrplan 21": "bg-blue-100 text-blue-700",
  IDG: "bg-emerald-100 text-emerald-700",
  "Future Skills": "bg-violet-100 text-violet-700",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"queries" | "feedback">("queries");

  const [queries, setQueries] = useState<QueryEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [expandedF, setExpandedF] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<"all" | "up" | "down">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "kompetenz" | "aufgabe">("all");

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = { "x-admin-password": password };
      const [qRes, fRes] = await Promise.all([
        fetch("/api/admin/queries", { headers }),
        fetch("/api/admin/feedback", { headers }),
      ]);
      if (qRes.status === 401 || fRes.status === 401) { setError("Falsches Passwort."); return; }
      setQueries(await qRes.json());
      setFeedback(await fRes.json());
      setAuthed(true);
    } catch {
      setError("Verbindungsfehler.");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Admin</h1>
          <p className="text-sm text-gray-500 mb-5">Kompetenz-Finder Dashboard</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Passwort"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button onClick={login} disabled={loading || !password}
            className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 transition-colors">
            {loading ? "Laden…" : "Einloggen →"}
          </button>
        </div>
      </main>
    );
  }

  // ── Queries tab ──────────────────────────────────────────────────────────────

  // Top competency IDs
  const idCounts: Record<string, number> = {};
  for (const q of queries) {
    for (const id of q.competency_ids) {
      idCounts[id] = (idCounts[id] ?? 0) + 1;
    }
  }
  const topIds = Object.entries(idCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Top themes (by word count grouping — simple exact match)
  const themeCounts: Record<string, number> = {};
  for (const q of queries) {
    const key = q.thema.toLowerCase().trim();
    themeCounts[key] = (themeCounts[key] ?? 0) + 1;
  }
  const topThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // ── Feedback tab ─────────────────────────────────────────────────────────────

  const filteredFeedback = feedback.filter((e) => {
    if (ratingFilter !== "all" && e.rating !== ratingFilter) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    return true;
  });

  const ups = feedback.filter((e) => e.rating === "up").length;
  const downs = feedback.filter((e) => e.rating === "down").length;
  const withComment = feedback.filter((e) => e.comment).length;

  const fwStats: Record<string, { up: number; down: number }> = {};
  for (const e of feedback) {
    const fw = e.framework ?? "Unbekannt";
    fwStats[fw] ??= { up: 0, down: 0 };
    fwStats[fw][e.rating]++;
  }

  const kompStats: Record<string, { up: number; down: number }> = {};
  for (const e of feedback) {
    if (!e.kompetenz_name) continue;
    kompStats[e.kompetenz_name] ??= { up: 0, down: 0 };
    kompStats[e.kompetenz_name][e.rating]++;
  }
  const topDown = Object.entries(kompStats).sort((a, b) => b[1].down - a[1].down).slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kompetenz-Finder</p>
          </div>
          <a href="/api/feedback/export"
            className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
            Feedback-Export ↓
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit">
          {(["queries", "feedback"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "queries" ? `Abfragen (${queries.length})` : `Feedback (${feedback.length})`}
            </button>
          ))}
        </div>

        {/* ── ABFRAGEN TAB ───────────────────────────────────────────────────── */}
        {tab === "queries" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Abfragen total" value={queries.length} />
              <StatCard label="Unique Themen" value={Object.keys(themeCounts).length} />
              <StatCard label="Heute" value={queries.filter(q => q.created_at.startsWith(new Date().toISOString().slice(0, 10))).length} />
            </div>

            {topIds.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Meistgewählte Kompetenzen</p>
                <div className="space-y-2">
                  {topIds.map(([id, count]) => (
                    <div key={id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-gray-600 truncate">{id}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-400 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (count / (topIds[0]?.[1] ?? 1)) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{count}×</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topThemes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Häufigste Themen</p>
                <div className="flex flex-wrap gap-2">
                  {topThemes.map(([theme, count]) => (
                    <span key={theme} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                      {theme} {count > 1 && <span className="text-gray-400">×{count}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Query list */}
            <div className="space-y-2">
              {queries.map((q) => (
                <div key={q.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <button className="w-full text-left p-4" onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{q.thema}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[q.fach, q.zyklus].filter(Boolean).join(" · ")}
                          {q.frameworks?.length > 0 && ` · ${q.frameworks.join(", ")}`}
                          <span className="ml-2">{fmt(q.created_at)}</span>
                        </p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {q.competency_ids.map((id) => (
                            <span key={id} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                              {id.split("-").slice(0, 2).join("-")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                  {expandedQ === q.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Gewählte IDs</p>
                      <p className="text-xs font-mono text-gray-600 mb-3">{q.competency_ids.join(", ")}</p>
                      <details className="text-xs">
                        <summary className="text-gray-400 cursor-pointer hover:text-gray-600">Rohantwort anzeigen</summary>
                        <pre className="mt-2 text-gray-600 whitespace-pre-wrap text-xs leading-relaxed">{q.raw_output}</pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
              {queries.length === 0 && (
                <div className="text-center py-10 text-sm text-gray-400">Noch keine Abfragen gespeichert.</div>
              )}
            </div>
          </div>
        )}

        {/* ── FEEDBACK TAB ───────────────────────────────────────────────────── */}
        {tab === "feedback" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total" value={feedback.length} />
              <StatCard label="Positiv" value={ups} sub={feedback.length ? `${Math.round((ups / feedback.length) * 100)}%` : "—"} />
              <StatCard label="Negativ" value={downs} />
              <StatCard label="Mit Kommentar" value={withComment} />
            </div>

            {Object.keys(fwStats).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Nach Framework</p>
                <div className="space-y-2">
                  {Object.entries(fwStats).map(([fw, s]) => {
                    const tot = s.up + s.down;
                    const pct = tot ? Math.round((s.up / tot) * 100) : 0;
                    return (
                      <div key={fw} className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-36 shrink-0 ${FRAMEWORK_COLORS[fw] ?? "bg-gray-100 text-gray-600"}`}>
                          {fw}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-20 text-right shrink-0">👍 {s.up} · 👎 {s.down}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {topDown.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Meiste negative Bewertungen</p>
                <div className="space-y-1.5">
                  {topDown.map(([name, s]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate">{name}</span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">👎 {s.down} · 👍 {s.up}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter bar */}
            <div className="flex gap-2 flex-wrap">
              {(["all", "up", "down"] as const).map((f) => (
                <button key={f} onClick={() => setRatingFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${ratingFilter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  {f === "all" ? "Alle" : f === "up" ? "👍 Positiv" : "👎 Negativ"}
                </button>
              ))}
              <div className="w-px bg-gray-200 mx-1" />
              {(["all", "kompetenz", "aufgabe"] as const).map((f) => (
                <button key={f} onClick={() => setTypeFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${typeFilter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  {f === "all" ? "Alle Typen" : f === "kompetenz" ? "Kompetenzen" : "Aufgaben"}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400 self-center">{filteredFeedback.length} Einträge</span>
            </div>

            <div className="space-y-2">
              {filteredFeedback.map((e) => (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <button className="w-full text-left p-4" onClick={() => setExpandedF(expandedF === e.id ? null : e.id)}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg shrink-0 mt-0.5">{e.rating === "up" ? "👍" : "👎"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-gray-900 truncate">{e.kompetenz_name ?? "—"}</span>
                          {e.framework && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FRAMEWORK_COLORS[e.framework] ?? "bg-gray-100 text-gray-600"}`}>
                              {e.framework}
                            </span>
                          )}
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{e.type}</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {e.thema ?? "—"}{e.fach ? ` · ${e.fach}` : ""}{e.zyklus ? ` · ${e.zyklus}` : ""}
                          <span className="ml-2">{fmt(e.created_at)}</span>
                        </p>
                        {e.comment && <p className="text-xs text-gray-600 mt-1 italic">«{e.comment}»</p>}
                      </div>
                    </div>
                  </button>
                  {expandedF === e.id && (
                    <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50">
                      {e.warum && <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Warum</p><p className="text-xs text-gray-600">{e.warum}</p></div>}
                      {e.aktivitaeten && <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Aktivitäten</p><p className="text-xs text-gray-600">{e.aktivitaeten}</p></div>}
                      {e.aufgabe_text && <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Aufgabe</p><p className="text-xs text-gray-600 whitespace-pre-wrap">{e.aufgabe_text}</p></div>}
                    </div>
                  )}
                </div>
              ))}
              {filteredFeedback.length === 0 && (
                <div className="text-center py-10 text-sm text-gray-400">Keine Einträge.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
