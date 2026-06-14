"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function TodaySection() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleComplete(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const blockingCount = tasks.filter((t) => t.priority === "blocking").length;

  return (
    <div
      style={{
        borderBottom: "1px solid var(--line)",
        paddingBottom: "4px",
      }}
    >
      {/* Zone header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 14px 10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "var(--tx-3)" }}>✓</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--tx)", letterSpacing: "0.01em" }}>
            Tasks
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {blockingCount > 0 && (
            <span
              style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "4px",
                background: "rgba(236,106,82,0.12)",
                color: "var(--danger)",
              }}
            >
              {blockingCount} blocking
            </span>
          )}
          <span
            style={{
              fontSize: "10px",
              color: "var(--tx-3)",
              fontFamily: '"Geist Mono", ui-monospace',
            }}
          >
            {tasks.length} open
          </span>
        </div>
      </div>

      {/* Task list */}
      <div style={{ padding: "0 4px", maxHeight: "360px", overflowY: "auto" }}>
        {tasks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px 16px",
              color: "var(--tx-3)",
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "6px" }}>☕</div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--tx-2)", marginBottom: "3px" }}>
              Inbox zero
            </div>
            <div style={{ fontSize: "11px", lineHeight: 1.5 }}>
              No open tasks. New ones from Fathom and Slack land here automatically.
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} onComplete={handleComplete} />
          ))
        )}
      </div>

      {/* Quick log */}
      <div style={{ padding: "8px 10px 12px" }}>
        <QuickLog onTaskAdded={fetchTasks} />
      </div>
    </div>
  );
}
