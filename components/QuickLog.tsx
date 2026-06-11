"use client";

import { useState } from "react";

type Props = {
  onTaskAdded: () => void;
};

export default function QuickLog({ onTaskAdded }: Props) {
  const [value, setValue] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: value.trim(), source: "manual" }),
    });

    setValue("");
    onTaskAdded();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="+ Quick log a task..."
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
      />
    </form>
  );
}
