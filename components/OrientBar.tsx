"use client";

import { useEffect, useState } from "react";

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
}

export default function OrientBar() {
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);
  const [repurposeDone, setRepurposeDone] = useState(0);

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const weekNum = getWeekNumber(now);
  const dayLabel = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTaskCount(data.length); })
      .catch(() => {});

    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setScheduledCount(data.filter((p: { status: string }) => p.status === "scheduled").length);
        }
      })
      .catch(() => {});

    try {
      const saved = localStorage.getItem(`repurpose-${todayKey}`);
      if (saved) setRepurposeDone(JSON.parse(saved).length);
    } catch {}
  }, [todayKey]);

  const stats = [
    { num: taskCount ?? "—", label: "Tasks open" },
    { num: scheduledCount ?? "—", label: "Posts queued" },
    { num: `${repurposeDone}/3`, label: "Repurpose" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "24px",
        paddingBottom: "20px",
        borderBottom: "1px solid var(--line)",
        marginBottom: "4px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "10px",
            color: "var(--tx-3)",
            fontWeight: 500,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          {dayLabel} · Week {weekNum}
        </div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "var(--tx)",
            lineHeight: 1.15,
            marginBottom: "6px",
            fontFamily: '"Geist", ui-sans-serif',
          }}
        >
          {dateLabel}
        </div>
        <div style={{ fontSize: "12px", color: "var(--tx-2)", lineHeight: 1.5 }}>
          Day in progress
          {taskCount !== null
            ? ` — ${taskCount} task${taskCount !== 1 ? "s" : ""} open`
            : ""}
          . HeyReach not checked yet.
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", flexShrink: 0, alignItems: "flex-start" }}>
        {stats.map(({ num, label }, i) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: i === 0 ? "var(--accent-bright)" : "var(--tx)",
                lineHeight: 1,
                fontFamily: '"Geist Mono", ui-monospace',
              }}
            >
              {num}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--tx-3)",
                marginTop: "5px",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
