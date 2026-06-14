"use client";

import { useEffect, useState, useCallback } from "react";
import { Globe, AlertTriangle } from "lucide-react";

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
    <div className={`wt${isBlocking ? " blocking" : ""}${isDone ? " done" : ""}`}>
      <button
        style={{
          flexShrink: 0, width: 16, height: 16, marginTop: 3,
          borderRadius: 5, border: `1.5px solid ${isDone ? "var(--accent)" : "var(--line-3)"}`,
          background: isDone ? "var(--accent)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 9, transition: "0.12s",
        }}
        onClick={() => onToggle(task.id, task.status)}
        aria-label={isDone ? "Reopen task" : "Complete task"}
      >
        {isDone && "✓"}
      </button>
      <div className="wt-body">
        <div className="wt-title" style={{ opacity: isDone ? 0.45 : 1, textDecoration: isDone ? "line-through" : "none" }}>
          {task.title}
        </div>
        <div className="wt-meta">
          <span className="wt-status">{task.status}</span>
          {isBlocking && <span className="wt-block">Blocking</span>}
        </div>
      </div>
    </div>
  );
}

export default function WebsitePanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  const [logActive, setLogActive] = useState(false);
  const [extractState, setExtractState] = useState<ExtractState>("idle");
  const [extractedTasks, setExtractedTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks?area=website&all=true");
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch {}
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
    // fire-and-forget: reclassify any general tasks that now match "website"
    fetch("/api/tasks/reroute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area: "website" }),
    }).catch(() => {});
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (newTitle.trim().length < 60) {
      await saveTask(newTitle.trim());
      setNewTitle("");
      setIsBlocking(false);
      setLogActive(false);
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
        setLogActive(false);
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
      setLogActive(false);
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
    <div className="panel">
      <div className="panel-head">
        <span className="sec-ico"><Globe /></span>
        <span className="panel-title">Website</span>
        <span className="panel-sub">
          quely.com
          {blocking.length > 0 && (
            <span className="panel-alert">
              <AlertTriangle /> {blocking.length} blocking
            </span>
          )}
        </span>
      </div>

      <div className="panel-scroll">
        {[...blocking, ...normal].map((task) => (
          <TaskRow key={task.id} task={task} onToggle={toggleDone} />
        ))}
        {done.length > 0 && (
          <details className="wt-done-group">
            <summary>{done.length} completed</summary>
            {done.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleDone} />
            ))}
          </details>
        )}
        {blocking.length === 0 && normal.length === 0 && done.length === 0 && (
          <div className="panel-empty">No website tasks yet</div>
        )}
      </div>

      {extractState === "preview" ? (
        <div className="ql-preview" style={{ margin: "0 12px 12px" }}>
          <div className="ql-prev-head">
            <b>Found {extractedTasks.length} tasks</b>
          </div>
          {extractedTasks.map((t, i) => (
            <div key={i} className="ql-prev-item" onClick={() => toggleExtractedTask(i)}>
              <span className={`ql-prev-check${selectedTasks.has(i) ? " on" : ""}`}>
                {selectedTasks.has(i) && <span>✓</span>}
              </span>
              <span className="ql-prev-txt">{t}</span>
            </div>
          ))}
          <div className="ql-prev-actions">
            <button
              className="btn btn-primary"
              disabled={saving || selectedTasks.size === 0}
              onClick={confirmExtractedTasks}
            >
              {saving ? "Saving..." : `Add ${selectedTasks.size} task${selectedTasks.size !== 1 ? "s" : ""}`}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => { setExtractedTasks([]); setSelectedTasks(new Set()); setExtractState("idle"); }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <form className="wt-log" onSubmit={addTask}>
          <div className={`wt-log-input${logActive ? " is-active" : ""}`} onClick={() => setLogActive(true)}>
            <input
              className="wt-log-field"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onFocus={() => setLogActive(true)}
              onBlur={() => { if (!newTitle) setLogActive(false); }}
              placeholder={extractState === "extracting" ? "Extracting tasks…" : "+ website task…"}
              disabled={extractState === "extracting"}
            />
          </div>
          {logActive && (
            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{
                  padding: "5px 10px", fontSize: "10px",
                  borderColor: isBlocking ? "rgba(236,106,82,0.45)" : undefined,
                  color: isBlocking ? "var(--danger)" : undefined,
                  background: isBlocking ? "var(--danger-tint)" : undefined,
                }}
                onClick={() => setIsBlocking((b) => !b)}
              >
                blocking
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={extractState === "extracting"}>
                Add
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
