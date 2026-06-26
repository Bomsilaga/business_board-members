import { NextRequest, NextResponse } from "next/server";
import { DIRECTORS } from "@/lib/directors";
import { getDirectorResponse } from "@/lib/anthropic";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { question, directorId } = await req.json();

  if (!question || !directorId) {
    return NextResponse.json({ error: "Missing question or directorId" }, { status: 400 });
  }

  const director = DIRECTORS.find((d) => d.id === directorId);
  if (!director) {
    return NextResponse.json({ error: "Director not found" }, { status: 404 });
  }

  try {
    const response = await getDirectorResponse(director.systemPrompt, question);
    return NextResponse.json({ directorId, response });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
