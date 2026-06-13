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
  createdAt: string;
  meetingId?: string | null;
  notes?: string | null;
};

export default function TodaySection() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
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

  return (
    <div className="flex flex-col gap-3">
      <QuickLog onTaskAdded={fetchTasks} />
      {tasks.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-2">No tasks today</p>
      ) : (
        tasks.map((task) => (
          <TaskItem key={task.id} task={task} onComplete={handleComplete} />
        ))
      )}
    </div>
  );
}
