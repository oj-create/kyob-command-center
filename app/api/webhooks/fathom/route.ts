import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractFathomTasks } from "@/lib/webhooks";

const USER_NAMES = ["OJ", "Ojelola", "Ojelabi", "oj@quely.io", "Evan", "evan@quely.io", "evan@fishyvisions.com"];

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Log raw payload so we can see what Fathom actually sends
  console.log("[fathom webhook] raw payload:", JSON.stringify(payload, null, 2));

  try {
    const extracted = extractFathomTasks(payload, USER_NAMES);

    console.log("[fathom webhook] extracted tasks:", extracted.length, extracted);

    if (extracted.length === 0) {
      return NextResponse.json({ created: 0 });
    }

    await db.task.createMany({
      data: extracted.map(({ title, meetingId, notes }) => ({
        title,
        source: "fathom" as const,
        area: "general" as const,
        meetingId,
        notes,
      })),
    });

    return NextResponse.json({ created: extracted.length });
  } catch (err) {
    console.error("[fathom webhook] error:", err, "payload was:", JSON.stringify(payload));
    return NextResponse.json({ error: "handler error", created: 0 }, { status: 500 });
  }
}
