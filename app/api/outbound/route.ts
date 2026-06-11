import { NextResponse } from "next/server";
import { fetchOutboundStats } from "@/lib/heyreach";

export async function GET() {
  try {
    const stats = await fetchOutboundStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("HeyReach error:", err);
    return NextResponse.json(
      { activeSequences: 0, totalSequences: 0, error: "HeyReach unavailable" }
    );
  }
}
