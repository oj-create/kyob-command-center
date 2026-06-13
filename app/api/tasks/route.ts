import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Area, Source, Priority } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") as Area | null;
  const includeDone = searchParams.get("done") === "true";

  const tasks = await db.task.findMany({
    where: {
      ...(area ? { area } : {}),
      ...(!includeDone ? { status: "open" } : {}),
    },
    orderBy: [
      { priority: "desc" },
      { source: "asc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, area, source, meetingId, priority, notes } = body as {
    title: string;
    area?: Area;
    source: Source;
    meetingId?: string;
    priority?: Priority;
    notes?: string;
  };

  if (!title || !source) {
    return NextResponse.json({ error: "title and source required" }, { status: 400 });
  }

  const task = await db.task.create({
    data: {
      title,
      area: area ?? "general",
      source,
      meetingId,
      notes,
      ...(priority ? { priority } : {}),
    },
  });

  return NextResponse.json(task, { status: 201 });
}
