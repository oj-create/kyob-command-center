import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type PanelDef = { area: string; label: string; description: string };

function loadRegistry(): PanelDef[] {
  try {
    const raw = readFileSync(join(process.cwd(), "panel-registry.json"), "utf8");
    return JSON.parse(raw) as PanelDef[];
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const { title } = (await request.json()) as { title?: string };
  if (!title?.trim()) {
    return NextResponse.json({ area: "general" });
  }

  const panels = loadRegistry();
  if (panels.length === 0) {
    return NextResponse.json({ area: "general" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ area: "general" });
  }

  const panelList = panels
    .map((p) => `- "${p.area}" (${p.label}): ${p.description}`)
    .join("\n");

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 64,
      messages: [
        {
          role: "user",
          content: `You are a task router. Given a task title, decide which panel it belongs to.

Available panels:
${panelList}

If the task does not clearly belong to any panel above, return "general".

Task: "${title.trim()}"

Reply with ONLY the area string (one of: ${panels.map((p) => `"${p.area}"`).join(", ")}, or "general"). No explanation.`,
        },
      ],
    });

    const raw = (message.content[0].type === "text" ? message.content[0].text : "").trim().replace(/"/g, "");
    const validAreas = ["general", ...panels.map((p) => p.area)];
    const area = validAreas.includes(raw) ? raw : "general";

    return NextResponse.json({ area });
  } catch {
    return NextResponse.json({ area: "general" });
  }
}
