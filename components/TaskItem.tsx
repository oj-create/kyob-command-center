"use client";

import { useState } from "react";
import { X, Check, Video } from "lucide-react";

type Task = {
  id: string;
  title: string;
  source: string;
  area: string;
  status: string;
  priority?: string | null;
  createdAt: string;
  meetingId?: string | null;
  notes?: string | null;
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

type Props = { task: Task; onComplete: (id: string) => void };

export default function TaskItem({ task, onComplete }: Props) {
  const [open, setOpen] = useState(false);

  const isBlocking = task.priority === "blocking";
  const srcClass = `src src-${task.source === "fathom" || task.source === "slack" || task.source === "manual" ? task.source : "manual"}`;
  const srcLabel = task.source === "fathom" ? "Fathom" : task.source === "slack" ? "Slack" : "Manual";

  const fathomUrl =
    task.source === "fathom" && task.meetingId
      ? `https://fathom.video/calls/${task.meetingId}`
      : null;

  return (
    <>
      <div
        className={`task${isBlocking ? " is-blocking" : ""}`}
        onClick={() => setOpen(true)}
      >
        <button
          className="task-check"
          onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
          aria-label="Complete task"
        />
        <div className="task-body">
          <div className="task-title">{task.title}</div>
          <div className="task-meta">
            <span className={srcClass}>
              <span className="src-glyph" />
              {srcLabel}
            </span>
            {isBlocking && <span className="task-flag">Blocking</span>}
            <span className="task-age">{timeAgo(task.createdAt)}</span>
          </div>
        </div>
      </div>

      {open && (
        <div className="scrim" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-src">
                <span className={srcClass}>
                  <span className="src-glyph" />
                  {srcLabel}
                </span>
              </span>
              <div className="modal-title">{task.title}</div>
              <button className="modal-x" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            <div className="modal-body">
              <div className="meta-grid">
                {[
                  { label: "Area", value: task.area },
                  { label: "Source", value: srcLabel },
                  { label: "Added", value: formatDate(task.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="meta-cell">
                    <div className="lbl">{label}</div>
                    <div className="meta-val" style={{ textTransform: "capitalize" }}>{value}</div>
                  </div>
                ))}
              </div>

              {task.notes && (
                <>
                  <div className="lbl modal-notes-lbl">Context notes</div>
                  <div className="modal-notes">{task.notes}</div>
                </>
              )}

              {fathomUrl && (
                <div className="modal-rec">
                  <Video />
                  <div>
                    <div className="modal-rec-t">Fathom recording</div>
                    <div className="modal-rec-s">auto-extracted · {timeAgo(task.createdAt)}</div>
                  </div>
                  <a href={fathomUrl} target="_blank" rel="noopener noreferrer">
                    Open recording ↗
                  </a>
                </div>
              )}
            </div>

            <div className="modal-foot">
              <button
                className="btn btn-primary"
                onClick={() => { onComplete(task.id); setOpen(false); }}
              >
                <Check /> Mark done
              </button>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
              {isBlocking && (
                <span className="task-flag" style={{ marginLeft: "auto" }}>Blocking</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
