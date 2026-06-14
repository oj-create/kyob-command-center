"use client";

import { useState } from "react";
import { Repeat2, CheckCircle2, Check } from "lucide-react";

const ITEMS = [
  { key: "linkedin", title: "Engage on LinkedIn", sub: "Comments + replies" },
  { key: "atlassian", title: "Post to Atlassian Community", sub: "Repurpose today's thread" },
  { key: "youtube", title: "Post to YouTube Community", sub: "Short-form recap" },
];

export default function RepurposeRitual() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `repurpose-${todayKey}`;

  const [done, setDone] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  function toggle(key: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  const allDone = done.size === ITEMS.length;

  return (
    <div className={`ritual${allDone ? " all-done" : ""}`}>
      <div className="ritual-top">
        <span className="sec-ico">
          {allDone ? <CheckCircle2 /> : <Repeat2 />}
        </span>
        <div>
          <div className="sec-title">Daily repurpose ritual</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tx-3)", marginTop: 2 }}>
            Resets at midnight
          </div>
        </div>
        <span className="ritual-progress">{done.size} / 3 complete</span>
      </div>

      <div className="ritual-grid">
        {ITEMS.map((item) => {
          const checked = done.has(item.key);
          return (
            <div
              key={item.key}
              className={`ritual-item${checked ? " on" : ""}`}
              onClick={() => toggle(item.key)}
            >
              <span className="ritual-check">
                {checked && <Check />}
              </span>
              <div>
                <div className="ritual-item-t">{item.title}</div>
                <div className="ritual-item-s">{item.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ritual-done-banner">
        <CheckCircle2 />
        Done today — ritual complete. See you tomorrow.
      </div>
    </div>
  );
}
