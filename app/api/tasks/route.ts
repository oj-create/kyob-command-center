import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Area, Source, Priority } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") as Area | null;
  const all = searchParams.get("all") === "true";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await db.task.findMany({
    where: {
      ...(area ? { area } : {}),
      ...(!all ? { status: "open", dueDate: { gte: today, lt: tomorrow } } : {}),
    },
    orderBy: [
      { priority: "desc" },
      { source: "asc" },
      { createdAt: "asc" },
    ],
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, area, source, meetingId, priority } = body as {
    title: string;
    area?: Area;
    source: Source;
    meetingId?: string;
    priority?: Priority;
  };

  if (!title || !source) {
    return NextResponse.json({ error: "title and source required" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const task = await db.task.create({
    data: {
      title,
      area: area ?? "general",
      source,
      dueDate: today,
      meetingId,
      ...(priority ? { priority } : {}),
    },
  });

  return NextResponse.json(task, { status: 201 });
}
