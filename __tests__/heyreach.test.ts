import { parseOutboundStats } from "@/lib/heyreach";

describe("parseOutboundStats", () => {
  it("counts active campaigns", () => {
    const campaigns = [
      { status: "ACTIVE", id: "1" },
      { status: "ACTIVE", id: "2" },
      { status: "PAUSED", id: "3" },
    ];
    const stats = parseOutboundStats(campaigns);
    expect(stats.activeSequences).toBe(2);
    expect(stats.totalSequences).toBe(3);
  });

  it("handles empty array", () => {
    const stats = parseOutboundStats([]);
    expect(stats.activeSequences).toBe(0);
    expect(stats.totalSequences).toBe(0);
  });
});
