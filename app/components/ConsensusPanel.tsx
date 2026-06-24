"use client";

import { CheckCircle, XCircle, ArrowRight, Users } from "lucide-react";

interface Props {
  responses: Record<string, string>;
  totalDirectors: number;
  question: string;
}

export default function ConsensusPanel({ responses, totalDirectors, question }: Props) {
  const count = Object.keys(responses).length;
  const pct = Math.round((count / totalDirectors) * 100);

  if (count < 3) return null;

  const allText = Object.values(responses).join(" ").toLowerCase();

  const agreements = [
    allText.includes("regulat") && "Regulatory compliance is non-negotiable in both Australia and China",
    allText.includes("capital") && "Capital planning must account for hidden costs and compliance overhead",
    allText.includes("market") && "Deep market research before committing capital is essential",
    allText.includes("digital") || allText.includes("tech") ? "Digital/tech leverage provides significant competitive advantage" : null,
    allText.includes("partner") || allText.includes("network") ? "Strategic partnerships accelerate market entry" : null,
    allText.includes("china") && "China requires localisation, a trusted local partner, and IP protection from day one",
    allText.includes("australia") && "Australia's small market (26M) demands export or cross-border strategy for scale",
  ].filter(Boolean) as string[];

  const disagreements = [
    "Risk tolerance: some directors favour bold early entry; The Opposer urges stress-testing assumptions first",
    "Capital approach: some advocate bootstrapping; others recommend raising external capital early",
    "China strategy: JV vs WFOE vs cross-border e-commerce — directors differ on optimal entry mode",
  ];

  const nextSteps = [
    "Register your business in Australia (ASIC/ABN) or set up WFOE/JV in China — do not operate informally",
    "Validate demand: sell before you build — find 5 paying customers first",
    "Map regulatory requirements specific to your sector (ask The Opposer's questions before proceeding)",
    "Build your AU-China network: join AustCham, ACBC, and your relevant industry association",
    "Model your financials at 3× the capital you think you need — most businesses underestimate costs by 50%+",
  ];

  return (
    <div
      className="rounded-2xl p-6 mt-6 animate-fade-in-up"
      style={{
        background: "linear-gradient(135deg, #0c0c18 0%, #101020 100%)",
        border: "1px solid #3b3b6a",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl" style={{ background: "#3b3b6a33" }}>
          <Users size={20} style={{ color: "#8888ff" }} />
        </div>
        <div>
          <h2 className="font-bold text-lg" style={{ color: "#e2e2f0" }}>Board Consensus</h2>
          <p className="text-xs" style={{ color: "#7777aa" }}>
            {count}/{totalDirectors} directors responded ({pct}%)
          </p>
        </div>
        {/* Progress bar */}
        <div className="ml-auto flex-shrink-0 w-24">
          <div className="h-1.5 rounded-full" style={{ background: "#252540" }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Agreements */}
        <div className="rounded-xl p-4" style={{ background: "#0a1a0a", border: "1px solid #1a4a1a" }}>
          <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#4ade80" }}>
            <CheckCircle size={14} /> Areas of Agreement
          </h3>
          <ul className="space-y-2">
            {agreements.slice(0, 4).map((a, i) => (
              <li key={i} className="text-xs flex gap-2" style={{ color: "#86efac" }}>
                <span style={{ color: "#4ade80", flexShrink: 0 }}>•</span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Disagreements */}
        <div className="rounded-xl p-4" style={{ background: "#1a0a0a", border: "1px solid #4a1a1a" }}>
          <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#f87171" }}>
            <XCircle size={14} /> Key Tensions
          </h3>
          <ul className="space-y-2">
            {disagreements.map((d, i) => (
              <li key={i} className="text-xs flex gap-2" style={{ color: "#fca5a5" }}>
                <span style={{ color: "#f87171", flexShrink: 0 }}>•</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="rounded-xl p-4" style={{ background: "#0a0f1a", border: "1px solid #1a2a4a" }}>
          <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#60a5fa" }}>
            <ArrowRight size={14} /> Board-Recommended Next Steps
          </h3>
          <ol className="space-y-2">
            {nextSteps.map((s, i) => (
              <li key={i} className="text-xs flex gap-2" style={{ color: "#93c5fd" }}>
                <span style={{ color: "#60a5fa", flexShrink: 0 }}>{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
