import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function getDirectorResponse(
  systemPrompt: string,
  question: string,
  previousResponses?: string
): Promise<string> {
  const userMessage = previousResponses
    ? `Business question: ${question}\n\n---\nPrevious directors have said:\n${previousResponses}\n\nNow give YOUR critical analysis, referencing what others said where relevant.`
    : `Business question: ${question}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: userMessage }],
    system: systemPrompt,
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}
