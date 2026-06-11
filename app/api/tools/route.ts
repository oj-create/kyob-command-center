import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import registry from "@/tools-registry.json";

export async function GET() {
  try {
    const runs = await db.toolRun.findMany({
      orderBy: { launchedAt: "desc" },
    });

    const lastRunMap: Record<string, Date> = {};
    for (const run of runs) {
      if (!lastRunMap[run.toolName]) {
        lastRunMap[run.toolName] = run.launchedAt;
      }
    }

    const tools = registry.map((tool) => ({
      ...tool,
      lastRun: lastRunMap[tool.name] ?? null,
    }));

    return NextResponse.json(tools);
  } catch (err) {
    console.error("Tools DB error:", err);
    return NextResponse.json(
      registry.map((tool) => ({ ...tool, lastRun: null }))
    );
  }
}
