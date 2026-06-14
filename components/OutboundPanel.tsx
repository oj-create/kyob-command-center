"use client";

import { Send } from "lucide-react";

export default function OutboundPanel() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="sec-ico"><Send /></span>
        <span className="panel-title">Outbound</span>
        <span className="panel-sub">daily check-in</span>
      </div>

      <div className="outbound">
        <div className="ob-card">
          <div className="ob-day">Daily · {today}</div>
          <div className="ob-title">Check HeyReach — respond to open messages</div>
          <div className="ob-sub">Follow-ups go stale fast. Clear the inbox before deep work.</div>
          <a
            className="ob-link"
            href="https://app.heyreach.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            ↗ Open HeyReach
          </a>
        </div>
      </div>
    </div>
  );
}
