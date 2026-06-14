"use client";

import { useState } from "react";
import { Plus, Sparkles, Check } from "lucide-react";

type Props = { onTaskAdded: () => void };
type ExtractState = "idle" | "extracting" | "preview";

export default function QuickLog({ onTaskAdded }: Props) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(false);
  const [extractState, setExtractState] = useState<ExtractState>("idle");
  const [extractedTasks, setExtractedTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!value.trim()) return;

    if (value.trim().length < 60) {
      await saveTask(value.trim());
      setValue("");
      setActive(false);
      onTaskAdded();
      return;
    }

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
        await saveTask(tasks[0]);
        setValue("");
        setActive(false);
        setExtractState("idle");
        onTaskAdded();
      } else {
        setExtractedTasks(tasks);
        setSelectedTasks(new Set(tasks.map((_, i) => i)));
        setExtractState("preview");
      }
    } catch {
      await saveTask(value.trim());
      setValue("");
      setActive(false);
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
    setActive(false);
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

  const isExtracting = extractState === "extracting";

  return (
    <div className="quicklog">
      <div
        className={`ql-input${active ? " is-active" : ""}`}
        onClick={() => setActive(true)}
      >
        <Plus />
        <input
          className="ql-field"
          placeholder={isExtracting ? "Extracting tasks…" : "+ Quick log a task…"}
          value={value}
          disabled={isExtracting}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setActive(true)}
          onBlur={() => { if (!value) setActive(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        />
        {active && value.length > 0 && !isExtracting && (
          <button
            className="btn btn-sm btn-ghost"
            style={{ padding: "4px 10px", minHeight: "auto", fontSize: 11 }}
            onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
          >
            {value.length >= 60 ? "Extract" : "Add"}
          </button>
        )}
      </div>
      {!active && (
        <div className="ql-hint">short → 1 task · long/rambling → AI splits into many</div>
      )}

      {extractState === "preview" && (
        <div className="ql-preview">
          <div className="ql-prev-head">
            <Sparkles className="ql-spark" />
            <b>Found {extractedTasks.length} tasks</b>
            <span className="mono" style={{ color: "var(--tx-3)", fontSize: 10 }}>· confirm</span>
          </div>
          {extractedTasks.map((t, i) => (
            <div
              key={i}
              className="ql-prev-item"
              onClick={() => toggleTask(i)}
            >
              <span className={`ql-prev-check${selectedTasks.has(i) ? " on" : ""}`}>
                {selectedTasks.has(i) && <Check />}
              </span>
              <span className="ql-prev-txt">{t}</span>
            </div>
          ))}
          <div className="ql-prev-actions">
            <button
              className="btn btn-sm btn-primary"
              disabled={saving || selectedTasks.size === 0}
              onClick={confirmTasks}
            >
              Add {selectedTasks.size} task{selectedTasks.size !== 1 ? "s" : ""}
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => { setExtractedTasks([]); setSelectedTasks(new Set()); setExtractState("idle"); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
