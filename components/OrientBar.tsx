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
  const [overdueCount, setOverdueCount] = useState<number | null>(null);
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);
  const [repurposeDone, setRepurposeDone] = useState(0);
  const [doneToday, setDoneToday] = useState(0);

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
      .then((data) => {
        if (Array.isArray(data)) {
          setTaskCount(data.length);
          const overdue = data.filter((t: { createdAt: string }) => {
            const age = Date.now() - new Date(t.createdAt).getTime();
            return age > 86400000 * 2;
          }).length;
          setOverdueCount(overdue);
        }
      })
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

  return (
    <div className="orient">
      <div>
        <div className="orient-day">{dayLabel} · Week {weekNum}</div>
        <div className="orient-date">{dateLabel}</div>
        <div className="orient-status">
          Day in progress
          {taskCount !== null
            ? ` — ${taskCount} task${taskCount !== 1 ? "s" : ""} open`
            : ""}
          {overdueCount ? `, ` : ""}
          {overdueCount ? <b>{overdueCount} overdue</b> : null}
          . HeyReach not checked yet.
        </div>
      </div>
      <div className="momentum">
        <div className="mo accent">
          <div className="mo-num">{doneToday}<small> / 8</small></div>
          <div className="mo-lbl">Tasks done</div>
        </div>
        <div className="mo">
          <div className="mo-num">{overdueCount ?? "—"}</div>
          <div className="mo-lbl">Overdue</div>
        </div>
        <div className="mo">
          <div className="mo-num">{scheduledCount ?? "—"}</div>
          <div className="mo-lbl">Posts queued</div>
        </div>
        <div className="mo">
          <div className="mo-num">{repurposeDone}<small> / 3</small></div>
          <div className="mo-lbl">Repurpose</div>
        </div>
      </div>
    </div>
  );
}
