"use client";

import { useState } from "react";

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
    <div
      style={{
        background: "var(--panel)",
        border: `1px solid ${allDone ? "rgba(65,194,129,0.25)" : "var(--line)"}`,
        borderRadius: "10px",
        padding: "16px",
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>{allDone ? "✓" : "↺"}</span>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--tx)" }}>
              Daily repurpose ritual
            </div>
            <div style={{ fontSize: "10px", color: "var(--tx-3)", marginTop: "1px" }}>
              Resets at midnight
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: "10px",
            color: allDone ? "var(--slack)" : "var(--tx-3)",
            fontFamily: '"Geist Mono", ui-monospace',
          }}
        >
          {done.size} / 3 complete
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {ITEMS.map((item) => {
          const checked = done.has(item.key);
          return (
            <div
              key={item.key}
              onClick={() => toggle(item.key)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "7px",
                border: `1px solid ${checked ? "var(--accent-line)" : "var(--line)"}`,
                background: checked ? "var(--accent-tint)" : "var(--panel-2)",
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "3px",
                  border: `1px solid ${checked ? "var(--accent)" : "var(--line-2)"}`,
                  background: checked ? "var(--accent)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                  transition: "background 0.15s",
                }}
              >
                {checked && (
                  <span style={{ fontSize: "9px", color: "#fff", lineHeight: 1 }}>✓</span>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: checked ? "var(--tx-2)" : "var(--tx)",
                    lineHeight: 1.3,
                    textDecoration: checked ? "line-through" : "none",
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: "10px", color: "var(--tx-3)", marginTop: "2px" }}>
                  {item.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {allDone && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            borderRadius: "6px",
            background: "rgba(65,194,129,0.08)",
            fontSize: "11px",
            color: "var(--slack)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ✓ Done today — ritual complete. See you tomorrow.
        </div>
      )}
    </div>
  );
}
