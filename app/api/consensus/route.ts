import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { question, responses, market } = await req.json();

  if (!question || !responses) {
    return NextResponse.json({ error: "Missing question or responses" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      error: "ANTHROPIC_API_KEY is not set. Go to Vercel → Project Settings → Environment Variables and add it.",
    }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const directorSummaries = Object.entries(responses as Record<string, string>)
    .map(([id, text]) => `[${id}]: ${text}`)
    .join("\n\n---\n\n");

  const systemPrompt = `You are the Board Secretary who has received all 18 board member analyses on a business opportunity. Your job is to synthesize their input into a clear, highly actionable consensus plan.

Market focus: ${market || "Australia"}

You must respond with EXACTLY this structure (use these exact headings):

**BOARD CONSENSUS**
3-5 bullet points summarising what the majority of directors AGREE on. Be specific to this exact business.

**KEY RISKS (From The Opposer)**
3-5 bullet points capturing the most critical risks and warnings. Be specific and sharp.

**STEP-BY-STEP ACTION PLAN**
A numbered list of 12-15 concrete action steps to start and grow this business. Each step must include:
- What to do (specific action)
- How to do it (specific method, platform, or tool)
- Real URL or resource where applicable
- Estimated cost or time where relevant

Steps must flow logically from incorporation → compliance → sourcing → marketing → launch → growth.
Every step must be specific to the ${market || "Australia"} market. Name real government bodies, real platforms, real tools.

Keep the entire response under 800 words. Be direct, specific, and actionable. No vague advice.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: `Business question: ${question}\n\n--- ALL DIRECTOR ANALYSES ---\n\n${directorSummaries}`,
      }],
    });

    const block = message.content[0];
    const plan = block.type === "text" ? block.text : "";
    return NextResponse.json({ plan });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Consensus error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
