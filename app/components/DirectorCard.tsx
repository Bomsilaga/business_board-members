"use client";

import { useState } from "react";
import { Director } from "@/lib/directors";
import { ChevronDown, ChevronUp, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  director: Director;
  response: string | null;
  loading: boolean;
  index: number;
}

const AVATAR_URLS: Record<string, string> = {
  dangote_aliko: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Aliko_Dangote_2014_%28cropped%29.jpg/440px-Aliko_Dangote_2014_%28cropped%29.jpg",
  elumelu_tony: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Tony_Elumelu_%28cropped%29.jpg/440px-Tony_Elumelu_%28cropped%29.jpg",
  ovia_jim: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jim_Ovia.jpg/440px-Jim_Ovia.jpg",
  rabiu_abdulsamad: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Abdulsamad_Rabiu.jpg/440px-Abdulsamad_Rabiu.jpg",
  maduka_cosmas: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Cosmas_Maduka.jpg/440px-Cosmas_Maduka.jpg",
  rinehart_gina: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Gina_Rinehart_2013_%28cropped%29.jpg/440px-Gina_Rinehart_2013_%28cropped%29.jpg",
  lowy_frank: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Frank_Lowy_%28cropped%29.jpg/440px-Frank_Lowy_%28cropped%29.jpg",
  musk_elon: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg",
  gates_bill: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bill_Gates_2018.jpg/440px-Bill_Gates_2018.jpg",
  nadella_satya: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/440px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg",
  arnault_bernard: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bernard_Arnault_%283%29_%28cropped%29.jpg/440px-Bernard_Arnault_%283%29_%28cropped%29.jpg",
  branson_richard: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Richard_Branson_Space_Shuttle_cropped.jpg/440px-Richard_Branson_Space_Shuttle_cropped.jpg",
  murthy_narayana: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/N._R._Narayana_Murthy_at_IIT_Bombay_Techfest.jpg/440px-N._R._Narayana_Murthy_at_IIT_Bombay_Techfest.jpg",
  ma_jack: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Jack_Ma_2014_Shankbone.jpg/440px-Jack_Ma_2014_Shankbone.jpg",
  ambani_mukesh: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Mukesh_Ambani.jpg/440px-Mukesh_Ambani.jpg",
  lemann_jorge: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Jorge_Paulo_Lemann.jpg/440px-Jorge_Paulo_Lemann.jpg",
  sawiris_naguib: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Naguib_Sawiris_2012_Shankbone.jpg/440px-Naguib_Sawiris_2012_Shankbone.jpg",
  the_opposer: "",
};

export default function DirectorCard({ director, response, loading, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const avatarUrl = AVATAR_URLS[director.id];
  const isOpposer = director.isOpposer;

  const borderColor = isOpposer ? "#dc2626" : director.accentColor;

  return (
    <div
      className="card-hover rounded-2xl overflow-hidden animate-fade-in-up"
      style={{
        animationDelay: `${index * 40}ms`,
        background: isOpposer
          ? "linear-gradient(135deg, #1a0505 0%, #120000 100%)"
          : "linear-gradient(135deg, #0f0f1a 0%, #12121f 100%)",
        border: `1px solid ${borderColor}33`,
        boxShadow: loading ? `0 0 20px ${borderColor}22` : undefined,
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        {/* Avatar */}
        <div
          className="relative flex-shrink-0"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: `2px solid ${borderColor}66`,
            overflow: "hidden",
            background: `${borderColor}22`,
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={director.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {director.emoji}
            </div>
          )}
          {/* Animated ring when loading */}
          {loading && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${borderColor}`,
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isOpposer && <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />}
            <p className="font-semibold text-sm truncate" style={{ color: isOpposer ? "#f87171" : "#e2e2f0" }}>
              {director.name}
            </p>
          </div>
          <p className="text-xs truncate" style={{ color: "#7777aa" }}>
            {director.company}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {director.expertise.slice(0, 2).map((e) => (
              <span
                key={e}
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: `${borderColor}22`, color: borderColor, fontSize: "10px" }}
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          {loading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: borderColor }} />
          ) : response ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
              style={{ background: `${borderColor}22`, color: borderColor }}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Less" : "Read"}
            </button>
          ) : (
            <span className="text-xs" style={{ color: "#444466" }}>Waiting</span>
          )}
        </div>
      </div>

      {/* Philosophy teaser */}
      {!response && !loading && (
        <div className="px-4 pb-3">
          <p className="text-xs italic" style={{ color: "#555577" }}>&ldquo;{director.philosophy}&rdquo;</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="px-4 pb-4 space-y-2">
          <div className="shimmer h-3 rounded w-full" />
          <div className="shimmer h-3 rounded w-4/5" />
          <div className="shimmer h-3 rounded w-3/5" />
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="px-4 pb-4">
          {/* Preview */}
          <p className="text-xs leading-relaxed" style={{ color: "#aaaacc" }}>
            {expanded ? response : response.slice(0, 180) + (response.length > 180 ? "…" : "")}
          </p>
          {expanded && (
            <div
              className="mt-3 pt-3 text-xs space-y-1"
              style={{ borderTop: `1px solid ${borderColor}22`, color: "#7777aa" }}
            >
              {director.expertise.map((e) => (
                <span
                  key={e}
                  className="inline-block mr-1 mb-1 px-2 py-0.5 rounded-full"
                  style={{ background: `${borderColor}15`, color: borderColor }}
                >
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
