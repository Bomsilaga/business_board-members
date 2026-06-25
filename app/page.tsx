"use client";

import { useState, useCallback } from "react";
import { DIRECTORS, BUSINESS_SECTORS, MARKET_FOCUS } from "@/lib/directors";
import DirectorCard from "@/components/DirectorCard";
import ConsensusPanel from "@/components/ConsensusPanel";
import { Send, Globe, TrendingUp, Shield, Zap } from "lucide-react";

const STATS = [
  { label: "Directors", value: "18", icon: Globe, color: "#6366f1" },
  { label: "Markets", value: "AU & CN", icon: TrendingUp, color: "#10b981" },
  { label: "Sectors", value: "16+", icon: Zap, color: "#f59e0b" },
  { label: "Includes Opposer", value: "Yes", icon: Shield, color: "#dc2626" },
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [sector, setSector] = useState("");
  const [market, setMarket] = useState("Australia-China Trade");
  const [running, setRunning] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!question.trim() || running) return;
    setRunning(true);
    setResponses({});
    setDone(false);

    const fullQuestion = `${question}${sector ? ` (Sector: ${sector})` : ""} — focus on ${market} market opportunities.`;

    const regular = DIRECTORS.filter((d) => !d.isOpposer);
    const opposer = DIRECTORS.find((d) => d.isOpposer)!;

    const collectedResponses: Record<string, string> = {};

    for (const director of regular) {
      setLoadingId(director.id);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: fullQuestion, directorId: director.id }),
        });
        const data = await res.json();
        if (data.response) {
          collectedResponses[director.id] = data.response;
          setResponses((prev) => ({ ...prev, [director.id]: data.response }));
        }
      } catch {
        collectedResponses[director.id] = "Unable to generate response. Please check your API key.";
        setResponses((prev) => ({ ...prev, [director.id]: collectedResponses[director.id] }));
      }
    }

    // Opposer last — sees all previous responses
    setLoadingId(opposer.id);
    try {
      const allSoFar = regular
        .map((d) => `${d.name}: ${collectedResponses[d.id] ?? "no response"}`)
        .join("\n\n");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: fullQuestion, directorId: opposer.id, previousResponses: allSoFar }),
      });
      const data = await res.json();
      if (data.response) {
        setResponses((prev) => ({ ...prev, [opposer.id]: data.response }));
      }
    } catch {
      setResponses((prev) => ({ ...prev, [opposer.id]: "Unable to generate Opposer response." }));
    }

    setLoadingId(null);
    setRunning(false);
    setDone(true);
  }, [question, sector, market, running]);

  const regular = DIRECTORS.filter((d) => !d.isOpposer);
  const opposer = DIRECTORS.find((d) => d.isOpposer)!;
  const responseCount = Object.keys(responses).length;

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Hero Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #07070f 0%, #0d0d20 50%, #07070f 100%)",
          borderBottom: "1px solid #252540",
        }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex justify-center mb-6">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: "#6366f122", color: "#a5b4fc", border: "1px solid #6366f144" }}
            >
              🌏 Australia & China Focus · 18 World-Class Directors
            </span>
          </div>

          <h1 className="text-center text-4xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: "#e2e2f0" }}>
            Global Business{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Board of Directors
            </span>
          </h1>
          <p className="text-center text-base mb-10 max-w-2xl mx-auto" style={{ color: "#7777aa" }}>
            Submit any business opportunity. 17 billionaire directors analyse it from their unique worldview,
            then <span style={{ color: "#f87171" }}>The Opposer</span> tears it apart.
            Focused on <strong style={{ color: "#aaaacc" }}>Australia & China</strong> markets.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "#0f0f1a", border: "1px solid #252540" }}>
                <Icon size={16} style={{ color }} />
                <span className="text-sm font-semibold" style={{ color: "#e2e2f0" }}>{value}</span>
                <span className="text-xs" style={{ color: "#7777aa" }}>{label}</span>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl p-4" style={{ background: "#0f0f1a", border: "1px solid #252540" }}>
              <textarea
                className="w-full bg-transparent text-sm resize-none outline-none mb-3"
                style={{ color: "#e2e2f0", minHeight: 80 }}
                placeholder="Describe your business idea… e.g. 'Premium Australian food exports to China — unconventional tricks, all tools, regulatory steps, capital needed, low-competition niches.'"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
              />
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  className="text-xs px-3 py-1.5 rounded-lg outline-none flex-1 min-w-32"
                  style={{ background: "#16162a", color: "#aaaacc", border: "1px solid #252540" }}
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                >
                  <option value="">All Sectors</option>
                  {BUSINESS_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  className="text-xs px-3 py-1.5 rounded-lg outline-none flex-1 min-w-32"
                  style={{ background: "#16162a", color: "#aaaacc", border: "1px solid #252540" }}
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                >
                  {MARKET_FOCUS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <button
                  onClick={handleSubmit}
                  disabled={!question.trim() || running}
                  className="flex items-center gap-2 px-5 py-1.5 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    background: running || !question.trim() ? "#252540" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: running || !question.trim() ? "#555577" : "#fff",
                    cursor: running || !question.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  <Send size={14} />
                  {running ? "Consulting…" : "Ask the Board"}
                </button>
              </div>
            </div>

            {running && (
              <div className="mt-3 text-center">
                <p className="text-xs" style={{ color: "#7777aa" }}>
                  {loadingId ? `Consulting ${DIRECTORS.find((d) => d.id === loadingId)?.name}…` : "Processing…"}{" "}
                  ({responseCount}/{DIRECTORS.length})
                </p>
                <div className="mt-2 h-1 rounded-full mx-auto max-w-xs" style={{ background: "#252540" }}>
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{ width: `${(responseCount / DIRECTORS.length) * 100}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Directors Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#e2e2f0" }}>The Board</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#252540", color: "#7777aa" }}>17 Directors + The Opposer</span>
          {done && (
            <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: "#0a2a0a", color: "#4ade80", border: "1px solid #1a4a1a" }}>
              ✓ All responses received
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {regular.map((director, i) => (
            <DirectorCard key={director.id} director={director} response={responses[director.id] ?? null} loading={loadingId === director.id} index={i} />
          ))}
        </div>

        {/* Opposer — full-width prominent card */}
        <div
          className="mb-6 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a0505 0%, #0f0005 100%)",
            border: "1px solid #dc262655",
            boxShadow: responses[opposer.id] ? "0 0 40px #dc262618" : undefined,
          }}
        >
          <div className="px-4 py-2 flex items-center gap-2" style={{ background: "#dc262612", borderBottom: "1px solid #dc262628" }}>
            <span style={{ color: "#f87171" }}>⚔️</span>
            <span className="text-xs font-semibold" style={{ color: "#f87171" }}>
              THE OPPOSER — Devil&apos;s Advocate · Critiques all 17 directors · Responds last
            </span>
          </div>
          <DirectorCard director={opposer} response={responses[opposer.id] ?? null} loading={loadingId === opposer.id} index={18} />
        </div>

        {responseCount >= 3 && (
          <ConsensusPanel responses={responses} totalDirectors={DIRECTORS.length} question={question} />
        )}

        {responseCount === 0 && !running && (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">🌏</div>
            <p className="text-xl font-semibold mb-2" style={{ color: "#aaaacc" }}>Ask your first business question</p>
            <p className="text-sm max-w-md mx-auto" style={{ color: "#555577" }}>
              All 18 directors will analyse it — including The Opposer who challenges every assumption.
              Get unconventional tricks, all tools needed, regulatory steps, capital ranges, and low-competition niches.
            </p>
          </div>
        )}
      </div>

      <div className="text-center py-6 mt-4" style={{ borderTop: "1px solid #252540", color: "#444466" }}>
        <p className="text-xs">Global Business Board of Directors · Powered by Claude AI · Australia & China Focus</p>
      </div>
    </main>
  );
}
