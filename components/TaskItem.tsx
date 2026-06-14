"use client";

import { useState } from "react";

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

const SOURCE_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  fathom: {
    bg: "var(--fathom-tint)",
    color: "var(--fathom)",
    label: "Fathom",
  },
  slack: {
    bg: "var(--slack-tint)",
    color: "var(--slack)",
    label: "Slack",
  },
  manual: {
    bg: "var(--manual-tint)",
    color: "var(--manual-col)",
    label: "Manual",
  },
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

  const src = SOURCE_CONFIG[task.source] ?? SOURCE_CONFIG.manual;
  const isBlocking = task.priority === "blocking";

  const fathomUrl =
    task.source === "fathom" && task.meetingId
      ? `https://fathom.video/calls/${task.meetingId}`
      : null;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          padding: "9px 12px",
          borderRadius: "7px",
          background: isBlocking ? "rgba(236,106,82,0.04)" : "transparent",
          borderLeft: isBlocking ? "2px solid rgba(236,106,82,0.45)" : "2px solid transparent",
          cursor: "pointer",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => {
          if (!isBlocking) (e.currentTarget as HTMLElement).style.background = "var(--panel-2)";
        }}
        onMouseLeave={(e) => {
          if (!isBlocking) (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
        onClick={() => setOpen(true)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(task.id);
          }}
          aria-label="Complete task"
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "3px",
            border: "1px solid var(--line-2)",
            background: "transparent",
            flexShrink: 0,
            marginTop: "3px",
            cursor: "pointer",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            (e.currentTarget as HTMLElement).style.background = "var(--accent-tint)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--line-2)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "12px",
              color: "var(--tx)",
              lineHeight: 1.45,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              marginBottom: "5px",
            }}
          >
            {task.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "4px",
                background: src.bg,
                color: src.color,
                fontWeight: 500,
              }}
            >
              {src.label}
            </span>
            {isBlocking && (
              <span
                style={{
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: "rgba(236,106,82,0.12)",
                  color: "var(--danger)",
                  fontWeight: 500,
                }}
              >
                Blocking
              </span>
            )}
            <span
              style={{
                fontSize: "10px",
                color: "var(--tx-3)",
                fontFamily: '"Geist Mono", ui-monospace',
              }}
            >
              {timeAgo(task.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--line-2)",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "16px 16px 12px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: src.bg,
                  color: src.color,
                  fontWeight: 500,
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                {src.label}
              </span>
              <div
                style={{
                  flex: 1,
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--tx)",
                  lineHeight: 1.4,
                }}
              >
                {task.title}
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  color: "var(--tx-3)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: "-2px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--tx)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--tx-3)"; }}
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "14px 16px" }}>
              {/* Meta grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                {[
                  { label: "Area", value: task.area },
                  { label: "Source", value: src.label },
                  { label: "Added", value: formatDate(task.createdAt) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      background: "var(--elev)",
                    }}
                  >
                    <div style={{ fontSize: "9px", color: "var(--tx-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>
                      {label}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--tx-2)", textTransform: "capitalize" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {task.notes && (
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "9px", color: "var(--tx-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Context notes
                  </div>
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "7px",
                      background: "var(--elev)",
                      border: "1px solid var(--line)",
                      fontSize: "12px",
                      color: "var(--tx-2)",
                      lineHeight: 1.6,
                    }}
                  >
                    {task.notes}
                  </div>
                </div>
              )}

              {/* Fathom recording */}
              {fathomUrl && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "7px",
                    background: "var(--fathom-tint)",
                    border: "1px solid rgba(92,149,247,0.2)",
                    marginBottom: "14px",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "var(--fathom)" }}>◉</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", color: "var(--tx-2)" }}>Fathom recording</div>
                    <div style={{ fontSize: "10px", color: "var(--tx-3)" }}>auto-extracted</div>
                  </div>
                  <a
                    href={fathomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "11px",
                      color: "var(--fathom)",
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    Open recording ↗
                  </a>
                </div>
              )}

              {/* Timestamp */}
              <div style={{ fontSize: "10px", color: "var(--tx-3)", marginBottom: "14px" }}>
                Added {formatDate(task.createdAt)} · {timeAgo(task.createdAt)}
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid var(--line)",
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                onClick={() => { onComplete(task.id); setOpen(false); }}
                style={{
                  padding: "7px 16px",
                  borderRadius: "7px",
                  background: "var(--accent)",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent-deep)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent)"; }}
              >
                ✓ Mark done
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "7px",
                  background: "transparent",
                  border: "1px solid var(--line-2)",
                  color: "var(--tx-3)",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--tx)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--tx-3)"; }}
              >
                Close
              </button>
              {isBlocking && (
                <span
                  style={{
                    marginLeft: "auto",
                    alignSelf: "center",
                    fontSize: "10px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: "rgba(236,106,82,0.12)",
                    color: "var(--danger)",
                  }}
                >
                  Blocking
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
