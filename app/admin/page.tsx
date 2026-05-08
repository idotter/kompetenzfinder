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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [entries, setEntries] = useState<FeedbackEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "up" | "down">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "kompetenz" | "aufgabe">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/feedback", {
        headers: { "x-admin-password": password },
      });
      if (res.status === 401) { setError("Falsches Passwort."); return; }
      if (!res.ok) { setError("Fehler beim Laden."); return; }
      setEntries(await res.json());
    } catch {
      setError("Verbindungsfehler.");
    } finally {
      setLoading(false);
    }
  };

  if (!entries) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Admin</h1>
          <p className="text-sm text-gray-500 mb-5">Feedback-Dashboard</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Passwort"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button
            onClick={load}
            disabled={loading || !password}
            className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "Laden…" : "Einloggen →"}
          </button>
        </div>
      </main>
    );
  }

  const filtered = entries.filter((e) => {
    if (filter !== "all" && e.rating !== filter) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    return true;
  });

  const total = entries.length;
  const ups = entries.filter((e) => e.rating === "up").length;
  const downs = entries.filter((e) => e.rating === "down").length;
  const withComment = entries.filter((e) => e.comment).length;

  // Stats per framework
  const fwStats: Record<string, { up: number; down: number }> = {};
  for (const e of entries) {
    const fw = e.framework ?? "Unbekannt";
    fwStats[fw] ??= { up: 0, down: 0 };
    fwStats[fw][e.rating]++;
  }

  // Most negative competencies
  const kompStats: Record<string, { up: number; down: number; name: string }> = {};
  for (const e of entries) {
    if (!e.kompetenz_name) continue;
    kompStats[e.kompetenz_name] ??= { up: 0, down: 0, name: e.kompetenz_name };
    kompStats[e.kompetenz_name][e.rating]++;
  }
  const topDown = Object.values(kompStats)
    .sort((a, b) => b.down - a.down)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback-Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kompetenz-Finder · Admin</p>
          </div>
          <a
            href="/api/feedback/export"
            className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            JSON exportieren ↓
          </a>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Feedbacks total" value={total} />
          <StatCard label="Positiv" value={ups} sub={total ? `${Math.round((ups / total) * 100)}%` : "—"} />
          <StatCard label="Negativ" value={downs} sub={total ? `${Math.round((downs / total) * 100)}%` : "—"} />
          <StatCard label="Mit Kommentar" value={withComment} />
        </div>

        {/* Framework breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
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
                  <span className="text-xs text-gray-500 w-20 text-right shrink-0">
                    👍 {s.up} · 👎 {s.down}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top negative competencies */}
        {topDown.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Meiste negative Bewertungen</p>
            <div className="space-y-1.5">
              {topDown.map((k) => (
                <div key={k.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate">{k.name}</span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">👎 {k.down} · 👍 {k.up}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {(["all", "up", "down"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${filter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
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
          <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} Einträge</span>
        </div>

        {/* Entry list */}
        <div className="space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                className="w-full text-left p-4"
                onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{e.rating === "up" ? "👍" : "👎"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {e.kompetenz_name ?? "—"}
                      </span>
                      {e.framework && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FRAMEWORK_COLORS[e.framework] ?? "bg-gray-100 text-gray-600"}`}>
                          {e.framework}
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {e.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {e.thema ?? "—"}{e.fach ? ` · ${e.fach}` : ""}{e.zyklus ? ` · ${e.zyklus}` : ""}
                      <span className="ml-2">
                        {new Date(e.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </p>
                    {e.comment && (
                      <p className="text-xs text-gray-600 mt-1 italic">«{e.comment}»</p>
                    )}
                  </div>
                </div>
              </button>

              {expanded === e.id && (
                <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50">
                  {e.warum && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Warum</p>
                      <p className="text-xs text-gray-600">{e.warum}</p>
                    </div>
                  )}
                  {e.aktivitaeten && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Aktivitäten</p>
                      <p className="text-xs text-gray-600">{e.aktivitaeten}</p>
                    </div>
                  )}
                  {e.aufgabe_text && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Aufgabe</p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">{e.aufgabe_text}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-300 font-mono">{e.id}</p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm text-gray-400">Keine Einträge.</div>
          )}
        </div>
      </div>
    </main>
  );
}
