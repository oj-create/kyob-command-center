"use client";

import { useEffect, useState } from "react";

type OutboundStats = {
  activeSequences: number;
  totalSequences: number;
  error?: string;
};

export default function OutboundPanel() {
  const [stats, setStats] = useState<OutboundStats | null>(null);

  useEffect(() => {
    fetch("/api/outbound")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="rounded-xl bg-[#1e1e35] border border-white/10 p-5">
      <p className="text-xs text-purple-400 uppercase tracking-widest mb-3">Outbound</p>
      {!stats ? (
        <p className="text-white/40 text-sm">Loading...</p>
      ) : stats.error ? (
        <p className="text-white/30 text-sm">HeyReach unavailable</p>
      ) : (
        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold text-white">{stats.activeSequences}</p>
            <p className="text-xs text-white/40">active sequences</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.totalSequences}</p>
            <p className="text-xs text-white/40">total sequences</p>
          </div>
        </div>
      )}
      <a
        href="https://app.heyreach.io"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-xs text-purple-400 hover:text-purple-300"
      >
        Open HeyReach →
      </a>
    </div>
  );
}
