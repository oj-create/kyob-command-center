import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { toolName } = body as { toolName?: string };

  if (!toolName) {
    return NextResponse.json({ error: "toolName required" }, { status: 400 });
  }

  try {
    await db.toolRun.create({ data: { toolName } });
    return NextResponse.json({ logged: true });
  } catch (err) {
    console.error("ToolRun DB error:", err);
    return NextResponse.json({ logged: false, error: "DB unavailable" }, { status: 503 });
  }
}
