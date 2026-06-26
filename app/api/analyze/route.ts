import { NextRequest, NextResponse } from "next/server";
import { DIRECTORS } from "@/lib/directors";
import { getDirectorResponse } from "@/lib/anthropic";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { question, directorId, previousResponses } = await req.json();

  if (!question || !directorId) {
    return NextResponse.json({ error: "Missing question or directorId" }, { status: 400 });
  }

  const director = DIRECTORS.find((d) => d.id === directorId);
  if (!director) {
    return NextResponse.json({ error: `Director not found: ${directorId}` }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set in Vercel environment variables. Go to Vercel → Project Settings → Environment Variables and add it." }, { status: 500 });
  }

  try {
    const response = await getDirectorResponse(director.systemPrompt, question, previousResponses);
    return NextResponse.json({ directorId, response });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Director response error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
