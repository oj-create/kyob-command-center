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
  dimmed = false,
}: {
  task: Task;
  onToggle: (id: string, status: string) => void;
  dimmed?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 py-1 ${dimmed ? "opacity-40" : ""}`}>
      <button
        onClick={() => onToggle(task.id, task.status)}
        className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${
          task.status === "done"
            ? "bg-purple-500 border-purple-500"
            : "border-white/20 hover:border-purple-400"
        }`}
        aria-label={task.status === "done" ? "Reopen task" : "Complete task"}
      />
      <span
        className={`text-sm flex-1 ${
          task.status === "done"
            ? "line-through text-white/30"
            : "text-white/80"
        }`}
      >
        {task.title}
      </span>
    </div>
  );
}

export default function WebsitePanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // AI extraction state
  const [extractState, setExtractState] = useState<ExtractState>("idle");
  const [extractedTasks, setExtractedTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks?area=website&all=true");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setFetchError(data.error ?? "Failed to load tasks");
      }
    } catch {
      setFetchError("Failed to load tasks");
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

    // Short input: save directly as one task
    if (newTitle.trim().length < 60) {
      await saveTask(newTitle.trim());
      setNewTitle("");
      setIsBlocking(false);
      fetchTasks();
      return;
    }

    // Long input: extract tasks
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
        // Only one task found -- save directly
        await saveTask(extracted[0]);
        setNewTitle("");
        setIsBlocking(false);
        setExtractState("idle");
        fetchTasks();
      } else {
        // Multiple tasks -- show preview
        setExtractedTasks(extracted);
        setSelectedTasks(new Set(extracted.map((_, i) => i)));
        setExtractState("preview");
      }
    } catch {
      // Fallback: save as single task
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

  function cancelPreview() {
    setExtractedTasks([]);
    setSelectedTasks(new Set());
    setExtractState("idle");
  }

  async function toggleDone(id: string, currentStatus: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: currentStatus === "done" ? "open" : "done",
      }),
    });
    if (res.ok) fetchTasks();
  }

  const blocking = tasks.filter(
    (t) => t.priority === "blocking" && t.status === "open"
  );
  const normal = tasks.filter(
    (t) => t.priority !== "blocking" && t.status === "open"
  );
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="rounded-xl bg-[#1e1e35] border border-white/10 p-5">
      <p className="text-xs text-purple-400 uppercase tracking-widest mb-3">Website</p>

      {extractState === "preview" ? (
        <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 mb-4">
          <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-2">
            Found {extractedTasks.length} tasks
          </p>
          <div className="flex flex-col gap-1 mb-3">
            {extractedTasks.map((task, i) => (
              <label key={i} className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTasks.has(i)}
                  onChange={() => toggleExtractedTask(i)}
                  className="mt-0.5 accent-purple-500 flex-shrink-0"
                />
                <span className="text-xs text-white/80 leading-snug">{task}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={confirmExtractedTasks}
              disabled={saving || selectedTasks.size === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs py-1.5 rounded transition-colors"
            >
              {saving ? "Saving..." : `Add ${selectedTasks.size} task${selectedTasks.size !== 1 ? "s" : ""}`}
            </button>
            <button
              onClick={cancelPreview}
              className="text-xs text-white/30 hover:text-white/60 px-2"
            >
              cancel
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={addTask} className="flex gap-2 mb-4">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={extractState === "extracting" ? "Extracting tasks..." : "Add website task..."}
            disabled={extractState === "extracting"}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setIsBlocking((b) => !b)}
            disabled={extractState === "extracting"}
            className={`text-xs px-2 py-1.5 rounded border transition-colors ${
              isBlocking
                ? "bg-red-500/20 border-red-500/40 text-red-300"
                : "border-white/10 text-white/30 hover:border-white/30"
            } disabled:opacity-50`}
          >
            blocking
          </button>
          <button
            type="submit"
            disabled={extractState === "extracting"}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded transition-colors"
          >
            Add
          </button>
        </form>
      )}

      {fetchError ? (
        <p className="text-white/30 text-sm">Tasks unavailable</p>
      ) : (
        <>
          {blocking.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">
                Blocking
              </p>
              {blocking.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggleDone} />
              ))}
            </div>
          )}

          {normal.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleDone} />
          ))}

          {done.length > 0 && (
            <details className="mt-3">
              <summary className="text-[10px] text-white/30 cursor-pointer select-none">
                {done.length} completed
              </summary>
              <div className="mt-1">
                {done.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleDone}
                    dimmed
                  />
                ))}
              </div>
            </details>
          )}

          {blocking.length === 0 && normal.length === 0 && done.length === 0 && (
            <p className="text-white/30 text-sm">No website tasks yet</p>
          )}
        </>
      )}
    </div>
  );
}
