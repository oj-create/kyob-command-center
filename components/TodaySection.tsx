"use client";

import { useEffect, useState, useCallback } from "react";
import { ListChecks } from "lucide-react";
import TaskItem from "./TaskItem";
import QuickLog from "./QuickLog";

type Task = {
  id: string;
  title: string;
  source: string;
  area: string;
  status: string;
  priority?: string | null;
  createdAt: string;
  meetingId?: string | null;
  notes?: string | null;
};

const TOTAL_TARGET = 8;

export default function TodaySection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [doneToday, setDoneToday] = useState(0);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks?area=general");
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function handleComplete(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDoneToday((n) => n + 1);
  }

  const blockingCount = tasks.filter((t) => t.priority === "blocking").length;
  const overdueCount = tasks.filter((t) => {
    const age = Date.now() - new Date(t.createdAt).getTime();
    return age > 86400000 * 2;
  }).length;
  const total = Math.max(TOTAL_TARGET, tasks.length + doneToday);
  const pct = total > 0 ? Math.min(100, Math.round((doneToday / total) * 100)) : 0;

  return (
    <div className="panel tasks-panel">
      <div className="panel-head">
        <span className="sec-ico"><ListChecks /></span>
        <span className="panel-title">Tasks</span>
        <span className="panel-sub">{tasks.length} open · never auto-deletes</span>
      </div>

      <div className="tasks-progress">
        <div className="progress-row">
          <span className="progress-num"><b>{doneToday}</b> of {total} done today</span>
          <span className="progress-num">{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-meta">
          <span className="chip-stat">
            <span className="chip-dot warn" />{overdueCount} overdue
          </span>
          <span className="chip-stat">
            <span className="chip-dot danger" />{blockingCount} blocking
          </span>
        </div>
      </div>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="task-empty">
            <div style={{ fontSize: 22, marginBottom: 9, color: "var(--accent-bright)" }}>☕</div>
            <div className="task-empty-t">Inbox zero</div>
            <div className="task-empty-s">
              No open tasks. New ones from Fathom &amp; Slack land here automatically.
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} onComplete={handleComplete} />
          ))
        )}
      </div>

      <QuickLog onTaskAdded={fetchTasks} />
    </div>
  );
}
