type Campaign = { status: string; id: string; [key: string]: unknown };

export type OutboundStats = {
  activeSequences: number;
  totalSequences: number;
};

export function parseOutboundStats(campaigns: Campaign[]): OutboundStats {
  return {
    activeSequences: campaigns.filter((c) => c.status === "ACTIVE").length,
    totalSequences: campaigns.length,
  };
}

export async function fetchOutboundStats(): Promise<OutboundStats> {
  const apiKey = process.env.HEYREACH_API_KEY;
  if (!apiKey) {
    return { activeSequences: 0, totalSequences: 0 };
  }

  const res = await fetch("https://api.heyreach.io/api/public/v2/campaign/GetAllCampaigns", {
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`HeyReach API error: ${res.status}`);
  }

  const data = await res.json();
  const campaigns: Campaign[] = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
  return parseOutboundStats(campaigns);
}
