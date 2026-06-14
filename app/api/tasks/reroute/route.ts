import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Area } from "@prisma/client";

// Called after a task is explicitly added to a specific panel.
// Checks all existing "general" open tasks and re-classifies them
// to see if any now fit the target area.
export async function POST(request: NextRequest) {
  const { area } = (await request.json()) as { area?: string };
  if (!area || area === "general") {
    return NextResponse.json({ rerouted: 0 });
  }

  const generalTasks = await db.task.findMany({
    where: { area: "general" as Area, status: "open" },
  });

  if (generalTasks.length === 0) {
    return NextResponse.json({ rerouted: 0 });
  }

  const rerouted: string[] = [];

  for (const task of generalTasks) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/classify-task`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: task.title }),
        }
      );
      const { area: classified } = (await res.json()) as { area: string };
      if (classified === area) {
        await db.task.update({
          where: { id: task.id },
          data: { area: area as Area },
        });
        rerouted.push(task.id);
      }
    } catch {
      // skip this task on error
    }
  }

  return NextResponse.json({ rerouted: rerouted.length, ids: rerouted });
}
