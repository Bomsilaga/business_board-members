"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { DIRECTORS, BUSINESS_SECTORS, MARKET_FOCUS } from "@/lib/directors";
import DirectorCard from "@/components/DirectorCard";
import { Send, Globe, TrendingUp, Shield, Zap, ChevronDown, ChevronUp } from "lucide-react";

const STATS = [
  { label: "Directors", value: "18", icon: Globe, color: "#6366f1" },
  { label: "Home Market", value: "Australia", icon: TrendingUp, color: "#10b981" },
  { label: "Sectors", value: "16+", icon: Zap, color: "#f59e0b" },
  { label: "Includes Opposer", value: "Yes", icon: Shield, color: "#dc2626" },
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [sector, setSector] = useState("");
  const [market, setMarket] = useState("Australia");
  const [running, setRunning] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [consensusPlan, setConsensusPlan] = useState<string | null>(null);
  const [consensusLoading, setConsensusLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const consensusRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!question.trim() || running) return;
    setRunning(true);
    setResponses({});
    setDone(false);
    setExpandedIds(new Set());
    setConsensusPlan(null);
    setConsensusLoading(false);

    const fullQuestion = `${question}${sector ? ` [Sector: ${sector}]` : ""} — Market focus: ${market}.`;

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
        const text = data.response || `⚠️ Error: ${data.error || "No response received."}`;
        collectedResponses[director.id] = text;
        setResponses((prev) => ({ ...prev, [director.id]: text }));
      } catch (e) {
        const text = `⚠️ Network error — check your connection and ANTHROPIC_API_KEY in Vercel settings. (${e instanceof Error ? e.message : e})`;
        collectedResponses[director.id] = text;
        setResponses((prev) => ({ ...prev, [director.id]: text }));
      }
    }

    setLoadingId(opposer.id);
    try {
      const allSoFar = regular.map((d) => `${d.name}: ${collectedResponses[d.id] ?? "no response"}`).join("\n\n");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: fullQuestion, directorId: opposer.id, previousResponses: allSoFar }),
      });
      const data = await res.json();
      setResponses((prev) => ({ ...prev, [opposer.id]: data.response || `⚠️ Error: ${data.error || "No response received."}` }));
    } catch (e) {
      setResponses((prev) => ({ ...prev, [opposer.id]: `⚠️ Network error: ${e instanceof Error ? e.message : e}` }));
    }

    setLoadingId(null);
    setRunning(false);
    setDone(true);

    // Generate consensus action plan from all responses
    setConsensusLoading(true);
    try {
      const res = await fetch("/api/consensus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: fullQuestion, responses: collectedResponses, market }),
      });
      const data = await res.json();
      setConsensusPlan(data.plan || `⚠️ ${data.error || "Could not generate action plan."}`);
    } catch (e) {
      setConsensusPlan(`⚠️ Network error generating action plan: ${e instanceof Error ? e.message : e}`);
    } finally {
      setConsensusLoading(false);
    }
  }, [question, sector, market, running]);

  // Auto-scroll to results when all done
  useEffect(() => {
    if (done && resultsRef.current) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, [done]);

  // Auto-scroll to consensus when it arrives
  useEffect(() => {
    if (consensusPlan && consensusRef.current) {
      setTimeout(() => consensusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, [consensusPlan]);

  const regular = DIRECTORS.filter((d) => !d.isOpposer);
  const opposer = DIRECTORS.find((d) => d.isOpposer)!;
  const responseCount = Object.keys(responses).length;
  const orderedDirectors = [...regular, opposer];

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Hero Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #07070f 0%, #0d0d20 50%, #07070f 100%)", borderBottom: "1px solid #252540" }}
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
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#6366f122", color: "#a5b4fc", border: "1px solid #6366f144" }}>
              🌏 Australia-Focused · Global Perspectives · 18 World-Class Directors
            </span>
          </div>
          <h1 className="text-center text-4xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: "#e2e2f0" }}>
            Global Business{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Board of Directors
            </span>
          </h1>
          <p className="text-center text-base mb-10 max-w-2xl mx-auto" style={{ color: "#7777aa" }}>
            Submit any business opportunity. 17 billionaire directors give you deep, actionable strategies — tools, links, regulatory steps, capital ranges.
            Then <span style={{ color: "#f87171" }}>The Opposer</span> stress-tests every assumption.
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
                style={{ color: "#e2e2f0", minHeight: 90 }}
                placeholder="Describe your business idea… e.g. 'I want to start a premium aged care facility in regional Queensland — what unconventional angles, low-competition niches, tools, regulatory steps and capital do I need?'"
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

      {/* Directors Grid — avatar status overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-bold" style={{ color: "#e2e2f0" }}>The Board</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#252540", color: "#7777aa" }}>17 Directors + The Opposer</span>
          {done && (
            <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: "#0a2a0a", color: "#4ade80", border: "1px solid #1a4a1a" }}>
              ✓ All {DIRECTORS.length} responses received — scroll down for full analysis
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-4">
          {regular.map((director, i) => (
            <DirectorCard key={director.id} director={director} response={responses[director.id] ?? null} loading={loadingId === director.id} index={i} />
          ))}
        </div>

        {/* Opposer */}
        <div
          className="mb-4 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0505 0%, #0f0005 100%)", border: "1px solid #dc262655", boxShadow: responses[opposer.id] ? "0 0 40px #dc262618" : undefined }}
        >
          <div className="px-4 py-2 flex items-center gap-2" style={{ background: "#dc262612", borderBottom: "1px solid #dc262628" }}>
            <span style={{ color: "#f87171" }}>⚔️</span>
            <span className="text-xs font-semibold" style={{ color: "#f87171" }}>THE OPPOSER — Critiques all 17 directors · Responds last</span>
          </div>
          <DirectorCard director={opposer} response={responses[opposer.id] ?? null} loading={loadingId === opposer.id} index={18} />
        </div>

        {responseCount === 0 && !running && (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">🌏</div>
            <p className="text-xl font-semibold mb-2" style={{ color: "#aaaacc" }}>Ask your first business question</p>
            <p className="text-sm max-w-md mx-auto" style={{ color: "#555577" }}>
              18 directors give you deep, actionable strategies — step-by-step setup, real tools, links, capital ranges, regulatory paths, and unconventional angles you won&apos;t find anywhere else.
            </p>
          </div>
        )}
      </div>

      {/* ====== FULL BOARD ANALYSIS — the actual output ====== */}
      {responseCount > 0 && (
        <div ref={resultsRef} className="max-w-5xl mx-auto px-4 pb-16">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #3b3b6a" }}>
            <div className="px-6 py-4" style={{ background: "linear-gradient(135deg, #0c0c20, #10102a)", borderBottom: "1px solid #252540" }}>
              <h2 className="text-xl font-bold" style={{ color: "#e2e2f0" }}>
                📋 Full Board Analysis
              </h2>
              <p className="text-xs mt-1" style={{ color: "#7777aa" }}>
                {responseCount}/{DIRECTORS.length} directors · Click any director to expand their full analysis
              </p>
            </div>

            <div style={{ background: "#08080f" }}>
              {orderedDirectors.map((director, i) => {
                const resp = responses[director.id];
                const isExpanded = expandedIds.has(director.id);
                const isOpp = director.isOpposer;
                const color = isOpp ? "#dc2626" : director.accentColor;

                return (
                  <div
                    key={director.id}
                    style={{ borderBottom: i < orderedDirectors.length - 1 ? "1px solid #1a1a2e" : undefined }}
                  >
                    {/* Director header row — always visible, clickable */}
                    <button
                      className="w-full text-left px-6 py-4 flex items-center gap-4 transition-all"
                      style={{ background: isExpanded ? `${color}08` : "transparent", cursor: "pointer" }}
                      onClick={() => resp && toggleExpand(director.id)}
                    >
                      <span className="text-2xl flex-shrink-0">{director.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm" style={{ color: isOpp ? "#f87171" : "#e2e2f0" }}>
                            {director.name}
                          </span>
                          <span className="text-xs" style={{ color: "#555577" }}>{director.company}</span>
                          {isOpp && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#dc262622", color: "#f87171" }}>Devil's Advocate</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {director.expertise.slice(0, 3).map((e) => (
                            <span key={e} className="text-xs" style={{ color: color, fontSize: "10px" }}>#{e.replace(/\s/g, "")}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {loadingId === director.id && (
                          <span className="text-xs animate-pulse" style={{ color }}>Thinking…</span>
                        )}
                        {resp && !isExpanded && (
                          <span className="text-xs hidden sm:block max-w-48 truncate" style={{ color: "#7777aa" }}>
                            {resp.slice(0, 60)}…
                          </span>
                        )}
                        {resp ? (
                          isExpanded ? <ChevronUp size={16} style={{ color }} /> : <ChevronDown size={16} style={{ color: "#555577" }} />
                        ) : (
                          <span className="text-xs" style={{ color: "#333355" }}>
                            {loadingId === director.id ? "…" : "Waiting"}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Full response — shown when expanded */}
                    {resp && isExpanded && (
                      <div className="px-6 pb-6" style={{ background: `${color}05` }}>
                        <div
                          className="rounded-xl p-5"
                          style={{
                            background: isOpp ? "#1a050510" : "#0f0f1a",
                            border: `1px solid ${color}22`,
                          }}
                        >
                          <div className="prose prose-invert max-w-none">
                            {resp.split("\n").map((line, li) => {
                              if (!line.trim()) return <div key={li} className="h-2" />;
                              const isBullet = /^[-•*]\s/.test(line.trim());
                              const isNumbered = /^\d+[.)]\s/.test(line.trim());
                              const isHeading = line.trim().startsWith("**") && line.trim().endsWith("**");

                              if (isHeading) {
                                return (
                                  <p key={li} className="font-bold text-sm mt-3 mb-1" style={{ color }}>
                                    {line.replace(/\*\*/g, "")}
                                  </p>
                                );
                              }
                              if (isBullet || isNumbered) {
                                return (
                                  <div key={li} className="flex gap-2 text-sm mb-1.5" style={{ color: "#ccccee" }}>
                                    <span style={{ color, flexShrink: 0, marginTop: 2 }}>
                                      {isBullet ? "▸" : line.match(/^\d+/)?.[0] + "."}
                                    </span>
                                    <span>{line.replace(/^[-•*]\s/, "").replace(/^\d+[.)]\s/, "")}</span>
                                  </div>
                                );
                              }
                              return (
                                <p key={li} className="text-sm leading-relaxed mb-2" style={{ color: "#b0b0cc" }}>
                                  {line}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Expand All / Collapse All */}
            {responseCount > 0 && (
              <div className="px-6 py-3 flex gap-3" style={{ background: "#0c0c18", borderTop: "1px solid #1a1a2e" }}>
                <button
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "#6366f122", color: "#a5b4fc", border: "1px solid #6366f133" }}
                  onClick={() => setExpandedIds(new Set(orderedDirectors.filter(d => responses[d.id]).map(d => d.id)))}
                >
                  Expand All
                </button>
                <button
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "#252540", color: "#7777aa" }}
                  onClick={() => setExpandedIds(new Set())}
                >
                  Collapse All
                </button>
                {done && (
                  <span className="ml-auto text-xs self-center" style={{ color: "#4ade80" }}>
                    ✓ Board session complete
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== BOARD CONSENSUS ACTION PLAN ====== */}
      {(consensusLoading || consensusPlan) && (
        <div ref={consensusRef} className="max-w-5xl mx-auto px-4 pb-16">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #22c55e44" }}>
            <div className="px-6 py-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #061206, #081508)", borderBottom: "1px solid #22c55e22" }}>
              <span style={{ fontSize: 22 }}>🎯</span>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#e2e2f0" }}>Board Consensus — Step-by-Step Action Plan</h2>
                <p className="text-xs mt-0.5" style={{ color: "#7777aa" }}>
                  Synthesised from all 18 director analyses · Market: {market}
                </p>
              </div>
              {consensusLoading && (
                <span className="ml-auto text-xs animate-pulse" style={{ color: "#22c55e" }}>Synthesising board consensus…</span>
              )}
            </div>

            <div className="px-6 py-6" style={{ background: "#07100a" }}>
              {consensusLoading && !consensusPlan && (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="shimmer h-4 rounded" style={{ width: `${70 + i * 5}%` }} />
                  ))}
                </div>
              )}
              {consensusPlan && (
                <div className="space-y-1">
                  {consensusPlan.split("\n").map((line, i) => {
                    if (!line.trim()) return <div key={i} className="h-2" />;
                    const isH2 = line.trim().startsWith("**") && line.trim().endsWith("**");
                    const isBullet = /^[-•*]\s/.test(line.trim());
                    const isNumbered = /^\d+[.)]\s/.test(line.trim());

                    if (isH2) {
                      return (
                        <p key={i} className="font-bold text-sm mt-4 mb-2 pt-2" style={{ color: "#4ade80", borderTop: "1px solid #22c55e22" }}>
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    }
                    if (isBullet || isNumbered) {
                      const num = isNumbered ? line.match(/^\d+/)?.[0] : null;
                      return (
                        <div key={i} className="flex gap-3 text-sm mb-2" style={{ color: "#cceecc" }}>
                          <span className="flex-shrink-0 font-semibold" style={{ color: "#4ade80", minWidth: 20 }}>
                            {isNumbered ? `${num}.` : "▸"}
                          </span>
                          <span>{line.replace(/^[-•*]\s/, "").replace(/^\d+[.)]\s/, "")}</span>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="text-sm leading-relaxed" style={{ color: "#aaccaa" }}>
                        {line}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-center py-6" style={{ borderTop: "1px solid #252540", color: "#444466" }}>
        <p className="text-xs">Global Business Board of Directors · Powered by Claude AI · {market}-Focused</p>
      </div>
    </main>
  );
}
