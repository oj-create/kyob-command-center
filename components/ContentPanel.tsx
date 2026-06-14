"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  status: string;
  scheduledDate: string | null;
  platform: string;
};

const STATUS_DOT: Record<string, string> = {
  draft: "var(--warn)",
  scheduled: "var(--fathom)",
  published: "var(--slack)",
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  draft: { bg: "rgba(227,165,58,0.12)", color: "var(--warn)" },
  scheduled: { bg: "var(--fathom-tint)", color: "var(--fathom)" },
  published: { bg: "var(--slack-tint)", color: "var(--slack)" },
};

const TABS = ["All", "Draft", "Scheduled", "Published"];

export default function ContentPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("All");
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        else setFetchError(data.error ?? "Failed to load posts");
      })
      .catch(() => setFetchError("Failed to load posts"));
  }, []);

  const filtered =
    filter === "All" ? posts : posts.filter((p) => p.status === filter.toLowerCase());

  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 16px 12px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <span style={{ fontSize: "13px" }}>✏</span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--tx)", flex: 1 }}>
          Content
        </span>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "2px" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "3px 8px",
                borderRadius: "5px",
                background: filter === tab ? "var(--accent-tint)" : "transparent",
                border: `1px solid ${filter === tab ? "var(--accent-line)" : "transparent"}`,
                color: filter === tab ? "var(--accent-bright)" : "var(--tx-3)",
                fontSize: "10px",
                cursor: "pointer",
                fontWeight: filter === tab ? 500 : 400,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      <div style={{ padding: "8px 0" }}>
        {fetchError ? (
          <div style={{ padding: "12px 16px", fontSize: "12px", color: "var(--tx-3)" }}>
            Posts unavailable
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--tx-3)" }}>
              No {filter.toLowerCase()} posts
            </div>
          </div>
        ) : (
          filtered.map((post) => {
            const dot = STATUS_DOT[post.status] ?? "var(--manual-col)";
            const badge = STATUS_BADGE[post.status] ?? { bg: "var(--manual-tint)", color: "var(--manual-col)" };
            return (
              <div
                key={post.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "9px 16px",
                  borderBottom: "1px solid var(--line)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--panel-2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: dot,
                    flexShrink: 0,
                    marginTop: "5px",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--tx)",
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "4px",
                    }}
                  >
                    {post.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: badge.bg,
                        color: badge.color,
                        fontWeight: 500,
                      }}
                    >
                      {post.status}
                    </span>
                    {post.scheduledDate && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--tx-3)",
                          fontFamily: '"Geist Mono", ui-monospace',
                        }}
                      >
                        {new Date(post.scheduledDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
