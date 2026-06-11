import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Area, TaskStatus, Priority } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, area, priority } = body as {
    status?: TaskStatus;
    area?: Area;
    priority?: Priority;
  };

  const task = await db.task.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(area && { area }),
      ...(priority !== undefined && { priority }),
    },
  });

  return NextResponse.json(task);
}
