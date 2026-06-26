"use client";

import { Director } from "@/lib/directors";
import { AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  director: Director;
  response: string | null;
  loading: boolean;
  index: number;
}

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3Ch4M6H25WVlp2HD1Qf0bakU3iW/";

const AVATAR_URLS: Record<string, string> = {
  dangote_aliko:    CDN + "hf_20260625_140716_cd57721e-0d59-4a03-9e18-11aa93d50bd8.png",
  elumelu_tony:     CDN + "hf_20260625_141022_0503ea47-0cf7-40e8-af98-55b452856fe1.png",
  ovia_jim:         CDN + "hf_20260625_141215_9cf022e1-3d5d-4ed7-94c5-303f7709c379.png",
  rabiu_abdulsamad: CDN + "hf_20260625_141215_9cf022e1-3d5d-4ed7-94c5-303f7709c379.png",
  maduka_cosmas:    CDN + "hf_20260625_141022_0503ea47-0cf7-40e8-af98-55b452856fe1.png",
  rinehart_gina:    CDN + "hf_20260625_141004_33af287a-a0cf-47ba-9237-4b3e86f35b38.png",
  lowy_frank:       CDN + "hf_20260625_141043_ee472a17-9427-44be-a143-793ae1b378d1.png",
  musk_elon:        CDN + "hf_20260625_140739_aff54c78-37ad-4421-8243-2bccc6e2f39f.png",
  gates_bill:       CDN + "hf_20260625_140854_b146b7d2-5e61-4159-b78a-a7b0db70eb88.png",
  nadella_satya:    CDN + "hf_20260625_141013_7dd5bba2-807f-4c6b-8c84-cd17a1c8cd0d.png",
  arnault_bernard:  CDN + "hf_20260625_141007_c556dcb5-97bc-4b44-aa67-fdab41fe302d.png",
  branson_richard:  CDN + "hf_20260625_141010_6c869faa-9850-4e18-8f1b-a7530f3ef3d4.png",
  murthy_narayana:  CDN + "hf_20260625_141027_2f7951e5-733b-467e-9399-71f1dd6dccb3.png",
  ma_jack:          CDN + "hf_20260625_141000_7bbc3ea3-5fd9-4bab-b7b6-36ba7f551d4d.png",
  ambani_mukesh:    CDN + "hf_20260625_141016_13677985-f31a-4182-bd31-e9d3d02c9e4c.png",
  lemann_jorge:     CDN + "hf_20260625_141047_c2f5638c-85d5-41d2-acb0-4088e2ecb012.png",
  sawiris_naguib:   CDN + "hf_20260625_141118_2262534d-831f-44fc-8b42-1012a2f68a06.png",
  the_opposer:      CDN + "hf_20260625_141158_f9f2dd7a-100c-422f-9516-9effb6e4198d.png",
};

const CDN_V = CDN;

const VIDEO_URLS: Record<string, string> = {
  musk_elon:       CDN_V + "hf_20260625_141410_ab694085-4759-446a-a695-7c3de41297d7.mp4",
  gates_bill:      CDN_V + "hf_20260625_141429_d102cec3-1050-45cd-8aa8-3e7460f90c4f.mp4",
  ma_jack:         CDN_V + "hf_20260625_141435_0ea0f177-d3ec-426f-b0c9-af51b259abab.mp4",
  rinehart_gina:   CDN_V + "hf_20260625_141438_b65a685f-2df0-4775-9767-0175e73c5626.mp4",
  the_opposer:     CDN_V + "hf_20260625_141450_a7e73404-1f01-47a2-b1fb-35490b2f8f21.mp4",
  dangote_aliko:   CDN_V + "hf_20260625_141454_38c14b56-81a3-4017-844b-57acef3838f5.mp4",
  arnault_bernard: CDN_V + "hf_20260625_141539_606b0418-7fb0-4644-bed7-a22d8ea1a69a.mp4",
  branson_richard: CDN_V + "hf_20260625_141543_d2abbf5e-536c-43de-a632-9b46acf2acf0.mp4",
  nadella_satya:   CDN_V + "hf_20260625_141629_3863e171-f1b0-4008-955e-8a68eb0bf464.mp4",
  ambani_mukesh:   CDN_V + "hf_20260625_141634_7248acbd-ea84-4d8d-9bc0-788fb4ac62b5.mp4",
  murthy_narayana: CDN_V + "hf_20260625_141648_13a5d65e-32f1-44c2-a96b-8e49613f9883.mp4",
  elumelu_tony:    CDN_V + "hf_20260625_141702_c6f41335-b25f-44c0-a47f-3db57062b9ca.mp4",
};

export default function DirectorCard({ director, response, loading, index }: Props) {
  const avatarUrl = AVATAR_URLS[director.id];
  const videoUrl = VIDEO_URLS[director.id];
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
          {videoUrl ? (
            <video autoPlay loop muted playsInline className="w-full h-full object-cover object-top" src={videoUrl} />
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt={director.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">{director.emoji}</div>
          )}
          {loading && (
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${borderColor}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }}
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
          <p className="text-xs truncate" style={{ color: "#7777aa" }}>{director.company}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {director.expertise.slice(0, 2).map((e) => (
              <span key={e} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${borderColor}22`, color: borderColor, fontSize: "10px" }}>
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
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${borderColor}22`, color: borderColor }}>✓</span>
          ) : (
            <span className="text-xs" style={{ color: "#444466" }}>Waiting</span>
          )}
        </div>
      </div>

      {/* Philosophy teaser (before response) */}
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
    </div>
  );
}
