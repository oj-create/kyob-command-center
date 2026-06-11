"use client";

import { useState } from "react";

type Props = {
  onTaskAdded: () => void;
};

type ExtractState = "idle" | "extracting" | "preview";

export default function QuickLog({ onTaskAdded }: Props) {
  const [value, setValue] = useState("");
  const [extractState, setExtractState] = useState<ExtractState>("idle");
  const [extractedTasks, setExtractedTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;

    // Short input: save directly as one task
    if (value.trim().length < 60) {
      await saveTask(value.trim());
      setValue("");
      onTaskAdded();
      return;
    }

    // Long input: extract tasks
    setExtractState("extracting");
    try {
      const res = await fetch("/api/extract-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value.trim() }),
      });
      const data = await res.json();
      const tasks: string[] = Array.isArray(data.tasks) ? data.tasks : [value.trim()];

      if (tasks.length === 1) {
        // Only one task found -- save directly
        await saveTask(tasks[0]);
        setValue("");
        setExtractState("idle");
        onTaskAdded();
      } else {
        // Multiple tasks -- show preview
        setExtractedTasks(tasks);
        setSelectedTasks(new Set(tasks.map((_, i) => i)));
        setExtractState("preview");
      }
    } catch {
      // Fallback: save as single task
      await saveTask(value.trim());
      setValue("");
      setExtractState("idle");
      onTaskAdded();
    }
  }

  async function saveTask(title: string) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, source: "manual" }),
    });
  }

  async function confirmTasks() {
    setSaving(true);
    const toSave = extractedTasks.filter((_, i) => selectedTasks.has(i));
    await Promise.all(toSave.map((title) => saveTask(title)));
    setValue("");
    setExtractedTasks([]);
    setSelectedTasks(new Set());
    setExtractState("idle");
    setSaving(false);
    onTaskAdded();
  }

  function toggleTask(i: number) {
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

  if (extractState === "preview") {
    return (
      <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3">
        <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-2">
          Found {extractedTasks.length} tasks
        </p>
        <div className="flex flex-col gap-1 mb-3">
          {extractedTasks.map((task, i) => (
            <label key={i} className="flex items-start gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTasks.has(i)}
                onChange={() => toggleTask(i)}
                className="mt-0.5 accent-purple-500 flex-shrink-0"
              />
              <span className="text-xs text-white/80 leading-snug">{task}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={confirmTasks}
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
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={extractState === "extracting" ? "Extracting tasks..." : "+ Quick log a task..."}
        disabled={extractState === "extracting"}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500 disabled:opacity-50"
      />
    </form>
  );
}
