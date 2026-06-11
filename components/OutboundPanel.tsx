"use client";

export default function OutboundPanel() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-xl bg-[#1e1e35] border border-white/10 p-5">
      <p className="text-xs text-purple-400 uppercase tracking-widest mb-3">Outbound</p>
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-white/80">Check HeyReach — respond to open messages</p>
          <p className="text-xs text-white/30 mt-0.5">{today}</p>
        </div>
      </div>
      <a
        href="https://app.heyreach.io"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-xs text-purple-400 hover:text-purple-300 transition-colors"
      >
        Open HeyReach →
      </a>
    </div>
  );
}
