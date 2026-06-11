import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { text } = body as { text?: string };
  if (!text?.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Fallback: return the whole text as a single task
    return NextResponse.json({ tasks: [text.trim()] });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Extract individual tasks from this text. Return ONLY a JSON array of strings, one task per item. Each task should be concise (under 100 chars). If there is only one task, return an array with one item. Do not include any explanation, just the JSON array.

Text: "${text.trim()}"

Return format: ["task 1", "task 2", "task 3"]`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON array from response
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({ tasks: [text.trim()] });
    }

    const tasks = JSON.parse(match[0]) as string[];
    const cleaned = tasks
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10); // cap at 10 tasks

    return NextResponse.json({ tasks: cleaned });
  } catch (err) {
    console.error("Anthropic error:", err);
    // Fallback: single task
    return NextResponse.json({ tasks: [text.trim()] });
  }
}
