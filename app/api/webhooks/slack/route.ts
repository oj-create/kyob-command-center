import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractSlackTask } from "@/lib/webhooks";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const extracted = extractSlackTask(payload as { text?: string; message?: string });

  if (!extracted) {
    return NextResponse.json({ error: "no text" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const task = await db.task.create({
    data: {
      title: extracted.title,
      source: "slack" as const,
      area: "general" as const,
      dueDate: today,
    },
  });

  return NextResponse.json({ created: 1, id: task.id });
}
