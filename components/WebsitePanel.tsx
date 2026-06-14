"use client";

import { useEffect, useState, useCallback } from "react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string | null;
};

type ExtractState = "idle" | "extracting" | "preview";

function TaskRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string, status: string) => void;
}) {
  const isBlocking = task.priority === "blocking";
  const isDone = task.status === "done";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        padding: "7px 12px",
        borderLeft: isBlocking ? "2px solid rgba(236,106,82,0.45)" : "2px solid transparent",
        background: isBlocking ? "rgba(236,106,82,0.04)" : "transparent",
        opacity: isDone ? 0.45 : 1,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!isBlocking) (e.currentTarget as HTMLElement).style.background = "var(--panel-2)";
      }}
      onMouseLeave={(e) => {
        if (!isBlocking) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <button
        onClick={() => onToggle(task.id, task.status)}
        style={{
          width: "13px",
          height: "13px",
          borderRadius: "3px",
          border: `1px solid ${isDone ? "var(--accent)" : "var(--line-2)"}`,
          background: isDone ? "var(--accent)" : "transparent",
          flexShrink: 0,
          cursor: "pointer",
          marginTop: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
        }}
        aria-label={isDone ? "Reopen task" : "Complete task"}
      >
        {isDone && <span style={{ fontSize: "8px", color: "#fff" }}>✓</span>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "12px",
            color: isDone ? "var(--tx-3)" : "var(--tx)",
            textDecoration: isDone ? "line-through" : "none",
            lineHeight: 1.4,
            marginBottom: "3px",
          }}
        >
          {task.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontSize: "9px",
              color: "var(--tx-3)",
              textTransform: "capitalize",
            }}
          >
            {task.status}
          </span>
          {isBlocking && (
            <span
              style={{
                fontSize: "9px",
                padding: "1px 5px",
                borderRadius: "3px",
                background: "rgba(236,106,82,0.12)",
                color: "var(--danger)",
                fontWeight: 500,
              }}
            >
              Blocking
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WebsitePanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [extractState, setExtractState] = useState<ExtractState>("idle");
  const [extractedTasks, setExtractedTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks?area=website&all=true");
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
      else setFetchError(data.error ?? "Failed to load tasks");
    } catch {
      setFetchError("Failed to load tasks");
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function saveTask(title: string) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        source: "manual",
        area: "website",
        priority: isBlocking ? "blocking" : "normal",
      }),
    });
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (newTitle.trim().length < 60) {
      await saveTask(newTitle.trim());
      setNewTitle("");
      setIsBlocking(false);
      fetchTasks();
      return;
    }

    setExtractState("extracting");
    try {
      const res = await fetch("/api/extract-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTitle.trim() }),
      });
      const data = await res.json();
      const extracted: string[] = Array.isArray(data.tasks) ? data.tasks : [newTitle.trim()];

      if (extracted.length === 1) {
        await saveTask(extracted[0]);
        setNewTitle("");
        setIsBlocking(false);
        setExtractState("idle");
        fetchTasks();
      } else {
        setExtractedTasks(extracted);
        setSelectedTasks(new Set(extracted.map((_, i) => i)));
        setExtractState("preview");
      }
    } catch {
      await saveTask(newTitle.trim());
      setNewTitle("");
      setIsBlocking(false);
      setExtractState("idle");
      fetchTasks();
    }
  }

  async function confirmExtractedTasks() {
    setSaving(true);
    const toSave = extractedTasks.filter((_, i) => selectedTasks.has(i));
    await Promise.all(toSave.map((title) => saveTask(title)));
    setNewTitle("");
    setIsBlocking(false);
    setExtractedTasks([]);
    setSelectedTasks(new Set());
    setExtractState("idle");
    setSaving(false);
    fetchTasks();
  }

  function toggleExtractedTask(i: number) {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function toggleDone(id: string, currentStatus: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: currentStatus === "done" ? "open" : "done" }),
    });
    if (res.ok) fetchTasks();
  }

  const blocking = tasks.filter((t) => t.priority === "blocking" && t.status === "open");
  const normal = tasks.filter((t) => t.priority !== "blocking" && t.status === "open");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 16px 12px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <span style={{ fontSize: "13px" }}>◎</span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--tx)", flex: 1 }}>
          Website
        </span>
        <span style={{ fontSize: "10px", color: "var(--tx-3)" }}>
          quely.com
          {blocking.length > 0 && (
            <span style={{ color: "var(--danger)", marginLeft: "6px" }}>
              · {blocking.length} blocking
            </span>
          )}
        </span>
      </div>

      {/* Task rows */}
      <div style={{ padding: "6px 0" }}>
        {fetchError ? (
          <div style={{ padding: "12px 16px", fontSize: "12px", color: "var(--tx-3)" }}>
            Tasks unavailable
          </div>
        ) : (
          <>
            {[...blocking, ...normal].map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleDone} />
            ))}
            {done.length > 0 && (
              <details style={{ padding: "0 12px" }}>
                <summary
                  style={{
                    fontSize: "10px",
                    color: "var(--tx-3)",
                    cursor: "pointer",
                    padding: "6px 0",
                    userSelect: "none",
                  }}
                >
                  {done.length} completed
                </summary>
                {done.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggleDone} />
                ))}
              </details>
            )}
            {blocking.length === 0 && normal.length === 0 && done.length === 0 && (
              <div style={{ padding: "14px 16px", fontSize: "12px", color: "var(--tx-3)" }}>
                No website tasks yet
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick log */}
      <div style={{ padding: "8px 12px 12px", borderTop: "1px solid var(--line)" }}>
        {extractState === "preview" ? (
          <div
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--accent-line)",
              borderRadius: "8px",
              padding: "10px 12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-bright)" }}>✦</span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--tx)" }}>
                Found {extractedTasks.length} tasks
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "8px" }}>
              {extractedTasks.map((task, i) => (
                <div
                  key={i}
                  onClick={() => toggleExtractedTask(i)}
                  style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}
                >
                  <div
                    style={{
                      width: "13px",
                      height: "13px",
                      borderRadius: "3px",
                      border: `1px solid ${selectedTasks.has(i) ? "var(--accent)" : "var(--line-2)"}`,
                      background: selectedTasks.has(i) ? "var(--accent)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    {selectedTasks.has(i) && <span style={{ fontSize: "8px", color: "#fff" }}>✓</span>}
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--tx-2)", lineHeight: 1.4 }}>{task}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={confirmExtractedTasks}
                disabled={saving || selectedTasks.size === 0}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "6px",
                  background: "var(--accent)",
                  border: "none",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  opacity: saving || selectedTasks.size === 0 ? 0.4 : 1,
                }}
              >
                {saving ? "Saving..." : `Add ${selectedTasks.size} task${selectedTasks.size !== 1 ? "s" : ""}`}
              </button>
              <button
                onClick={() => { setExtractedTasks([]); setSelectedTasks(new Set()); setExtractState("idle"); }}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  background: "transparent",
                  border: "1px solid var(--line-2)",
                  color: "var(--tx-3)",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={addTask} style={{ display: "flex", gap: "6px" }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={
                extractState === "extracting"
                  ? "Extracting tasks..."
                  : "+ Quick log a website task…"
              }
              disabled={extractState === "extracting"}
              style={{
                flex: 1,
                background: "var(--panel-2)",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "11px",
                color: "var(--tx-2)",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-line)"; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
            />
            <button
              type="button"
              onClick={() => setIsBlocking((b) => !b)}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: `1px solid ${isBlocking ? "rgba(236,106,82,0.45)" : "var(--line-2)"}`,
                background: isBlocking ? "rgba(236,106,82,0.12)" : "transparent",
                color: isBlocking ? "var(--danger)" : "var(--tx-3)",
                fontSize: "10px",
                cursor: "pointer",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              blocking
            </button>
            <button
              type="submit"
              disabled={extractState === "extracting"}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                background: "var(--accent)",
                border: "none",
                color: "#fff",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              Add
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
