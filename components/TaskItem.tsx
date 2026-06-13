"use client";

import { useState } from "react";

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

const SOURCE_BADGE: Record<string, string> = {
  fathom: "bg-blue-500/20 text-blue-300",
  slack: "bg-green-500/20 text-green-300",
  manual: "bg-white/10 text-white/50",
};

const AREA_BADGE: Record<string, string> = {
  outbound: "text-orange-300/60",
  content: "text-purple-300/60",
  website: "text-cyan-300/60",
  general: "text-white/30",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  task: Task;
  onComplete: (id: string) => void;
};

export default function TaskItem({ task, onComplete }: Props) {
  const [open, setOpen] = useState(false);

  const fathomUrl =
    task.source === "fathom" && task.meetingId
      ? `https://fathom.video/calls/${task.meetingId}`
      : null;

  return (
    <>
      <div className="flex items-start gap-2 group">
        <button
          onClick={() => onComplete(task.id)}
          className="mt-1 w-4 h-4 rounded border border-white/20 flex-shrink-0 hover:border-green-400 transition-colors"
          aria-label="Complete task"
        />
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setOpen(true)}
            className="text-sm text-white/75 leading-snug text-left hover:text-white transition-colors w-full"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.title}
          </button>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${SOURCE_BADGE[task.source] ?? SOURCE_BADGE.manual}`}
            >
              {task.source}
            </span>
            <span className="text-[10px] text-white/25">{timeAgo(task.createdAt)}</span>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#1a1a2e] border border-white/10 rounded-xl p-5 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${SOURCE_BADGE[task.source] ?? SOURCE_BADGE.manual}`}
                >
                  {task.source}
                </span>
                <span
                  className={`text-[10px] ${AREA_BADGE[task.area] ?? AREA_BADGE.general}`}
                >
                  {task.area}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white/70 text-xl leading-none flex-shrink-0 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Task title */}
            <p className="text-white/90 text-sm leading-relaxed mb-4">{task.title}</p>

            {/* Context / notes */}
            {task.notes && (
              <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/5">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">
                  Context
                </p>
                <p className="text-xs text-white/55 leading-relaxed">{task.notes}</p>
              </div>
            )}

            {/* Metadata row */}
            <div className="flex flex-col gap-1.5 text-[11px] text-white/35 border-t border-white/5 pt-4">
              <span>
                Added {formatDate(task.createdAt)} · {timeAgo(task.createdAt)}
              </span>
              {fathomUrl && (
                <a
                  href={fathomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400/60 hover:text-blue-300 transition-colors"
                >
                  View Fathom recording →
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="text-xs px-3 py-1.5 rounded text-white/30 hover:text-white/60 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onComplete(task.id);
                  setOpen(false);
                }}
                className="text-xs px-3 py-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
              >
                Mark done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
