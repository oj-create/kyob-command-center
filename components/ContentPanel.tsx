"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  status: string;
  scheduledDate: string | null;
  platform: string;
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-yellow-500/20 text-yellow-300",
  scheduled: "bg-blue-500/20 text-blue-300",
  published: "bg-green-500/20 text-green-300",
};

const REPURPOSE_ITEMS = [
  { key: "linkedin", label: "Engage on LinkedIn (comments + replies)" },
  { key: "atlassian", label: "Post to Atlassian Community" },
  { key: "youtube", label: "Post to YouTube Community" },
];

function RepurposeChecklist() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `repurpose-${todayKey}`;

  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  const allDone = checked.size === REPURPOSE_ITEMS.length;

  return (
    <div className={`rounded-lg border p-3 mb-4 ${allDone ? "border-green-500/20 bg-green-500/5" : "border-purple-500/20 bg-purple-500/5"}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-purple-400 uppercase tracking-widest">
          Repurpose by 4pm
        </p>
        {allDone && (
          <span className="text-[10px] text-green-400">Done today</span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {REPURPOSE_ITEMS.map((item) => (
          <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked.has(item.key)}
              onChange={() => toggle(item.key)}
              className="accent-purple-500 flex-shrink-0"
            />
            <span className={`text-xs transition-colors ${checked.has(item.key) ? "line-through text-white/25" : "text-white/70 group-hover:text-white/90"}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ContentPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setFetchError(data.error ?? "Failed to load posts");
        }
      })
      .catch(() => setFetchError("Failed to load posts"));
  }, []);

  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.status === filter);

  return (
    <div className="rounded-xl bg-[#1e1e35] border border-white/10 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-purple-400 uppercase tracking-widest">Content</p>
        <div className="flex gap-1">
          {["all", "draft", "scheduled", "published"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-[10px] px-2 py-0.5 rounded capitalize transition-colors ${
                filter === s
                  ? "bg-purple-500/30 text-purple-300"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <RepurposeChecklist />
      {fetchError ? (
        <p className="text-white/30 text-sm">Posts unavailable</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/30 text-sm">No posts in queue</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-3">
              <p className="text-sm text-white/80 truncate flex-1">{post.title}</p>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                  STATUS_BADGE[post.status] ?? STATUS_BADGE.draft
                }`}
              >
                {post.status}
              </span>
              {post.scheduledDate && (
                <span className="text-[10px] text-white/30 flex-shrink-0">
                  {new Date(post.scheduledDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
