import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractFathomTasks } from "@/lib/webhooks";

const USER_NAMES = ["OJ", "Evan"];

export async function POST(request: NextRequest) {
  const payload = await request.json();

  const extracted = extractFathomTasks(payload, USER_NAMES);

  if (extracted.length === 0) {
    return NextResponse.json({ created: 0 });
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  await db.task.createMany({
    data: extracted.map(({ title, meetingId }) => ({
      title,
      source: "fathom" as const,
      area: "general" as const,
      dueDate: today,
      meetingId,
    })),
  });

  return NextResponse.json({ created: extracted.length });
}
