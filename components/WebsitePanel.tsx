"use client";

import { useEffect, useState, useCallback } from "react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string | null;
};

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

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        source: "manual",
        area: "website",
        priority: isBlocking ? "blocking" : "normal",
      }),
    });

    if (!res.ok) return;

    setNewTitle("");
    setIsBlocking(false);
    fetchTasks();
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

      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add website task..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
        />
        <button
          type="button"
          onClick={() => setIsBlocking((b) => !b)}
          className={`text-xs px-2 py-1.5 rounded border transition-colors ${
            isBlocking
              ? "bg-red-500/20 border-red-500/40 text-red-300"
              : "border-white/10 text-white/30 hover:border-white/30"
          }`}
        >
          blocking
        </button>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-3 py-1.5 rounded transition-colors"
        >
          Add
        </button>
      </form>

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
