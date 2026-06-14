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

    if (value.trim().length < 60) {
      await saveTask(value.trim());
      setValue("");
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
          <span style={{ fontSize: "10px", color: "var(--tx-3)", marginLeft: "2px" }}>· confirm</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "8px" }}>
          {extractedTasks.map((task, i) => (
            <div
              key={i}
              onClick={() => toggleTask(i)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                cursor: "pointer",
                padding: "4px 0",
              }}
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
                  transition: "background 0.15s",
                }}
              >
                {selectedTasks.has(i) && (
                  <span style={{ fontSize: "8px", color: "#fff" }}>✓</span>
                )}
              </div>
              <span style={{ fontSize: "11px", color: "var(--tx-2)", lineHeight: 1.4 }}>{task}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={confirmTasks}
            disabled={saving || selectedTasks.size === 0}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: "6px",
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 500,
              cursor: saving || selectedTasks.size === 0 ? "not-allowed" : "pointer",
              opacity: saving || selectedTasks.size === 0 ? 0.4 : 1,
              transition: "background 0.15s",
            }}
          >
            {saving
              ? "Saving..."
              : `Add ${selectedTasks.size} task${selectedTasks.size !== 1 ? "s" : ""}`}
          </button>
          <button
            onClick={cancelPreview}
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
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ position: "relative" }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          extractState === "extracting" ? "Extracting tasks..." : "+ Quick log a task..."
        }
        disabled={extractState === "extracting"}
        style={{
          width: "100%",
          background: "var(--panel-2)",
          border: "1px solid var(--line)",
          borderRadius: "7px",
          padding: "7px 60px 7px 10px",
          fontSize: "11px",
          color: "var(--tx-2)",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-line)"; }}
        onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
      />
      {value.length > 0 && extractState === "idle" && (
        <button
          type="submit"
          style={{
            position: "absolute",
            right: "6px",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "3px 8px",
            borderRadius: "4px",
            background: "var(--accent-tint)",
            border: "1px solid var(--accent-line)",
            color: "var(--accent-bright)",
            fontSize: "10px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {value.length >= 60 ? "Extract" : "Add"}
        </button>
      )}
    </form>
  );
}
